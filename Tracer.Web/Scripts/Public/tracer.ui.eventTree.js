Tracer.UI = Tracer.UI || {};
Tracer.UI.EventTree = (function () {

    var eventStore = Tracer.EventStore;

    var idPrefix = "tree_node_id_";
    var body;
    var expand;
    var collapse;
    var lastSelectedEvent = null;

    $(function () {
        body = $('#event-tree-container-body');
        expand = $('#event-tree-expand');
        collapse = $('#event-tree-collapse');

        createTree();

        expand.on('click', function () {
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
                "search",
                "httpRequestLabel"
            ]
        });

        body.on("select_node.jstree", function (e, selected) {
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

        body.on('changed.jstree', function (e, data) {
            console.log('something change!');
            console.log(data);
        });
    };

    function selectNode(nodeId) {
        body.jstree('select_node', nodeId);
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
                MethodId: event.MethodId,
                HttpRequest: event.HttpRequest,
                HttpResponse: event.HttpResponse
            },
            "icon": "glyphicon glyphicon glyphicon-time"
        };

        var parentNode = findNodeById(event.ParentMethodId);

        if (parentNode) {
            jsTree.create_node(parentNode, node, "last", function () {
                body.jstree("open_all");
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
        if (node) {

            if (event.IsSuccess) {
                node.text = event.MethodName + " (Success)";
                node.icon = 'glyphicon glyphicon-ok';
            } else {
                node.text = event.MethodName + " (Failed)";
                node.icon = 'glyphicon glyphicon-remove';
            }

            if (event.HttpRequest) {
                node.data.HttpRequest = event.HttpRequest;
            }

            if (event.HttpResponse) {
                node.data.HttpResponse = event.HttpResponse;
            }

            body.jstree(true).redraw_node('#' + idPrefix + event.MethodId);
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

        selectNode('#' + idPrefix + event.MethodId);

    });

    Event.subscribe('event-unselected', function (e, event) {
        $('#' + idPrefix + event.MethodId + ' > .jstree-anchor').removeClass('jstree-clicked');
    });

})();