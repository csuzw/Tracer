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
        $('.info-body').on('hidden.bs.collapse', toggleIcon);
        $('.info-body').on('shown.bs.collapse', toggleIcon);
    });

    function toggleIcon(e) {
        $(e.target)
            .prev('.info-header')
            .find('i')
            .toggleClass('glyphicon-triangle-bottom glyphicon-triangle-right');
        return false;
    }

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


