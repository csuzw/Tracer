Graph.UI = Graph.UI || {};

Graph.UI.EventInfo = (function () {

    function getArgumentsHtml(event) {

        var html = '<li class="list-group-item"><table>' +
            '<thead>' +
            '<tr><th>Name</th>' +
            '<th>Value</th></tr>' +
            '</thead>' +
            '<tbody>';

        for (var i = 0; i < event.Arguments.length; i++) {
            html += '<tr><td>' + i + '</td>';
            html += '<td>' + event.Arguments[i] + '</td></tr>';
        }

        html += '</tbody></table></li>';

        return html;
    };

    return {
        render: function (event) {
            console.log(event);

            var container = $('#event-container');

            var date = new Date(event.Timestamp).toTimeString();

            var template =
                '<div class="panel panel-default">' +
                    '<div class="panel-heading">' + event.MethodName + '</div>' +
                        '<div class="panel-body">' +
                            '<ul class="list-group">' +
                                '<li class="list-group-item">Time taken: ' + event.TimeTakenInMilliseconds + 'ms</li>' +
                                '<li class="list-group-item">When: ' + date + '</li>' +
                                '<li class="list-group-item">Returned value: ' + event.ReturnValue + '</li>' +
                                ((event.Exception) ? '<li class="list-group-item list-group-item-danger">Exception: ' + event.Exception + 'ms</li>' : '') +
                                ((event.Arguments && event.Arguments.length > 0) ? getArgumentsHtml(event) : '') +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            container.html(template);
        }
    };
})();

