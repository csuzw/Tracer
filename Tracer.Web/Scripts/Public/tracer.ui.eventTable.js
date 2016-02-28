Tracer.UI = Tracer.UI || {};
Tracer.UI.EventTable = (function () {

    var idPrefix = 'event_table_row_id_';
    var table;
    var dataTable;
    var lastSelectedEvent;

    Event.subscribe('state-event-received', function (e, event) {
        dataTable.row.add(event).draw(false);
    });

    Event.subscribe('state-event-updated', function (e, event) {
        var row = dataTable.row('#' + idPrefix + event.MethodId);

        var data = row.data();
        data.Status = event.Status;
        data.IsSuccess = event.IsSuccess;
        data.TimeTakenInMilliseconds = event.TimeTakenInMilliseconds;

        row.data(data);

        var node = row.node();
        if (data.Status == "Failed") {
            node.className = "danger";
        } else {
            node.className = "";
        }

        dataTable.order([1, "desc"]).draw();
    });

    Event.subscribe('state-cleared', function () {
        dataTable.clear().draw();
    });

    Event.subscribe('tracing-start', function () {
        var tableData = {
            columns: [
                {
                    text: 'Method Name',
                    type: 'text'
                },
                {
                    text: 'Time Taken (ms)',
                    type: 'num'
                },
                {
                    text: 'Time stamp',
                    type: 'date'
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
                {
                    data: 'Timestamp',
                    render: function (timeStamp) {
                        var date = new Date(timeStamp);
                        return Tracer.Utils.formatDate(date);
                    }
                },
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

    Event.subscribe('state-search', function (e, query) {
        dataTable.search(query).draw();
    });

    Event.subscribe('event-selected', function (e, event) {
        $('#' + idPrefix + event.MethodId).addClass('selected');
        lastSelectedEvent = event;
    });

    Event.subscribe('event-unselected', function (e, event) {
        dataTable.$('tr.selected').removeClass('selected');
    });

    function onRowAdded(row, data, index) {
        $(row).attr('id', idPrefix + data.MethodId);
        $(row).addClass('warning');
    };

})();