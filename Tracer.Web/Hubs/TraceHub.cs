using Microsoft.AspNet.SignalR;
using Tracer.Common;
using TracerAttributes;

namespace Tracer.Web.Hubs
{
    public class TraceHub : Hub
    {
        [NoTrace]
        public void Send(TraceMessage message)
        {
            Clients.All.broadcastMessage(message);
        }
    }
}
