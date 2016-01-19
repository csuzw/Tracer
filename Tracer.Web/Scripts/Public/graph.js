var Graph = (function () {

    var graph = this;

    // private
    var setupGraph = function (graphElementId) {

        console.log("Loading chart packages...");

        var graphElement = document.getElementById(graphElementId);

        if (graphElement == null) {
            throw "Graph element with id '" + graphElementId + "' not found";
        }

        graph.context = {
            events: [],
            graphElement: graphElement
        };
    
        google.charts.load('current', { packages: ["orgchart"] });

        startRenderCycle();
    };
    
    function render () {

        console.log("Rendering graph...");

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'ToolTip');

        // todo: iterate events and add row to data..
        for (var i = 0; i < graph.context.events.length; i++) {
            var event = graph.context.events[i];

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

        var chart = new google.visualization.OrgChart(graph.context.graphElement);
        google.visualization.events.addListener(chart, 'ready', onGraphReady);

        chart.draw(data, { allowHtml: true });
    };

    function onGraphReady() {
        console.log("Rendering complete.");

        $('.node-info').on('click', function () {
            var info = $(this);
            var event = findEvent("MethodId", info.data('method-id'));
            console.log(event);
        });
    };

    function findEvent(key, valueToMatch) {
        var events = graph.context.events;
        for (var i = 0; i < events.length; i++) {
            if (events[i][key] == valueToMatch) {
                return events[i];
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
        onEventReceived: function(event) {
            console.log(graph.context.events);
            // todo: check if event already exists
            graph.context.events.push(event);
            // todo: sort events
        }
    };

})();

Graph.Node = {};
Graph.Node.create = function (event) {

    var template = '<div>' +
        '%(MethodName)s <br/>' +
        "Time taken: %(TimeTakenInMilliseconds)sms <br/>" +
        "<a href='#' class='node-info' data-method-id='%(MethodId)s'>More info</a></div>";

    var value = sprintf(template, event);

    var nameColumn = {
        v: event.MethodId,
        f: value
    };
    var parentColumn = event.ParentMethodId;
    var tooltipColumn = '';

    return [nameColumn, parentColumn, tooltipColumn];
};