$(function () {
    var conn = $.connection.traceHub;
    var fm = $("#message");
    $("#clearmessages").click(function () { return $("#discussion").empty(); });
    $.connection.hub.start().done(function () {
        return $("#sendmessage").click(function() {
            conn.server.send({ Message: fm.val() });
            return fm.val("").focus();
        });
    });
    return conn.client.broadcastMessage = function (message) {
        var messageHtml = $("<div />").text(message.Message).html();
        return $("#discussion").append('<blockquote class="alert-info" style="padding:10px;margin-bottom:10px;"><strong>' + messageHtml + "</blockquote>");
    }
});