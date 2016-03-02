var Tracer = Tracer || {};
Tracer.UI = {};

Tracer.UI.EventStreamNotification = (function () {

    var overlay;
    var message;

    $(function () {
        overlay = $('#loading-overlay');
        message = overlay.find('.overlay-message');

        message.on('click', function () {
            Event.publish('tracing-start');
        });
    });

    Event.subscribe('tracing-start', function (e, data) {
        overlay.hide();
    });

})();

Tracer.UI.Collapsible = (function () {

    $(function () {
        $('.info-body').on('hidden.bs.collapse', close);
        $('.info-body').on('shown.bs.collapse', open);
    });

    function close(e) {
        $(e.target)
            .prev('.info-header')
            .find('i')
            .removeClass('glyphicon-triangle-bottom')
            .addClass('glyphicon-triangle-right');
        return false;
    };

    function open(e) {
        $(e.target)
            .prev('.info-header')
            .find('i')
            .removeClass('')
            .addClass('glyphicon-triangle-bottom');
        return false;
    };

})();

Tracer.UI.PanelOverlay = (function () {

    var overlays;

    $(function () {
        overlays = $('.panel > .overlay');
    });

    Event.subscribe('state-event-received', function () {
        overlays.fadeOut('fast');
    });

    Event.subscribe('state-cleared', function () {
        overlays.fadeIn();
    });

})();


