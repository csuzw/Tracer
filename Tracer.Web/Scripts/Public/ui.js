var UI = UI || {};

UI.Config = {

};

var Event = {};
(function (q) {
    var topics = {}, subUid = -1;
    q.subscribe = function (topic, func) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        var token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });
        return token;
    };

    q.publish = function (topic, args) {
        if (!topics[topic]) {
            return false;
        }
        setTimeout(function () {
            var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(topic, args);
            }
        }, 0);
        return true;

    };

    q.unsubscribe = function (token) {
        for (var m in topics) {
            if (topics[m]) {
                for (var i = 0, j = topics[m].length; i < j; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };
}(Event));

/*
HTML Table Factory

@author jmckniff.
*/
UI.Table = (function () {

    var columnCount = 0;
    var emptyRowClass = 'ui_table_empty_row';
    var emptyRowText = 'The table has no data.';

    /*
	Create a new HTML table.

	@returns jQuery table element object.
	*/
    function getTable() {
        // create blank table element.
        // add the bootstrap classes to the table.
        var table = $('<table/>', { 'id': 'ui_table', 'class': 'table table-striped table-hover' });
        // extend the table element
        $.extend(table, {
            emptyRowText: emptyRowText,
            // check if the table contains an empty placeholder row.
            hasEmptyRow: function () {
                var tbody = table.find('tbody');
                var hasEmptyRow = tbody.data('hasEmptyRow') || false;
                return hasEmptyRow;
            },
            addEmptyRow: function () {
                var tbody = table.find('tbody');
                var rowCount = tbody.children().length;
                var hasEmptyRow = this.hasEmptyRow();
                if (rowCount === 0 && hasEmptyRow === false) {
                    // create the data for an example table row.
                    var emptyRowData = [
                        {
                            'text': this.emptyRowText,
                            'class': 'empty'
                        }
                    ];
                    // create an empty table row if no table data exists.
                    var emptyRow = getRow(emptyRowData);
                    // add the empty table row element to the table body element.
                    tbody.append(emptyRow);
                    // add data to the table body.
                    tbody.data('hasEmptyRow', true);
                }
            },
            // remove the empty placeholder row.
            removeEmptyRow: function () {
                if (this.hasEmptyRow()) {
                    console.log('removing empty row');
                    var emptyRow = $('.' + emptyRowClass);
                    var index = emptyRow.closest('tr').prevAll().length;
                    this.removeRow(index + 1);

                    var table = $(this);
                    var tbody = table.find('tbody');
                    tbody.data('hasEmptyRow', false);
                }
            },
            // add a row to the end of the table.
            addRow: function (rowData) {
                this.removeEmptyRow();
                var tbody = table.find('tbody');
                var row = getRow(rowData);
                tbody.append(row);
            },
            // add a row to the start of the table.
            prependRow: function (rowData) {
                this.removeEmptyRow();
                var tbody = table.find('tbody');
                var row = getRow(rowData);
                tbody.prepend(row);
            },
            // add a clear all rows function.
            clearRows: function () {
                var tbody = table.find('tbody');
                tbody.empty();
                this.addEmptyRow();
            },
            // remove a row at the specified index.
            removeRow: function (rowIndex) {
                var row = $(this).find('tr').eq(rowIndex);
                row.remove();
            }
        });

        // return the table element.
        return table;
    }

    /*
	Create a new HTML table head element.
	
	@oaran An array of column(s).
	@returns jQuery table head element object.
	*/
    function getHead(columnData) {
        // create a blank table head element.
        var thead = $('<thead/>');
        // create a blank table row.
        var thRow = $('<tr/>');
        // check if the column data is not null.
        if (columnData) {
            // loop over all the column objects in the column data.
            for (var i = 0, columnCount = columnData.length; i < columnCount; i++) {
                // get the current column object.
                var column = columnData[i];
                // create a new table head cell and set it's text.
                var th = $('<th/>', { 'text': column.text });
                // add the table head cell to the table row.
                thRow.append(th);
            }
        }
        // add the table row to the table head element.
        thead.append(thRow);
        // return the table head element.
        return thead;
    }

    /*
	Create a new HTML table body element.
	
	@param An array of row(s).
	@returns jQuery table body element object.
	*/
    function getBody(rowData) {
        // create a empty table body element.
        // add the list.js class to the body.
        var tbody = $('<tbody/>', { 'class': 'list' });
        // check if there are rows to be created.
        if (rowData) {
            var rowCount = rowData.length;
            // loop through all of the row objects in the row data.
            for (var i = 0; i < rowCount; i++) {
                // get the curret row's data object into a variable.
                var data = rowData[i];
                // get a new table row based on the row data.
                var row = getRow(data);
                // add the table row element to the table body element.
                tbody.append(row);
            }
            if (rowCount === 0) {
                // create the data for an example table row.
                var emptyRowData = [
					{
					    'text': emptyRowText,
					    'class': 'empty'
					}
                ];
                // create an empty table row if no table data exists.
                var emptyRow = getRow(emptyRowData);
                // add the empty table row element to the table body element.
                //tbody.append(emptyRow);
                // add data to the table body.
                tbody.data('hasEmptyRow', true);
            }
        }
        return tbody;
    }

    /*
	Create a new HTML table row element.

	@param An array of row cell(s).
	@returns jQuery table row element object.
	*/
    function getRow(rowData) {
        // create an empty table row.
        var tr = $('<tr/>');
        // check the row object has some data.
        if (rowData) {
            var cellCount = rowData.length;
            // check if the row data contains a class value.
            if (rowData.shot) {
                // add a class to the current tr.
                tr.addClass(rowData.shot);
            }
            // check if the current row is eligible for column span.
            var isSpanning = (columnCount > cellCount) ? true : false;
            // loop through all the cells in the row object.
            for (var i = 0; i < cellCount; i++) {
                // get the current cell object's data.
                var cell = rowData[i];
                // create an empty table cell.
                var td = $('<td/>');
                // check if the current cell should have a colspan.
                if (isSpanning)
                    // add the colspan attribute.
                    td.attr('colspan', columnCount);
                // check if the cell object contains multiple objects.
                // if it does then it is a command cell which will contain buttons.
                if (cell.length) {
                    // loop through all the current cell's objects.
                    for (var l = 0, commandCount = cell.length; l < commandCount; l++) {
                        // get the current command object.
                        var command = cell[l];
                        // get a command button using the command object's properties.
                        var commandButton = getCommandButton(command);
                        // check if the command is not null.
                        if (commandButton)
                            // add the command button to the current table cell.
                            td.append(commandButton);
                    }
                } else {
                    td.text(cell.text);
                }
                tr.append(td);
            }
        }
        return tr;
    }

    /*
	Create a new HTML hyperlink element.

	@param An array of column command(s).
	@returns a jQuery hyperlink object.
	*/
    function getCommandButton(command) {
        // check if the command data is not null.
        if (command) {
            // get the UI class's configuration.
            var config = UI.Config;
            // create a hyperlink with current command's properties.
            var a = $('<a/>', {
                'class': config.buttonClass,
                'title': command.text,
                'text': command.text
            });
            // check if the current command's action is a function.
            if (typeof command.action === 'function') {
                // assign the command's data property to the hyperlink.
                a.data('action.data', command.data);
                // attach a click event handler to the hyperlink.
                // this will execute the command's action function when clicked.
                a.off('click').on('click', command.action);
            }
            // check if the current command's action is a type of string.
            if (typeof command.action === 'string') {
                // check if the current command's action is a URL.
                if (command.action.indexOf("url") > -1) {
                    // only get the URL part of the string into a variable.
                    var url = command.action.substring(4);
                    // set the hyperlink's HREF attribute to the URL.
                    a.attr('href', url);
                    // check if the command data contains whether the link should be opened in a new tab.
                    var isNewTab = command.isNewTab || false;
                    if (isNewTab) {
                        // set the hyperlink to open in a new tab when clicked.
                        a.attr('target', '_blank');
                    }


                }
            }
            // return the command button.
            return a;
        }
        // return nothing.
        return null;
    }

    /*
	Creates a new HTML table element.
	
	@param An array of table column(s) and row(s).
	@returns jQuery table body element object.
	*/
    function createTable(tableData) {
        // get the total number of columns
        columnCount = tableData.columns.length;
        // get the empty text value passed in with table data.
        emptyRowText = tableData.emptyRowText || emptyRowText;
        // get a new table element.
        var table = getTable();
        // get the table's head element based on the column data.
        var thead = getHead(tableData.columns);
        // get the table's body element based on the row data.
        var tbody = getBody(tableData.rows);
        // add the head and the body elements to the table.
        table.append(thead).append(tbody);
        // return the table element.
        return table;
    }

    return {

        /*
		Create a new HTML table.
		
		@param An array of table data.
		@returns A jQuery HTML table object.
		*/
        create: function (data) {
            // get a reference to the table factory.
            var factory = this;
            // check if the table data is not null.
            if (data) {
                // create the table using the table data object.
                var table = createTable(data);
                // use a null coalesce to return either the table or null.
                return table || null;
            }
            // return null.
            return null;
        }

    };

})();

UI.Hyperlink = {};
UI.Hyperlink.createJsonDownloadLink = function (text, data) {

    if (text == null || text.length === 0) {
        text = "Download JSON";
    }

    var json = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));

    var downloadLink = $('<a href="data:' + json + '" download="data.json">' + text + '</a>');

    return downloadLink;
};