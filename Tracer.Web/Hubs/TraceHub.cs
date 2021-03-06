﻿using Microsoft.AspNet.SignalR;
using Tracer.Common.Messages;

namespace Tracer.Web.Hubs
{
    public class TraceHub : Hub
    {
        public void Send(TraceMessage message)
        {
            Clients.All.broadcastMessage(message);
        }

        public void SendHttpBoundaryRequest(TraceHttpBoundaryRequestMessage message)
        {
            Clients.All.broadcastHttpRequestMessage(message);
        }

        public void SendHttpBoundaryResponse(TraceHttpBoundaryResponseMessage message)
        {
            Clients.All.broadcastHttpResponseMessage(message);
        }
    }
}
