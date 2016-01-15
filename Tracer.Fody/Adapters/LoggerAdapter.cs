using System;
using System.Linq;
using Tracer.Common.Messages;
using Tracer.Common.SignalR;

namespace Tracer.Fody.Adapters
{
    public class LoggerAdapter
    {
        private readonly Type _type;

        public LoggerAdapter(Type type)
        {
            _type = type;
        }

        public void TraceEnter(string methodInfo, string[] paramNames, object[] paramValues)
        {
            var parameters = (paramNames == null || paramValues == null)
                ? string.Empty
                : string.Join(", ", paramNames.Zip(paramValues, (n, v) => string.Format("{0} = {1}", n, v)));
            var message = string.Format("TraceEnter: {0} with parameters [{1}]", methodInfo, parameters);

            Broadcast(message);
        }

        public void TraceLeave(string methodInfo, long startTicks, long endTicks, string[] paramNames, object[] paramValues)
        {
            var timeSpan = new TimeSpan(endTicks - startTicks);
            var parameters = (paramNames == null || paramValues == null) 
                ? string.Empty
                : string.Join(", ", paramNames.Zip(paramValues, (n, v) => string.Format("{0} = {1}", n, v)));
            var message = string.Format("TraceExit: {0} returned [{1}] and took {2}ms", methodInfo, parameters, timeSpan.TotalMilliseconds);

            Broadcast(message);
        }

        private void Broadcast(string message)
        {
            SignalRClient.Instance.BroadcastTraceMessage(new TraceMessage { Message = message });
        }
    }
}
