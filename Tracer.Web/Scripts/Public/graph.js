// TODO: Fix event info panel default state.
// TODO: disable navbar controls when tracing is not enabled.
// TODO: visualise network hops.
// TODO: Bug multiple trace root events sometimes appear in the EventTree.
// TODO: Remove the "Graph" namespace.
// TODO: Add navbar Errors button click event to show errors.
// TODO: Add more info to event summary.
// TODO: Add timestamp column to table.
// TODO: Add download application state link
// TODO: Add import raw state feature.

var Tracer = Tracer || {};

Tracer.Debug = (function () {

    var isEnabled = true;

    return {
        write: function (output) {
            if (isEnabled) {
                console.log(output);
            }
        }
    };
})();

Tracer.EventStore = (function () {
    var rawEvents = [];
    var events = [];

    Event.subscribe('state-clear', function () {
        events = [];
        Event.publish('state-cleared');
    });

    function getEvents() {
        return events;
    };

    function getRawEvents() {
        return rawEvents;
    };

    function storeRawEvent(event) {
        rawEvents.push(event);
    };

    function saveEvent(event) {
        var existingEvent = searchFor('MethodId', event.MethodId);
        if (existingEvent != null) {
            existingEvent = event;
        } else {
            createEvent(event);
        }
    };

    function createEvent(event) {
        events.push(event);
    };
    function findEvent(key, valueToMatch) {
        for (var i = 0; i < events.length; i++) {
            if (events[i][key] == valueToMatch) {
                return events[i];
            }
        }
        return null;
    };

    function searchFor(key, valueToMatch) {
        for (var i = 0; i < events.length; i++) {
            var result = searchEventTree(events[i], key, valueToMatch);

            if (result != null) {
                return result;
            }
        }

        return null;
    }

    function searchEventTree(event, key, valueToMatch) {
        if (event[key] == valueToMatch) {
            return event;
        } else if (event.Children != null) {
            var result = null;
            for (var i = 0; result == null && i < event.Children.length; i++) {
                result = searchEventTree(event.Children[i], key, valueToMatch);
            }
            return result;
        }
        return null;
    }

    return {
        getEvents: getEvents,
        getRawEvents: getRawEvents,
        saveEvent: saveEvent,
        saveRawEvent: storeRawEvent,
        findEvent: findEvent,
        search: searchFor
    };

})();


Tracer.EventQueue = (function () {

    var eventStore = Tracer.EventStore;

    var eventQueue = [];
    var queueIntervalInMiliseconds = 1000;
    var queueProcessor = null;
    var maxRetryCount = 3;

    startQueue();

    function startQueue() {
        Tracer.Debug.write('[Tracer.EventQueue] Starting...');

        queueProcessor = setInterval(function () {
            
            for (var i = 0; i < eventQueue.length; i++) {

                var currentEvent = eventQueue[i];
                
                if (currentEvent.retryCount >= maxRetryCount) {
                    eventQueue.splice(i, 1);
                    i--;
                    Event.publish('event-queue-length-updated', eventQueue.length);
                    continue;
                }

                processEvent(currentEvent, i,
                    function () {
                        eventQueue.splice(i, 1);
                        i--;
                        Event.publish('event-queue-length-updated', eventQueue.length);
                    },
                    function (event) {
                        eventStore.saveEvent(event);
                    });

                currentEvent.retryCount++;
            }
        }, queueIntervalInMiliseconds);

        Tracer.Debug.write('[Tracer.EventQueue] Started.');
    };

    function stopQueue() {
        Tracer.Debug.write('[Tracer.EventQueue] Stopping...');

        clearInterval(queueProcessor);

        Tracer.Debug.write('[Tracer.EventQueue] Stopped.');
    };

    function processEvent(event, queueIndex, onRemoveCallback, onSaveCallback) {

        if (event.TraceEvent == "OnMethodEntry") {

            var formattedEvent = formatEvent(event);

            if (event.ParentMethodId.length == 0) {

                onRemoveCallback();
                onSaveCallback(formattedEvent);
                Event.publish('state-event-received', formattedEvent);

            } else {

                var parentEvent = eventStore.search('MethodId', event.ParentMethodId);

                if (parentEvent) {
                    parentEvent.Children.push(formattedEvent);
                    onRemoveCallback();
                    onSaveCallback(parentEvent);

                    Event.publish('state-event-received', formattedEvent);

                } else {
                    Tracer.Debug.write('[Tracer.EventQueue] Parent event not found, parent method id: ' + event.ParentMethodId);
                }
            }

        } else {

            var entryEvent = eventStore.search("MethodId", event.MethodId);

            if (entryEvent) {


                if (event.TraceEvent == "OnMethodSuccess") {
                    entryEvent.IsSuccess = true;
                    entryEvent.Status = "Success";
                    entryEvent.OnSuccessEvent = event;
                }

                if (event.TraceEvent == "OnMethodException") {
                    entryEvent.IsSuccess = false;
                    entryEvent.Status = "Failed";
                    entryEvent.OnExceptionEvent = event;
                }

                entryEvent.TimeTakenInMilliseconds += event.TimeTakenInMilliseconds;

                onRemoveCallback();
                onSaveCallback(entryEvent);

                Event.publish('state-event-updated', entryEvent);
            } else {
                Tracer.Debug.write('[Tracer.EventQueue] Entry event not found method id: ' + event.MethodId);
            }
        }
    };

    function addEventToQueue(event) {
        event.retryCount = 0;

        eventQueue.push(event);
        
        Event.publish('event-queue-length-updated', eventQueue.length);
    };

    function formatEvent(event) {
        return {
            TraceId: event.TraceId,
            ParentMethodId: event.ParentMethodId,
            MethodId: event.MethodId,
            MethodName: event.MethodName,
            TimeTakenInMilliseconds: event.TimeTakenInMilliseconds,
            OnEntryEvent: event,
            OnSuccessEvent: null,
            OnExceptionEvent: null,
            IsSuccess: false,
            Status: "Pending",
            Children: []
        };
    };

    return {
        start: startQueue,
        stop: stopQueue,
        queueEvent: addEventToQueue
    };

})();

Tracer.EventStream = (function () {

    var eventStore = Tracer.EventStore;
    var eventQueue = Tracer.EventQueue;

    var traceHub = $.connection.traceHub.client;
    traceHub.broadcastMessage = onEventReceived;

    var hub = $.connection.hub;
    var isStreaming = false;

    Event.subscribe('event-stream-toggle', function () {
        if (isStreaming) {
            disconnectFromEventStream();
        } else {
            connectToEventStream();
        }
    });

    function onEventReceived(event) {
        eventStore.saveRawEvent(event);
        eventQueue.queueEvent(event);
    };

    function connectToEventStream() {
        Tracer.Debug.write("Connecting to event stream...");
        hub.start().done(function () {
            isStreaming = true;
            Event.publish('event-stream-started');
            Tracer.Debug.write("Connected to event stream.");
        });
    };

    function disconnectFromEventStream() {
        Tracer.Debug.write("Disconnecting from event stream...");
        hub.disconnected(function () {
            isStreaming = false;
            Event.publish('event-stream-stopped');
            Tracer.Debug.write("Disconnected from event stream.");
        });
        hub.stop();
    };

    // public api
    return {
        connect: connectToEventStream,
        disconnect: disconnectFromEventStream
    };
})();

Tracer.Utils = {};
Tracer.Utils.isJson = function (object) {
    try {
        var value = object;
        var length = value.length - 1;
        if (value[0] == "{" && value[length] == "}" || value[0] == "[" && value[length] == "]") {
            return true;
        }
    }
    catch (e) {

    }
    return false;
};

var Tracer = Tracer || {};
Tracer.UI = {};

Tracer.UI.EventStreamNotification = (function () {

    Event.subscribe('event-stream-started', function () {
        var overlay = $('#loading-overlay');
        overlay.hide();
    });

})();

Tracer.UI.EventTable = (function () {

    var idPrefix = 'event_table_row_id_';
    var table = null;
    var dataTable = null;
    var lastSelectedEvent = null;


    Event.subscribe('state-event-received', function (e, event) {
        dataTable.row.add(event).draw(false);
    });

    Event.subscribe('state-event-updated', function (e, event) {
        var row = dataTable.row('#' + idPrefix + event.MethodId);
        var data = row.data();
        data.Status = event.Status;
        data.TimeTakenInMilliseconds = event.TimeTakenInMilliseconds;

        row.data(data);

    });

    Event.subscribe('state-cleared', function () {
        dataTable
            .clear()
            .draw();
    });

    Event.subscribe('event-stream-started', function () {
        var tableData = {
            columns: [
                {
                    text: 'Method Name',
                    type: 'text'
                },
                {
                    text: 'Time Taken',
                    type: 'text'
                },
                {
                    text: 'Status',
                    type: 'text'
                }
            ],
            rows: [],
            emptyRowText: 'No events to display.'
        };

        table = UI.Table.create(tableData);

        $('#event-table-container-body').html(table);

        dataTable = table.DataTable({
            data: [],
            columns: [
                { data: 'MethodName' },
                { data: 'TimeTakenInMilliseconds' },
                { data: 'Status' }
            ],
            "order": [
                [1, "desc"]
            ],
            "scrollY": "270px",
            "scrollCollapse": true,
            "iDisplayLength": 50,
            "fnCreatedRow": onRowAdded,
            "language": {
                "lengthMenu": "Show _MENU_ events",
                "emptyTable": "No events to display.",
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ events",
                "sInfoEmpty": ""
            }
        });

        dataTable.on('click', 'tr', function () {

            var event = dataTable.row(this).data();

            if (lastSelectedEvent) {
                Event.publish('event-unselected', lastSelectedEvent);
            }

            Event.publish('event-selected', event);
            lastSelectedEvent = event;

            var row = $(this);
            if (row.hasClass('selected')) {
                row.removeClass('selected');
            }
            else {
                dataTable.$('tr.selected').removeClass('selected');
                row.addClass('selected');
            }
        });
    });

    Event.subscribe('state-search', function(e, query) {
        dataTable.search(query).draw();
    });

    Event.subscribe('event-selected', function(e, event) {
        $('#' + idPrefix + event.MethodId).addClass('selected');
        lastSelectedEvent = event;
    });

    Event.subscribe('event-unselected', function (e, event) {
        dataTable.$('tr.selected').removeClass('selected');
    });

    function onRowAdded(row, data, index) {
        $(row).attr('id', idPrefix + data.MethodId);
    };

})();

// TODO: UI.ToggleTracing - Toggle should be notified if starting trace fails and a notification displayed.
Tracer.UI.ToggleTracing = (function () {

    $(function () {

        var toggleButton = $('#toggle-tracing-state');

        toggleButton.on('click', function () {
            Event.publish('event-stream-toggle');
        });

        Event.subscribe('event-stream-stopped', function () {
            toggleButton.text('Start Tracing');
        });

        Event.subscribe('event-stream-started', function () {
            toggleButton.text('Stop Tracing');
        });

    });

})();

Tracer.UI.EvenStateDropDown = (function () {

    var eventCount = 0;
    var errorCount = 0;

    $(function () {
        var eventCountBadge = $('#state-dropdown-event-count-badge');

        Event.subscribe('state-event-received', function(e, event) {
            eventCount++;
            eventCountBadge.text(eventCount);
        });
        
        Event.subscribe('state-cleared', function () {
            eventCount = 0;
            eventCountBadge.text(eventCount);
            errorCount = 0;
            errorCountBadge.text(errorCount);
        });

        var errorCountBadge = $('#state-event-errors-length');

        Event.subscribe('state-event-updated', function(e, event) {
            if (!event.IsSuccess) {
                errorCount++;
                errorCountBadge.text(errorCount);
            }
        });

        var clearState = $('#state-dropdown-clear-state');
        clearState.on('click', function () {
            Event.publish('state-clear');
        });

        var toggleDropdown = $('#state-dropdown-toggle');
        var downloadStateItem = $('#state-dropdown-download-state-item');

        toggleDropdown.on('click', function () {
            // HURMURGURD COUPLING!
            var downloadStateLink = UI.Hyperlink.createJsonDownloadLink('Download State', Tracer.EventStore.getRawEvents());
            downloadStateItem.html(downloadStateLink);
        });
    });

})();

Tracer.UI.EventQueueLength = (function() {

    var queueLengthBadge = null;

    $(function() {
        queueLengthBadge = $('#state-event-queue-length');
    });

    Event.subscribe('event-queue-length-updated', function(e, queueLength) {
        queueLengthBadge.text(queueLength);
    });

})();

Tracer.UI.EventTree = (function () {

    var eventStore = Tracer.EventStore;

    var idPrefix = "tree_node_id_";
    var body = null;
    var expand = null;
    var collapse = null;

    $(function () {
        body = $('#event-tree-container-body');
        expand = $('#event-tree-expand');
        collapse = $('#event-tree-collapse');

        createTree();

        expand.on('click', function() {
            body.jstree('open_all');
        });

        collapse.on('click', function () {
            body.jstree('close_all');
        });
    });

    function createTree() {
        body.jstree({
            "core": {
                "check_callback": true,
                "data": [],
                'themes': {
                    'name': 'proton',
                    'responsive': true
                }
            },
            "plugins": [
                "search"
            ]
        });

        var lastSelectedEvent = null;

        body.on("select_node.jstree", function(e, selected) {
            var data = selected.node.data;
            if (data) {
                var event = eventStore.search('MethodId', data.MethodId);

                if (lastSelectedEvent && data.MethodId != lastSelectedEvent.MethodId) {
                    Event.publish('event-unselected', lastSelectedEvent);
                }

                lastSelectedEvent = event;

                Event.publish('event-selected', event);
            }
        });

        body.on('deselect_all.jstree', function () {
            if (lastSelectedEvent) {
                Event.publish('event-unselected', lastSelectedEvent.MethodId);
            }
        });
    };

    function findNodeById(id) {
        return body.jstree(true).get_node('#' + idPrefix + id);
    };

    function addEventToTree(event) {

        var jsTree = body.jstree(true);

        var node = {
            "id": idPrefix + event.MethodId,
            "text": event.MethodName,
            "data": {
                MethodId: event.MethodId  
            },
            "icon": "glyphicon glyphicon glyphicon-time"
        };

        var parentNode = findNodeById(event.ParentMethodId);

        if (parentNode) {
            jsTree.create_node(parentNode, node, "last", function () {

            });
        } else {

            var traceRootNode = {
                "id": idPrefix + event.TraceId,
                "parent": "#",
                "text": "Trace " + event.TraceId,
                "icon": "glyphicon glyphicon-map-marker"
            };

            jsTree.create_node('#', traceRootNode, "last", function (traceNode) {
                jsTree.create_node(traceNode, node, "last"); 
            });
        }
    };

    Event.subscribe('state-search', function (e, query) {
        if (query.length > 0) {
            body.jstree(true).search(query);
        } else {
            body.jstree('clear_search');
        }
    });

    Event.subscribe('state-event-received', function (e, event) {
        addEventToTree(event);
    });

    Event.subscribe('state-event-updated', function (e, event) {

        var node = findNodeById(event.MethodId);
        var icon = $('#' + idPrefix + event.MethodId + ' a > .jstree-icon');

        // This makes me q_q touching the icon twice
        // but jstree is struggling with refreshing the node reliably.
        if (node) {
            if (event.IsSuccess) {
                node.text += " (Success)";
                node.icon = 'glyphicon glyphicon-ok';
            } else {
                node.text += " (Failed)";
                node.icon = 'glyphicon glyphicon-remove';
            }
        }

        if (icon) {
            icon.removeClass('glyphicon-time');
            if (event.IsSuccess) {
                icon.addClass('glyphicon-ok');
            } else {
                icon.addClass('glyphicon-remove');
            }
        }
    });

    Event.subscribe('state-cleared', function () {
        body.jstree(true).destroy();
        createTree();
        expand.parent().removeClass('active');
        collapse.parent().removeClass('active');
    });

    Event.subscribe('event-selected', function (e, event) {
        // we could use jstree('select_node') here but you end with an 
        // infinite series of event-selected / event-unselected events
        // between the EventTree and EventTable
        $('#' + idPrefix + event.MethodId + ' > .jstree-anchor').addClass('jstree-clicked');
    });

    Event.subscribe('event-unselected', function (e, event) {
        $('#' + idPrefix + event.MethodId + ' > .jstree-anchor').removeClass('jstree-clicked');
    });

})();

Tracer.UI.EventInfo = {};

Tracer.UI.EventInfo.SummaryTab = (function() {

    var eventStore = Tracer.EventStore;

    var summaryTab;
    var methodName;
    var parentMethodName;
    var timeTaken;
    var status;

    $(function() {
        summaryTab = $('#event-info-summary-tab');
        methodName = $('#event-info-summary-method-name');
        parentMethodName = $('#event-info-summary-parent-method-name');
        timeTaken = $('#event-info-summary-time-taken');
        status = $('#event-info-summary-status');
    });

    Event.subscribe('event-selected', function(e, event) {
        
        methodName.text(event.MethodName);
        timeTaken.text(event.TimeTakenInMilliseconds);
        status.text(event.IsSuccess == true ? "Success" : "Failed");

        var parentEvent = eventStore.search('MethodId', event.ParentMethodId);

        if (parentEvent) {
            parentMethodName.text(parentEvent.MethodName);
        }
    });

})();

Tracer.UI.EventInfo.ErrorsTab = (function() {

    var errorTab;
    var stackTrace;

    $(function() {
        errorTab = $('#event-info-error-tab');
        stackTrace = $('#event-info-error-stack-trace');
    });

    Event.subscribe('event-selected', function (e, event) {
        if (event.OnExceptionEvent) {
            stackTrace.text(event.OnExceptionEvent.Exception);
        }
    });

})();

Tracer.UI.EventInfo.ArgumentsTab = (function () {

    var argumentsTab;

    $(function () {
        argumentsTab = $('#event-info-arguments-tab');
    });

    Event.subscribe('event-selected', function (e, event) {
        argumentsTab.JSONView(event.OnEntryEvent.Arguments);
    });

})();

Tracer.UI.EventInfo.ReturnedValueTab = (function () {

    var returnedValueTab;

    $(function () {
        returnedValueTab = $('#event-info-return-value-tab');
    });

    Event.subscribe('event-selected', function (e, event) {
        if (event.OnSuccessEvent) {
            if (Tracer.Utils.isJson(event.OnSuccessEvent.ReturnValue)) {
                returnedValueTab.JSONView(event.OnSuccessEvent.ReturnValue);
            } else {
                returnedValueTab.text(event.OnSuccessEvent.ReturnValue);
            }
        }
    });

})();

Tracer.UI.StateSearch = (function() {

    var input;
    var timeout = false;

    $(function() {
        input = $('#state-search-input');

        input.keyup(function () {

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(function () {

                var query = input.val();

                Tracer.Debug.write('[StateSearch] query: ' + query);

                Event.publish('state-search', query);

            }, 250);
        });
    });

})();