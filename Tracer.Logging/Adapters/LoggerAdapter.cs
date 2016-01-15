using Microsoft.AspNet.SignalR.Client;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Tracer.Logging.Adapters
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

            SendToHub(message).FireAndForget();
        }

        public void TraceLeave(string methodInfo, long startTicks, long endTicks, string[] paramNames, object[] paramValues)
        {
            var timeSpan = new TimeSpan(endTicks - startTicks);
            var parameters = (paramNames == null || paramValues == null) 
                ? string.Empty
                : string.Join(", ", paramNames.Zip(paramValues, (n, v) => string.Format("{0} = {1}", n, v)));
            var message = string.Format("TraceExit: {0} returned [{1}] and took {2}ms", methodInfo, parameters, timeSpan.TotalMilliseconds);

            SendToHub(message).FireAndForget();
        }

        private async Task SendToHub(string message)
        {
            var connection = new HubConnection(@"http://localhost:8080/");
            var hub = connection.CreateHubProxy("traceHub");

            await connection.Start().ContinueWith(ct => 
            {
                if (ct.IsFaulted)
                {
                    Console.WriteLine("There was an error opening the connection:{0}", ct.Exception.GetBaseException());
                }
            });

            if (connection.State != ConnectionState.Connected) return;

            await hub.Invoke("Send", message).ContinueWith(ht =>
            {
                if (ht.IsFaulted)
                {
                    Console.WriteLine("There was an error calling send: {0}", ht.Exception.GetBaseException());
                }
            });
        }
    }
}
