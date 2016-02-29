Tracer.UI = Tracer.UI || {};
Tracer.UI.Navbar = {};

Tracer.UI.Navbar.ToggleTracing = (function () {

    var isTracing = false;

    $(function () {

        var toggleButton = $('#toggle-tracing-state');

        toggleButton.on('click', function () {
            isTracing = !isTracing;

            if (isTracing) {
                Tracer.Debug.write('[Tracer.UI.ToggleTracing]: Starting trace...');
                Event.publish('tracing-start');
            } else {
                Tracer.Debug.write('[Tracer.UI.ToggleTracing]: Stopping trace...');
                Event.publish('tracing-stop');
            }
        });

        Event.subscribe('tracing-start', function () {
            toggleButton.text('Stop Tracing');
            Tracer.Debug.write('[Tracer.UI.ToggleTracing]: Trace started.');
        });

        Event.subscribe('tracing-stop', function () {
            toggleButton.text('Start Tracing');
            Tracer.Debug.write('[Tracer.UI.ToggleTracing]: Trace stopped.');
        });

    });

})();

Tracer.UI.Navbar.EventQueueLength = (function () {

    var queueLengthBadge;

    $(function () {
        queueLengthBadge = $('#state-event-queue-length');
    });

    Event.subscribe('event-queue-length-updated', function (e, queueLength) {
        queueLengthBadge.text(queueLength);
    });

})();

Tracer.UI.Navbar.Search = (function () {

    var input;
    var timeout = false;

    $(function () {
        input = $('#state-search-input');

        input.keyup(function () {

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(function () {

                var query = input.val();

                Tracer.Debug.write('[Tracer.UI.StateSearch]: Query: ' + query);

                Event.publish('state-search', query);

            }, 250);
        });

        input.prop('disabled', true);
    });

    Event.subscribe('tracing-start', function () {
        input.prop('disabled', false);
    });

})();

Tracer.UI.Navbar.EventStateDropdown = {};

Tracer.UI.Navbar.EventStateDropdown.EventCounter = (function () {

    var eventCount = 0;
    var errorCount = 0;

    $(function () {
        var eventCountBadge = $('#state-dropdown-event-count-badge');

        Event.subscribe('state-event-received', function (e, event) {
            eventCount++;
            eventCountBadge.text(eventCount);
        });

        Event.subscribe('state-cleared', function () {
            eventCount = 0;
            eventCountBadge.text(eventCount);
            errorCount = 0;
            errorCountBadge.text(errorCount);
        });

        var errorCountBadge = $('#state-event-errors-length');

        Event.subscribe('state-event-updated', function (e, event) {
            if (!event.IsSuccess && event.OnExceptionEvent) {
                errorCount++;
                errorCountBadge.text(errorCount);
            }
        });

        errorCountBadge.parent().on('click', function () {
            Event.publish('state-search', 'Failed');
        });

        var clearState = $('#state-dropdown-clear-state');
        clearState.on('click', function () {
            Event.publish('state-clear');
        });

        var toggleDropdown = $('#state-dropdown-toggle');
        var downloadStateItem = $('#state-dropdown-download-state-item');

        toggleDropdown.on('click', function () {
            var downloadStateLink = UI.Hyperlink.createJsonDownloadLink('Download State', Tracer.EventStore.getRawEvents());
            downloadStateItem.html(downloadStateLink);
        });
    });

})();

Tracer.UI.Navbar.EventStateDropdown.ImportState = (function () {

    var eventQueue = Tracer.EventQueue;

    var openModal;
    var importModal;
    var importValidationMessage;
    var stateInput;
    var submitImport;

    $(function () {
        openModal = $('#state-import-open');
        importModal = $('#state-import-modal');
        importValidationMessage = $('#state-import-validation-message');
        stateInput = $('#state-import-value');
        submitImport = $('#state-import-submit');

        openModal.on('click', function () {
            importModal.modal();
        });

        submitImport.on('click', function () {
            var stateText = stateInput.val();

            if (isStateTextValid(stateText)) {
                importState(stateText);
            }
        });
    });

    function isStateTextValid(stateText) {
        if (stateText.length == 0) {
            importValidationMessage.text("Please enter some state in JSON format.");
            return false;
        } else if (Tracer.Utils.isJson(stateText) == false) {
            importValidationMessage.text("The state to import must be valid JSON.");
            return false;
        }

        return true;
    };

    function importState(stateText) {

        var state = $.parseJSON(stateText);

        if (!state) {
            importValidationMessage.text("Unable to parse the state JSON.");
            return;
        }

        Event.publish('clear-state');

        for (var i = 0; i < state.length; i++) {
            var event = state[i];
            eventQueue.queueEvent(event);
        }

        var importStats = eventQueue.getStats();

        Tracer.Debug.write("[Tracer.UI.ImportState]: " + importStats);

        importModal.modal('hide');
        stateInput.val('');
        importValidationMessage.text('');
    };

})();