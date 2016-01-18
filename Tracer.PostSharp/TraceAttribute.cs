using Nancy;
using PostSharp.Aspects;
using PostSharp.Extensibility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using Tracer.Common.Extensions;
using Tracer.Common.Http;
using Tracer.Common.Messages;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method)] // ignore constructors
    public class TraceAttribute : OnMethodBoundaryAspect
    {
        private const string TraceIdHeaderKey = "TraceId";

        private static readonly ThreadLocal<string> _traceId = new ThreadLocal<string>(() => Guid.NewGuid().ToString());
        private static readonly ThreadLocal<Stack<string>> _methodIds = new ThreadLocal<Stack<string>>(() => new Stack<string>());

        private string _methodName;

        public override void RuntimeInitialize(MethodBase method)
        {
            _methodName = string.Format("{0}.{1}", method.DeclaringType, method.Name);

            Console.WriteLine("{0} aspect applied to {1}", GetType().Name, _methodName);
        }

        public override void OnEntry(MethodExecutionArgs args)
        {
            var traceId = GetTraceId(args.Instance);
            var methodId = Guid.NewGuid().ToString();
            var parentMethodId = PeekAndPushParentMethodId(methodId);

            var message = new TraceMessage
            {
                TraceId = traceId,
                MethodId = methodId,
                ParentMethodId = parentMethodId,
                TraceEvent = TraceEvent.OnMethodEntry,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                Arguments = args.Arguments.Select(a => a.ToString()).ToList()
            };

            message.Broadcast();

            // ensure TraceId is passed across http boundaries
            foreach (var argument in args.Arguments.Where(a => a.GetType() == typeof(IHttpRequest)))
            {
                var httpRequest = argument as IHttpRequest;
                if (httpRequest == null || httpRequest.Headers.ContainsKey(TraceIdHeaderKey)) return;

                httpRequest.Headers.Add(TraceIdHeaderKey, traceId);
            }

            args.MethodExecutionTag = new TraceAttributeContext(traceId, methodId, parentMethodId);
        }

        public override void OnSuccess(MethodExecutionArgs args)
        {
            var context = (TraceAttributeContext)args.MethodExecutionTag;
            context.Stopwatch.Stop();

            PopParentMethodId();

            var message = new TraceMessage
            {
                TraceId = context.TraceId,
                MethodId = context.MethodId,
                ParentMethodId = context.ParentMethodId,
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

            PopParentMethodId();

            var message = new TraceMessage
            {
                TraceId = context.TraceId,
                MethodId = context.MethodId,
                ParentMethodId = context.ParentMethodId,
                TraceEvent = TraceEvent.OnMethodException,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                Exception = args.Exception.ToString(),
                TimeTakenInMilliseconds = context.Stopwatch.ElapsedMilliseconds
            };

            message.Broadcast();
        }

        private string PeekAndPushParentMethodId(string methodId)
        {
            var stack = _methodIds.Value;
            var parentMethodId = (stack.Count > 0) ? stack.Peek() : string.Empty;
            stack.Push(methodId);
            return parentMethodId;
        }

        private void PopParentMethodId()
        {
            var stack = _methodIds.Value;
            stack.Pop();
        }

        private string GetTraceId(object instance)
        {
            var nancyModule = instance as NancyModule;
            if (nancyModule != null)
            {
                var traceIdHeader = nancyModule.Request.Headers[TraceIdHeaderKey];
                if (traceIdHeader != null)
                {
                    var traceId = string.Join(";", nancyModule.Request.Headers[TraceIdHeaderKey]);
                    if (!string.IsNullOrWhiteSpace(traceId))
                    {
                        _traceId.Value = traceId;
                    }
                }
            }
            return _traceId.Value;
        }
    }
}
