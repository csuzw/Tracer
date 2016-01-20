
var Graph = (function() {

    var settings = {
        graphElement: null,
        nodeInfoClass: 'node-info'
    };
    return {
        setup: function(graphElementId) {

            Graph.Debug.write("Loading chart packages...");

            var graphElement = document.getElementById(graphElementId);

            if (graphElement == null) {
                throw "Graph element with id '" + graphElementId + "' not found";
            }

            settings.graphElement = graphElement;

            google.charts.load('current', { packages: ["orgchart"] });

            Graph.EventStream.connect();
            Graph.Renderer.start();
        },
        onGraphReady: function() {
            Graph.Debug.write("Rendering complete.");

            $('.' + settings.nodeInfoClass).on('click', function() {
                var info = $(this);
                var methodId = info.data('method-id');
                var event = Graph.State.findEvent("MethodId", methodId);
                Graph.Debug.write(event);
                Graph.UI.EventInfo.render(event);
            });
        },
        onEventReceived: function(event) {
            Graph.Debug.write('New event received from stream.');
            // todo: check if event already exists
            Graph.State.addEvent(event);
            // todo: sort events
        },
        getSettings: function() {
            return settings;
        }
    };
})();

Graph.State = (function() {

    var events = [];

    function getEvents() {
        return events;
    };

    function addEvent(event) {
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

    return {
        getEvents: getEvents,
        addEvent: addEvent,
        findEvent: findEvent
    };

})();

Graph.Renderer = (function() {

    var renderCycle;

    function startRenderCycle() {
        renderCycle = setInterval(function () {
            render();
        }, 3000);
        Graph.Debug.write("Renderer started.");
    };

    function stopRenderCycle() {
        clearInterval(renderCycle);
        Graph.Debug.write("Renderer stopped.");
    };

    function handleMethodSuccessEvent(event) {
        var parentEvent = Graph.State.findEvent("ParentMethodId", event.ParentMethodId);
        parentEvent.TimeTakenInMilliseconds = event.TimeTakenInMilliseconds;
        parentEvent.ReturnValue = event.ReturnValue;
    };

    function handleMethodExceptionEvent(event) {
        var parentEvent = Graph.State.findEvent("ParentMethodId", event.ParentMethodId);
        parentEvent.Exception = event.Exception;
    };

    function render() {

        var events = Graph.State.getEvents();

        if (events.length == 0) {
            return;
        }

        Graph.Debug.write("Rendering graph...");

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'ToolTip');

        for (var i = 0; i < events.length; i++) {
            var event = events[i];

            if (event.TraceEvent == "OnMethodSuccess") {
                handleMethodSuccessEvent(event);
                continue;
            }

            if (event.TraceEvent == "OnMethodException") {
                handleMethodExceptionEvent(event);
                continue;
            }

            data.addRows([
                Graph.Node.create(event)
            ]);
        }

        var graphElement = Graph.getSettings().graphElement;
        
        var chart = new google.visualization.OrgChart(graphElement);
        google.visualization.events.addListener(chart, 'ready', Graph.onGraphReady);
        chart.draw(data, { allowHtml: true });
    };

    return {
        start: startRenderCycle,
        stop: stopRenderCycle
    };

})();

Graph.EventStream = (function() {

    var traceHub = $.connection.traceHub.client;
    traceHub.broadcastMessage = Graph.onEventReceived;

    var hub = $.connection.hub;

    // public
    return {
        connect: function() {
            Graph.Debug.write("Connecting to event stream...");
            hub.start().done(function () {
                Graph.Debug.write("Connected to event stream.");
            });
        },
        disconnect: function() {
            Graph.Debug.write("Disconnecting from event stream...");
            hub.disconnected(function () {
                Graph.Debug.write("Disconnected from event stream.");
            });
            hub.stop();
        }
    };
})();

Graph.Node = {};
Graph.Node.create = function (event) {
    var template = "<div>" +
        event.MethodName + "<br/>" +
        "Time taken: " + event.TimeTakenInMilliseconds + "ms <br/>" +
        "<a href='#' class='btn btn-primary " + Graph.getSettings().nodeInfoClass + "' data-method-id='" + event.MethodId + "'>Info</a></div>";

    var nameColumn = {
        v: event.MethodId,
        f: template
    };

    var parentColumn = event.ParentMethodId;
    var tooltipColumn = '';

    return [nameColumn, parentColumn, tooltipColumn];
};

Graph.Debug = (function() {

    var isEnabled = true;

    //public 
    return {
        write: function (output) {
            if (isEnabled) {
                console.log(output);
            }
        }
    };
})();