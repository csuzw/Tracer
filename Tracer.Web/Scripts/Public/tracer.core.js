// TODO: Bug multiple trace root events sometimes appear in the EventTree.
// TODO: Add import complete toast.
// TODO: Ability to save / load state to/from local storage.
// TODO: Split HTTP info into request / response and show headers / content.
// TODO: Display HTTP Response headers too.
// TODO: Fix issue with event info carets not being set correct when expanding / collapsing.
// TODO: Fix issue with event info no event selected overlay not being displayed after state is cleared.

/*
    Pub/Sub implementation inspired by Addy Osmani's JS patterns.

    @usage:
        Event.subscribe('some-event-name', function (event, data) {
            console.log(data); // out puts 'Wee!' to the console.
        });

        Event.publish('some-event-name', 'Wee!');
*/
var Event = {};
(function (event) {
    var topics = {};
    var subscriberId = -1;

    event.subscribe = function (topic, action) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        var token = (++subscriberId).toString();
        topics[topic].push({
            token: token,
            action: action
        });
        return token;
    };

    event.publish = function (topic, args) {
        if (!topics[topic]) {
            return false;
        }
        setTimeout(function () {
            var subscribers = topics[topic];
            var subscriberCount = subscribers ? subscribers.length : 0;

            while (subscriberCount--) {
                subscribers[subscriberCount].action(topic, args);
            }
        }, 0);
        return true;
    };

    event.unsubscribe = function (token) {
        for (var topic in topics) {
            if (topics[topic]) {
                for (var i = 0, j = topics[topic].length; i < j; i++) {
                    if (topics[topic][i].token === token) {
                        topics[topic].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };

}(Event));


var Tracer = Tracer || {};

Tracer.Debug = (function () {

    var isEnabled = true;

    return {
        write: function (output) {
            if (isEnabled) {
                console.log(output);
            }
        },
        enable: function () {
            isEnabled = true;
        },
        disable: function () {
            isEnabled = false;
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
    var maxRetryCount = 50;
    var processedCount = 0;
    var orphanCount = 0;
    var receivedCount = 0;

    function startQueue() {
        Tracer.Debug.write('[Tracer.EventQueue]: Starting...');

        queueProcessor = setInterval(function () {

            for (var i = 0; i < eventQueue.length; i++) {

                var currentEvent = eventQueue[i];

                if (currentEvent.retryCount >= maxRetryCount) {
                    eventQueue.splice(i, 1);
                    i--;
                    orphanCount++;
                    Event.publish('event-queue-length-updated', eventQueue.length);
                    continue;
                }

                processEvent(currentEvent, i,
                    function () {
                        eventQueue.splice(i, 1);
                        i--;
                        processedCount++;
                        Event.publish('event-queue-length-updated', eventQueue.length);
                    },
                    function (event) {
                        eventStore.saveEvent(event);
                    });

                currentEvent.retryCount++;
            }
        }, queueIntervalInMiliseconds);

        Tracer.Debug.write('[Tracer.EventQueue]: Started.');
    };

    function stopQueue() {
        Tracer.Debug.write('[Tracer.EventQueue]: Stopping...');

        clearInterval(queueProcessor);

        Tracer.Debug.write('[Tracer.EventQueue]: Stopped.');
    };

    function processEvent(event, queueIndex, onRemoveCallback, onSaveCallback) {

        if (event.TraceEvent == "OnMethodEntry") {

            var formattedEvent = formatEvent(event);

            if (!event.ParentMethodId) {

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
                    Tracer.Debug.write('[Tracer.EventQueue]: Parent event not found, parent method id: ' + event.ParentMethodId);
                    if (formattedEvent.retryCount == maxRetryCount) {
                        formattedEvent.retryCount = 0;
                        formattedEvent.ParentMethodId = null;
                    }
                }
            }

        } else {

            var entryEvent = eventStore.search("MethodId", event.MethodId);

            if (entryEvent) {

                if (event.TraceEvent == "OnMethodSuccess") {
                    entryEvent.IsSuccess = true;
                    entryEvent.Status = "Success";
                    entryEvent.OnSuccessEvent = event;
                    entryEvent.TimeTakenInMilliseconds += event.TimeTakenInMilliseconds;

                    onRemoveCallback();
                    onSaveCallback(entryEvent);

                    Event.publish('state-event-updated', entryEvent);
                }

                if (event.TraceEvent == "OnMethodException") {
                    entryEvent.IsSuccess = false;
                    entryEvent.Status = "Failed";
                    entryEvent.OnExceptionEvent = event;
                    entryEvent.TimeTakenInMilliseconds += event.TimeTakenInMilliseconds;

                    onRemoveCallback();
                    onSaveCallback(entryEvent);

                    Event.publish('state-event-updated', entryEvent);
                }

                if (event.TraceEvent == "HttpRequest") {
                    entryEvent.HttpRequest = event;

                    onRemoveCallback();
                    onSaveCallback(entryEvent);

                    Event.publish('state-event-updated', entryEvent);
                }

                if (event.TraceEvent == "HttpResponse") {

                    entryEvent.HttpResponse = event;

                    onRemoveCallback();
                    onSaveCallback(entryEvent);

                    Event.publish('state-event-updated', entryEvent);
                }

                if (event.TraceEvent == "Log") {

                    Tracer.Debug.write("[Tracer.EventQueue]: Log event recieved:");
                    Tracer.Debug.write(event);

                    entryEvent.LogEvents.push(event);

                    onRemoveCallback();
                    onSaveCallback(entryEvent);

                    Event.publish('state-event-updated', entryEvent);
                }

            } else {
                Tracer.Debug.write('[Tracer.EventQueue]: Entry event not found method id: ' + event.MethodId);
            }
        }
    };

    function addEventToQueue(event) {
        eventStore.saveRawEvent(event);

        event.retryCount = 0;

        eventQueue.push(event);

        receivedCount++;

        Event.publish('event-queue-length-updated', eventQueue.length);
    };

    function queueLogEvent(logEvent) {
        logEvent.TraceEvent = "Log";

        addEventToQueue(logEvent);
    };

    function queueHttpEvent(httpEvent) {
        if (httpEvent.HttpMethod) {
            httpEvent.TraceEvent = "HttpRequest";
        } else if (httpEvent.HttpStatusCode) {
            httpEvent.TraceEvent = "HttpResponse";
        } else {
            httpEvent.TraceEvent = "Unknown";
        }

        addEventToQueue(httpEvent);
    };

    function formatEvent(event) {
        return {
            TraceId: event.TraceId,
            ParentMethodId: event.ParentMethodId,
            MethodId: event.MethodId,
            MethodName: event.MethodName,
            Timestamp: new Date(event.Timestamp),
            TimeTakenInMilliseconds: event.TimeTakenInMilliseconds,
            MachineName: event.MachineName,
            OnEntryEvent: event,
            OnSuccessEvent: null,
            OnExceptionEvent: null,
            HttpRequest: null,
            HttpResponse: null,
            LogEvents: [],
            IsSuccess: false,
            Status: "Pending",
            Children: []
        };
    };

    Event.subscribe('tracing-start', function () {
        startQueue();
    });

    Event.subscribe('tracing-stop', function () {
        stopQueue();
    });

    return {
        start: startQueue,
        stop: stopQueue,
        queueEvent: addEventToQueue,
        queueHttpEvent: queueHttpEvent,
        queueLogEvent: queueLogEvent,
        getStats: function () {
            return "Total events received: " + receivedCount + ", processed: " + processedCount + ", orphans: " + orphanCount;
        }
    };

})();

Tracer.EventStream = (function () {

    var eventQueue = Tracer.EventQueue;

    var traceHub = $.connection.traceHub.client;
    var logHub = $.connection.logHub.client;

    // Handle events received from the SignalR hubs.
    traceHub.broadcastMessage = onEventReceived;
    traceHub.broadcastHttpRequestMessage = onHttpEventReceived;
    traceHub.broadcastHttpResponseMessage = onHttpEventReceived;
    logHub.broadcastLogMessage = onLogEventReceived;

    var hub = $.connection.hub;
    var isStreaming = false;

    Event.subscribe('event-stream-toggle', function () {
        if (isStreaming) {
            disconnectFromEventStream();
        } else {
            connectToEventStream();
        }
    });

    Event.subscribe('tracing-start', function (e, data) {
        connectToEventStream();
    });

    Event.subscribe('tracing-stop', function (e, data) {
        disconnectFromEventStream();
    });

    function onEventReceived(event) {
        Tracer.Debug.write("[Tracer.EventStream]: Event received");
        Tracer.Debug.write(event);
        eventQueue.queueEvent(event);
    };

    function onLogEventReceived(logEvent) {
        Tracer.Debug.write("[Tracer.EventStream]: Log event received");
        Tracer.Debug.write(logEvent);
        eventQueue.queueLogEvent(logEvent);
    };

    function onHttpEventReceived(httpEvent) {
        Tracer.Debug.write("[Tracer.EventStream]: HTTP event received");
        Tracer.Debug.write(httpEvent);
        eventQueue.queueHttpEvent(httpEvent);
    };

    function connectToEventStream() {
        Tracer.Debug.write("[Tracer.EventStream]: Connecting to event stream...");
        hub.start().done(function () {
            isStreaming = true;
            Event.publish('event-stream-started');
            Tracer.Debug.write("[Tracer.EventStream]: Connected to event stream.");
        });
    };

    function disconnectFromEventStream() {
        Tracer.Debug.write("[Tracer.EventStream]: Disconnecting from event stream...");
        hub.disconnected(function () {
            isStreaming = false;
            Event.publish('event-stream-stopped');
            Tracer.Debug.write("[Tracer.EventStream]: Disconnected from event stream.");
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

Tracer.Utils.formatDate = function (date) {
    function addZero(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    return addZero(addZero(date.getDate()) + "/" + date.getMonth() + 1) + "/" + date.getFullYear() + " " +
           addZero(date.getHours()) + ":" + addZero(date.getMinutes()) + ":" + addZero(date.getMinutes()) + ":" + addZero(date.getMilliseconds());
}