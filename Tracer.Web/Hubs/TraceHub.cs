using Microsoft.AspNet.SignalR;
using TracerAttributes;

namespace Tracer.Web.Hubs
{
    public class TraceHub : Hub
    {
        [NoTrace]
        public void Send(string message)
        {
            Clients.All.broadcastMessage(message);
        }
    }
}
