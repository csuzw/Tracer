using Microsoft.AspNet.SignalR;
using Tracer.Common.Messages;

namespace Tracer.Web.Hubs
{
    public class LogHub : Hub
    {
        public void Send(LogMessage message)
        {
            Clients.All.broadcastMessage(message);
        }
    }
}
