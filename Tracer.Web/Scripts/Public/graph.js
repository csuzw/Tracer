var Graph = (function () {

    var _state = {
        events: []
    };
    var _settings = {
        nodeInfoClass: 'node-info'
    };

    // private
    function setupGraph(graphElementId) {

        Graph.Debug.write("Loading chart packages...");

        var graphElement = document.getElementById(graphElementId);

        if (graphElement == null) {
            throw "Graph element with id '" + graphElementId + "' not found";
        }
        _state.graphElement = graphElement;
    
        google.charts.load('current', { packages: ["orgchart"] });

        startRenderCycle();
    };
 
    function render () {

        Graph.Debug.write("Rendering graph...");

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'ToolTip');

        // todo: iterate events and add row to data..
        for (var i = 0; i < _state.events.length; i++) {
            var event = _state.events[i];

            // todo: split into separate methods..
            if (event.TraceEvent == "OnMethodSuccess") {
                var parentEvent = findEvent("ParentMethodId", event.ParentMethodId);

                parentEvent.TimeTakenInMilliseconds = event.TimeTakenInMilliseconds;
                parentEvent.ReturnValue = event.ReturnValue;
                continue;
            }

            // todo: split into separate methods..
            if (event.TraceEvent == "OnMethodException") {
                var parentEvent = findEvent("ParentMethodId", event.ParentMethodId);
                parentEvent.Exception = event.Exception;
                continue;
            }

            var node = Graph.Node.create(event);

            data.addRows([
                node
            ]);
        }

        var chart = new google.visualization.OrgChart(_state.graphElement);
        google.visualization.events.addListener(chart, 'ready', onGraphReady);

        chart.draw(data, { allowHtml: true });
    };

    function onGraphReady() {
        Graph.Debug.write("Rendering complete.");

        $('.' + _settings.nodeInfoClass).on('click', function () {
            var info = $(this);
            var event = findEvent("MethodId", info.data('method-id'));
            Graph.Debug.write(event);
            Graph.UI.EventInfo.render(event);
        });
    };

    function findEvent(key, valueToMatch) {
        for (var i = 0; i < _state.events.length; i++) {
            if (_state.events[i][key] == valueToMatch) {
                return _state.events[i];
            }
        }
        return null;
    };

    function startRenderCycle() {
        
        var renderLoop = setInterval(function () {
            render();
        }, 3000);
        
    };
    
    // public
    return {
        setup: function (graphElementId) {
            setupGraph(graphElementId);
        },
        getSettings: function() {
            return _settings;
        },
        onEventReceived: function (event) {
            Graph.Debug.write('New event received from stream.');
            // todo: check if event already exists
            _state.events.push(event);
            // todo: sort events
        },
        getState: function() {
            return _state;
        },
        startRendering: function() {
            startRenderCycle();
        },
        stopRendering: function() {
            
        }
    };

})();

Graph.EventStream = (function() {

    var _traceHub = $.connection.traceHub.client;
    _traceHub.broadcastMessage = Graph.onEventReceived;

    var _hub = $.connection.hub;

    // public
    return {
        connect: function() {
            Graph.Debug.write("Connecting to event stream...");
            _hub.start().done(function () {
                Graph.Debug.write("Connected to event stream.");
            });
        },
        disconnect: function() {
            Graph.Debug.write("Disconnecting from event stream...");
            _hub.disconnected(function () {
                Graph.Debug.write("Disconnected from event stream.");
            });
            _hub.stop();
        }
    };
})();

Graph.Node = {};
Graph.Node.create = function (event) {
    var graph = Graph;

    var template = '<div>' +
        '%(Event.MethodName)s <br/>' +
        "Time taken: %(Event.TimeTakenInMilliseconds)sms <br/>" +
        "<a href='#' class='%(Settings.nodeInfoClass)s' data-method-id='%(Event.MethodId)s'>More info</a></div>";

    var value = sprintf(template, 
        {
            Event: event,
            Settings: graph.getSettings()
        });

    var nameColumn = {
        v: event.MethodId,
        f: value
    };
    var parentColumn = event.ParentMethodId;
    var tooltipColumn = '';

    return [nameColumn, parentColumn, tooltipColumn];
};

Graph.Debug = (function() {

    var _isEnabled = true;

    //public 
    return {
        write: function (output) {
            if (_isEnabled) {
                console.log(output);
            }
        }
    };
})();