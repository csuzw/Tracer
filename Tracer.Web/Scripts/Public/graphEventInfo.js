Graph.UI = Graph.UI || {};

Graph.UI.EventInfo = (function () {

    return {
        render: function (event) {
            console.log(event);

            var container = $('#event-container');

            var name = '<a href="#" class="list-group-item clearfix">' + event.MethodName + '</a>';

            var date = new Date(event.Timestamp);
            var timeStamp = '<a href="#" class="list-group-item clearfix">' + date.toTimeString() + '</a>';
            var timeTaken = '<a href="#" class="list-group-item clearfix">Time taken: ' + event.TimeTakenInMilliseconds + 'ms</a>';

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