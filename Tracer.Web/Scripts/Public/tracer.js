$(function () {
    var conn = $.connection.traceHub;
    var fm = $("#message");
    $("#clearmessages").click(function () { return $("#messages").empty(); });
    $.connection.hub.start().done(function () {
        return $("#sendmessage").click(function() {
            conn.server.send({ TraceId: "testId", MethodId: "testId2", MethodName: fm.val(),  });
            return fm.val("").focus();
        });
    });
    return conn.client.broadcastMessage = function (message) {
        return $("#messages").append("<tr><td>" + message.TraceId + "</td><td>" + message.MethodId + "</td><td>" + message.ParentMethodId + "</td><td>" + message.TraceEvent + "</td><td>" + message.MethodName + "</td><td>" + message.Timestamp + "</td></tr>");
    }
});