using PostSharp.Aspects;
using PostSharp.Extensibility;
using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using Tracer.Common.Extensions;
using Tracer.Common.Messages;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method)] // ignore constructors
    public class TraceAttribute : OnMethodBoundaryAspect
    {
        private static readonly ThreadLocal<Guid> _traceId = new ThreadLocal<Guid>(() => Guid.NewGuid());

        private string _methodName;

        public override void RuntimeInitialize(MethodBase method)
        {
            _methodName = string.Format("{0}.{1}", method.DeclaringType, method.Name);

            Console.WriteLine("{0} aspect applied to {1}", GetType().Name, _methodName);
        }

        public override void OnEntry(MethodExecutionArgs args)
        {
            var traceId = _traceId.Value;
            var methodId = Guid.NewGuid();

            var message = new TraceMessage
            {
                TraceId = traceId.ToString(),
                MethodId = methodId.ToString(),
                TraceEvent = TraceEvent.OnMethodEntry,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                Arguments = args.Arguments.Select(a => a.ToString()).ToList()
            };

            message.Broadcast();

            args.MethodExecutionTag = new TraceAttributeContext(traceId, methodId);
        }

        public override void OnSuccess(MethodExecutionArgs args)
        {
            var context = (TraceAttributeContext)args.MethodExecutionTag;
            context.Stopwatch.Stop();

            var message = new TraceMessage
            {
                TraceId = context.TraceId.ToString(),
                MethodId = context.MethodId.ToString(),
                TraceEvent = TraceEvent.OnMethodSuccess,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                ReturnValue = args.ReturnValue.ToString(),
                TimeTakenInMilliseconds = context.Stopwatch.ElapsedMilliseconds
            };

            message.Broadcast();
        }

        public override void OnException(MethodExecutionArgs args)
        {
            var context = (TraceAttributeContext)args.MethodExecutionTag;
            context.Stopwatch.Stop();
            
            var message = new TraceMessage
            {
                TraceId = context.TraceId.ToString(),
                MethodId = context.MethodId.ToString(),
                TraceEvent = TraceEvent.OnMethodException,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                Exception = args.Exception.ToString(),
                TimeTakenInMilliseconds = context.Stopwatch.ElapsedMilliseconds
            };

            message.Broadcast();
        }
    }
}
