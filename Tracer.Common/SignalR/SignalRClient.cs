using System;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR.Client;
using Tracer.Common.Extensions;
using Tracer.Common.Messages;

namespace Tracer.Common.SignalR
{
    public sealed class SignalRClient
    {
        private static readonly Lazy<SignalRClient> _lazy = new Lazy<SignalRClient>(() => new SignalRClient());
    
        public static SignalRClient Instance { get { return _lazy.Value; } }

        private SignalRClient()
        {
        }

        public void Broadcast(TraceMessage message)
        {
            Broadcast(message, "traceHub", "Send");
        }

        public void Broadcast(TraceHttpBoundaryRequestMessage message)
        {
            Broadcast(message, "traceHub", "SendHttpBoundaryRequest");
        }

        public void Broadcast(TraceHttpBoundaryResponseMessage message)
        {
            Broadcast(message, "traceHub", "SendHttpBoundaryResponse");
        }

        public void Broadcast(LogMessage message)
        {
            Broadcast(message, "logHub", "Send");
        }

        public void Broadcast<T>(T message, string hubName, string methodName)
            where T : BaseMessage
        {
            Broadcast(Constants.WebUri, hubName, methodName, message).FireAndForget();
        }

        private async Task Broadcast(string uri, string hubName, string action, params object[] args)
        {
            var connection = new HubConnection(uri);
            var hub = connection.CreateHubProxy(hubName);

            await connection.Start().ContinueWith(ct =>
            {
                if (ct.IsFaulted)
                {
                    Console.WriteLine("There was an error opening the connection to {0}: {1}", uri, ct.Exception.GetBaseException());
                }
            });

            if (connection.State != ConnectionState.Connected) return;

            await hub.Invoke(action, args).ContinueWith(ht =>
            {
                if (ht.IsFaulted)
                {
                    Console.WriteLine("There was an error calling {0}.{1}: {2}", hubName, action, ht.Exception.GetBaseException());
                }
            });       
        }
    }
}
