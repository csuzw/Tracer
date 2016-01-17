using Tracer.Common.Messages;
using Tracer.Common.SignalR;

namespace Tracer.Common.Extensions
{
    public static class TraceMessageExtensions
    {
        public static void Broadcast(this TraceMessage message)
        {
            SignalRClient.Instance.BroadcastTraceMessage(message);
        }
    }
}
