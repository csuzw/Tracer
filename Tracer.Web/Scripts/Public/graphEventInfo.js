var Graph = Graph || {};
Graph.UI = Graph.UI || {};

Graph.UI.EventInfo = (function () {

    return {
        render: function(event) {
            var container = $('#event-container');

            var name = sprintf('<a href="#" class="list-group-item">%(MethodName)s</a>', event);

            var date = new Date(event.Timestamp);
            var timeStamp = sprintf('<a href="#" class="list-group-item">%1$s</a>', date.toDateString());
            var timeTaken = sprintf('<a href="#" class="list-group-item">Time taken: %(TimeTakenInMilliseconds)sms</a>', event);

            var list =
                '<div class="list-group">' +
                name +
                timeStamp +
                timeTaken +
                "</div>";

            container.html(list);
        }
    };
})();