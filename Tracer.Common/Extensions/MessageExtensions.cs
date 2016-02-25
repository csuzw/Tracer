using Tracer.Common.Messages;
using Tracer.Common.SignalR;

namespace Tracer.Common.Extensions
{
    public static class MessageExtensions
    {
        public static void Broadcast(this TraceMessage message)
        {
            SignalRClient.Instance.Broadcast(message);
        }

        public static void Broadcast(this TraceHttpBoundaryRequestMessage message)
        {
            SignalRClient.Instance.Broadcast(message);
        }

        public static void Broadcast(this TraceHttpBoundaryResponseMessage message)
        {
            SignalRClient.Instance.Broadcast(message);
        }

        public static void Broadcast(this LogMessage message)
        {
            SignalRClient.Instance.Broadcast(message);
        }
    }
}
