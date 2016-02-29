Tracer.UI = Tracer.UI || {};
Tracer.UI.EventInfo = {};


Tracer.UI.EventInfo.SummaryTab = (function() {

	var container;
    var overlay;
    var generalInfo;

    var children;
    var allChildren;
    var toggles;

    var expandAll;
    var collapseAll;

    $(function() {
    	container = $('#event-info-container');
    	allChildren = container.find('.info-body');
    	children = container.find('.info-body:not(:first)');
    	toggles = container.find('[data-toggle]:not(:first) > i');
    	expandAll = $('#event-info-children-expand');
    	collapseAll = $('#event-info-children-collapse');

    	overlay = $('.no-event-info-overlay');
    	generalInfo = $('#event-info-general-body');

        expandAll.on('click', function(e) {
        	allChildren.collapse('show');
        	e.preventDefault();
        });

        collapseAll.on('click', function (e) {
        	allChildren.collapse('hide');
            e.preventDefault();
        });

        allChildren.collapse('hide');
    	overlay.show();
    });

    Event.subscribe('event-selected', reset);

    function reset() {
    	overlay.fadeOut('fast');
    	children.collapse('hide');
    	toggles
			.removeClass('glyphicon-triangle-bottom')
			.addClass('glyphicon-triangle-right');
    };

})();

Tracer.UI.EventInfo.General = (function () {

	var eventStore = Tracer.EventStore;

    var container;
	var methodName;
	var parentMethodName;
	var timeTaken;
	var status;
	var statusIcon;
	var machineName;
    var windowsUsername;
	var selectedId;

	$(function () {
	    container = $('#event-info-general');
		methodName = $('#event-info-summary-method-name');
		parentMethodName = $('#event-info-summary-parent-method-name');
		timeTaken = $('#event-info-summary-time-taken');
		status = $('#event-info-summary-status');
		statusIcon = container.find('.status-icon');
		machineName = $('#event-info-summary-machine-name');
	    windowsUsername = $('#event-info--summary-windows-username');
	});

	Event.subscribe('event-selected', function (e, event) {
		selectedId = event.MethodId;
		display(event);
	});

	Event.subscribe('state-event-updated', function (e, event) {
		if (event.MethodId == selectedId) {
			display(event);
		}
	});

	function display(event) {
		methodName.text(event.MethodName);
		timeTaken.text(event.TimeTakenInMilliseconds);
		
		if (event.OnSuccessEvent) {
			status.text("Success");
			statusIcon.prop('class', "status-icon success");
		} else if (event.OnExceptionEvent) {
			status.text("Failed");
			statusIcon.prop('class', "status-icon danger");
		} else {
			status.text("Pending");
			statusIcon.prop('class', "status-icon warning");
		}

		machineName.text(event.MachineName);
	    windowsUsername.text(event.OnEntryEvent.WindowsUsername);

		var parentEvent = eventStore.search('MethodId', event.ParentMethodId);

		if (parentEvent) {
			parentMethodName.text(parentEvent.MethodName);
		}
	}

})();

Tracer.UI.EventInfo.Errors = (function () {

	var body;
	var errorMessage;
	var stackTrace;
    var selectedId;

	$(function () {
		body = $('#event-info-error-body');
		errorMessage = $('#event-info-error-message');
		stackTrace = $('#event-info-error-stack-trace');
	});

	Event.subscribe('event-selected', function (e, event) {
		selectedId = event.MethodId;
	    display(event);
	});

    Event.subscribe('state-event-updated', function(e, event) {
		if (event.MethodId == selectedId) {
		    display(event);
		}
    });

	function display(event) {
		if (event.OnExceptionEvent) {
			errorMessage.text('No error message to display.');
			stackTrace.text(event.OnExceptionEvent.Exception);
		} else {
			errorMessage.text('No error message to display.');
			stackTrace.text('No stack trace to display.');
		}
	};
	
})();

Tracer.UI.EventInfo.Arguments = (function () {

    var container;
	var body;
	var argumentCount;

    $(function () {
        container = $('#event-info-arguments');
		body = $('#event-info-arguments-body');
	    argumentCount = $('#event-info-arguments-count');
	});

	Event.subscribe('event-selected', function (e, event) {
	    display(event);
	});

	Event.subscribe('state-cleared', function () {
	    reset();
	});

	function display(event) {
		if (event.OnEntryEvent.Arguments.length > 0) {

			body.JSONView(event.OnEntryEvent.Arguments);
			argumentCount.text("(" + event.OnEntryEvent.Arguments.length + ")");

		} else {
			reset();
		}
	}

	function reset() {
	    body.text('No arguments to display.');
		argumentCount.text('(0)');
	};

})();

Tracer.UI.EventInfo.ReturnedValue = (function () {

    var container;
    var body;
	var selectedId;

	$(function () {
		container = $('#event-info-returned-value');
		body = $('#event-info-returned-value-body');
	});

	Event.subscribe('event-selected', function (e, event) {
		display(event);
	    selectedId = event.MethodId;
	});

	Event.subscribe('state-event-updated', function (e, event) {
		if (event.MethodId == selectedId) {
			display(event);
		}
	});

	Event.subscribe('state-cleared', reset);

	function display(event) {
		if (!event.OnSuccessEvent) {
			reset();
		    return;
		}

	    if (Tracer.Utils.isJson(event.OnSuccessEvent.ReturnValue)) {
			body.JSONView(event.OnSuccessEvent.ReturnValue);
		} else {
			body.text(event.OnSuccessEvent.ReturnValue);
		}

		container.show();
	};

	function reset() {
	    container.hide();
	    body.text('');
	};

})();

Tracer.UI.EventInfo.Logs = (function () {

	var container;
	var body;
	var logCount;

	$(function () {
		container = $('#event-info-log');
		body = $('#event-info-log-body');
		logCount = $('#event-info-log-count');
	});

	Event.subscribe('event-selected', function (e, event) {
		display(event);
	});

	Event.subscribe('state-cleared', function () {
		reset();
	});

	function display(event) {
		if (event.LogEvents.length > 0) {

			logCount.text("(" + event.LogEvents.length + ")");

			var list = $('<ul>', {
			    "class": "list-group"
			});

			for (var i = 0; i < event.LogEvents.length; i++) {

				var logEvent = event.LogEvents[i];
				
				var date = Tracer.Utils.formatDate(new Date(logEvent.Timestamp));
				var timeStamp = '<span class="pull-left"><strong>Timestamp: </strong>' + date + '</span>';
				var logType = '<span class="pull-right"><strong>Type: </strong>' + logEvent.LogType + '</span>';
			    var clearFix = '<span class="clearfix"></span>';
			    var message = '<strong>Message: </strong> ' + logEvent.Message;

			    var li = $('<li>', {
			    	"class": "list-group-item",
					html: timeStamp +
						logType +
						clearFix +
						message
				});
				list.append(li);
			}

			body.html(list);

		} else {
			reset();
		}
	}

	function reset() {
		body.text('No related log messages to display.');
		logCount.text('(0)');
	};

})();

Tracer.UI.EventInfo.Http = (function () {

	var wrapper;
	var headers;
	var url;
	var method;
	var statusCode;
	var statusCodeIcon;
	var selectedId;

	$(function () {
		wrapper = $('#event-info-http');
		headers = $('#event-info-http-headers-body');
		url = $('#event-info-http-url');
		method = $('#event-info-http-method');
		statusCode = $('#event-info-http-status-code');
		statusCodeIcon = wrapper.find('.status-icon');
	});

	Event.subscribe('event-selected', function (e, event) {
		console.log(event);
		selectedId = event.MethodId;

		display(event);
	});

	Event.subscribe('state-event-updated', function (e, event) {
		if (event.MethodId == selectedId) {
			display(event);
		}
	});

	Event.subscribe('state-cleared', function () {
		selectedId = null;
		reset();
	});

	function display(event) {
		if (event.HttpRequest) {
			wrapper.show();

			url.text(event.HttpRequest.Uri);
			method.text(event.HttpRequest.HttpMethod);

			displayHttpStatusCode(event.HttpResponse);

			if (event.HttpRequest.Headers) {
				var list = $('<ul>');
				for (var headerName in event.HttpRequest.Headers) {
					var li = $('<li>', {
						html: "<strong>" + headerName + ":</strong> " + event.HttpRequest.Headers[headerName]
					});
					list.append(li);
				}
				headers.html(list);
			}


		} else {
			wrapper.hide();
			reset();
		}
	};

	function displayHttpStatusCode(httpStatusResponse) {

		if (!httpStatusResponse) {
			statusCodeIcon.prop('class', 'status-icon warning');
			statusCode.text("Pending");
			return;
		}

		if (httpStatusResponse.HttpStatusCode == "OK") {
			statusCodeIcon.prop('class', 'status-icon success');
		}

		statusCode.text(httpStatusResponse.HttpStatusCode);
	};

	function reset() {
		url.text('');
		method.text('');
		statusCode.text('');
		statusCodeIcon.prop('class', 'status-icon warning');
		headers.empty();
	};

})();
