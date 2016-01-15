using System;
using System.Diagnostics;
using System.Reflection;
using PostSharp.Aspects;
using PostSharp.Extensibility;
using Tracer.Common.Messages;
using Tracer.Common.SignalR;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method)] // ignore constructors
    public class TraceAttribute : OnMethodBoundaryAspect
    {
        private string _methodInfo;

        public override void RuntimeInitialize(MethodBase method)
        {
            _methodInfo = string.Format("{0}.{1}", method.DeclaringType, method.Name);

            Console.WriteLine("{0} aspect applied to {1}", GetType().Name, _methodInfo);
        }

        public override void OnEntry(MethodExecutionArgs args)
        {
            var message = string.Format("OnEntry: {0} with parameters [{1}]", _methodInfo, string.Join(", ", args.Arguments));
            Broadcast(message);

            args.MethodExecutionTag = Stopwatch.StartNew();
        }

        public override void OnSuccess(MethodExecutionArgs args)
        {
            var sw = (Stopwatch)args.MethodExecutionTag;
            sw.Stop();

            var message = string.Format("OnSuccess: {0} returned [{1}] and took {2}ms", _methodInfo, args.ReturnValue, sw.ElapsedMilliseconds);
            Broadcast(message);
        }

        public override void OnException(MethodExecutionArgs args)
        {
            var sw = (Stopwatch)args.MethodExecutionTag;
            sw.Stop();

            var message = string.Format("OnException: {0} with exception [{1}] and took {2}ms", _methodInfo, args.Exception, sw.ElapsedMilliseconds);
            Broadcast(message);
        }

        private void Broadcast(string message)
        {
            SignalRClient.Instance.BroadcastTraceMessage(new TraceMessage { Message = message });
        }
    }
}
