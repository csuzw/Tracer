using PostSharp.Aspects;
using PostSharp.Extensibility;
using System;
using System.Reflection;
using System.Threading;
using Tracer.Common.Messages;
using Tracer.Common.SignalR;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method)] // ignore constructors
    public class TraceAttribute : OnMethodBoundaryAspect
    {
        private static readonly ThreadLocal<Guid> _traceId = new ThreadLocal<Guid>(() => Guid.NewGuid());

        private string _methodInfo;

        public override void RuntimeInitialize(MethodBase method)
        {
            _methodInfo = string.Format("{0}.{1}", method.DeclaringType, method.Name);

            Console.WriteLine("{0} aspect applied to {1}", GetType().Name, _methodInfo);
        }

        public override void OnEntry(MethodExecutionArgs args)
        {
            var traceId = _traceId.Value;
            var methodId = Guid.NewGuid();

            var message = string.Format("OnEntry: {0} with parameters [{1}]", _methodInfo, string.Join(", ", args.Arguments));
            Broadcast(traceId, methodId, message);

            args.MethodExecutionTag = new TraceAttributeContext(traceId, methodId);
        }

        public override void OnSuccess(MethodExecutionArgs args)
        {
            var context = (TraceAttributeContext)args.MethodExecutionTag;
            context.Stopwatch.Stop();

            var message = string.Format("OnSuccess: {0} returned [{1}] and took {2}ms", _methodInfo, args.ReturnValue, context.Stopwatch.ElapsedMilliseconds);
            Broadcast(context.TraceId, context.MethodId, message);
        }

        public override void OnException(MethodExecutionArgs args)
        {
            var context = (TraceAttributeContext)args.MethodExecutionTag;
            context.Stopwatch.Stop();

            var message = string.Format("OnException: {0} with exception [{1}] and took {2}ms", _methodInfo, args.Exception, context.Stopwatch.ElapsedMilliseconds);
            Broadcast(context.TraceId, context.MethodId, message);
        }

        protected virtual void Broadcast(Guid traceId, Guid methodId, string message)
        {
            SignalRClient.Instance.BroadcastTraceMessage(
                new TraceMessage
                {
                    TraceId = traceId.ToString(),
                    MethodId = methodId.ToString(),
                    Message = message
                });
        }
    }
}
