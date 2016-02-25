using Tracer.Common.Messages;
using Tracer.Common.SignalR;

namespace Tracer.Common.Extensions
{
    public static class MessageExtensions
    {
        public static void Broadcast(this TraceMessage message)
        {
            SignalRClient.Instance.BroadcastTraceMessage(message);
        }

        public static void Broadcast(this LogMessage message)
        {
            SignalRClient.Instance.BroadcastLogMessage(message);
        }
    }
}
