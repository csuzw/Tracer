using Nancy;
using PostSharp.Aspects;
using PostSharp.Extensibility;
using System;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using Tracer.Common;
using Tracer.Common.Extensions;
using Tracer.Common.Messages;
using Tracer.PostSharp.Extensions;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method, TargetMemberAttributes = MulticastAttributes.Public)] // ignore constructors
    public class TraceAttribute : OnMethodBoundaryAspect
    {
        private const string TraceIdHeaderKey = "TraceId";
        private const string ParentMethodHeaderKey = "ParentMethodId";
        
        private string _methodName;

        public override void RuntimeInitialize(MethodBase method)
        {
            _methodName = string.Format("{0}.{1}", method.DeclaringType, method.Name);

            Console.WriteLine("{0} aspect applied to {1}", GetType().Name, _methodName);
        }

        public override async void OnEntry(MethodExecutionArgs args)
        {
            var traceId = GetTraceId(args.Instance);
            var methodId = Guid.NewGuid().ToString();
            var parentMethodId = PeekAndPushParentMethodId(methodId, args.Instance);

            var windowsUser = System.Security.Principal.WindowsIdentity.GetCurrent();

            var message = new TraceMessage
            {
                TraceId = traceId,
                MethodId = methodId,
                ParentMethodId = parentMethodId,
                TraceEvent = TraceEvent.OnMethodEntry,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                Arguments = args.GetMethodArguments(),
                MachineName = Environment.MachineName,
                WindowsUsername = windowsUser != null ? windowsUser.Name : "Unknown",
            };

            message.Broadcast();

            // ensure TraceId and ParentMethodId are passed across http boundaries
            foreach (var argument in args.Arguments.Where(a => a is HttpRequestMessage))
            {
                var httpRequest = argument as HttpRequestMessage;
                if (httpRequest == null) continue;

                if (!httpRequest.Headers.Contains(TraceIdHeaderKey)) httpRequest.Headers.Add(TraceIdHeaderKey, traceId);
                if (!httpRequest.Headers.Contains(ParentMethodHeaderKey)) httpRequest.Headers.Add(ParentMethodHeaderKey, methodId);

                var httpBoundaryRequestMessage = new TraceHttpBoundaryRequestMessage
                {
                    TraceId = traceId,
                    MethodId = methodId,
                    Uri = httpRequest.RequestUri.ToString(),
                    HttpMethod = httpRequest.Method.ToString(),
                    Timestamp = DateTime.Now,
                    MachineName = Environment.MachineName,
                    Headers = httpRequest.Headers.GetHeaders(),
                    Content = (httpRequest.Content != null) ? await httpRequest.Content.ReadAsStringAsync() : "",
                };

                httpBoundaryRequestMessage.Broadcast();
            }

            args.MethodExecutionTag = new TraceAttributeContext(traceId, methodId, parentMethodId);
        }

        public override async void OnSuccess(MethodExecutionArgs args)
        {
            var context = (TraceAttributeContext)args.MethodExecutionTag;
            context.Stopwatch.Stop();

            PopParentMethodId();

            var httpResponse = args.ReturnValue as HttpResponseMessage;
            if (httpResponse != null)
            {
                var httpBoundaryResponseMessage = new TraceHttpBoundaryResponseMessage
                {
                    TraceId = context.TraceId,
                    MethodId = context.MethodId,
                    Timestamp = DateTime.Now,
                    Headers = httpResponse.Headers.GetHeaders(),
                    Content = (httpResponse.Content != null) ? await httpResponse.Content.ReadAsStringAsync() : "",
                    HttpStatusCode = httpResponse.StatusCode,         
                };

                httpBoundaryResponseMessage.Broadcast();
            }

            var message = new TraceMessage
            {
                TraceId = context.TraceId,
                MethodId = context.MethodId,
                ParentMethodId = context.ParentMethodId,
                TraceEvent = TraceEvent.OnMethodSuccess,
                Timestamp = DateTime.Now,
                MethodName = _methodName,
                ReturnValue = (args.ReturnValue != null) ? args.ReturnValue.ToString() : string.Empty,
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
                ExceptionMessage = (args.Exception != null) ? args.Exception.Message : string.Empty,
                Exception = (args.Exception != null) ? args.Exception.ToString() : string.Empty,
                TimeTakenInMilliseconds = context.Stopwatch.ElapsedMilliseconds
            };

            message.Broadcast();
        }

        private string PeekAndPushParentMethodId(string methodId, object instance)
        {
            var stack = ThreadLocalVariables.MethodIds;

            var headerValue = GetHeaderValue(instance, ParentMethodHeaderKey);
            if (!string.IsNullOrWhiteSpace(headerValue)) stack.Push(headerValue);

            var parentMethodId = (stack.Count > 0) ? stack.Peek() : string.Empty;
            stack.Push(methodId);
            return parentMethodId;
        }

        private void PopParentMethodId()
        {
            var stack = ThreadLocalVariables.MethodIds;
            stack.Pop();
        }

        private string GetTraceId(object instance)
        {
            var headerValue = GetHeaderValue(instance, TraceIdHeaderKey);
            if (!string.IsNullOrWhiteSpace(headerValue))
            {
                ThreadLocalVariables.TraceId = headerValue;
            }
            return ThreadLocalVariables.TraceId;
        }

        private string GetHeaderValue(object instance, string headerKey)
        {
            var nancyModule = instance as NancyModule;
            if (nancyModule == null) return string.Empty;

            var header = nancyModule.Request.Headers[headerKey];
            return (header != null) ? string.Join(";", nancyModule.Request.Headers[headerKey]) : string.Empty;
        }
    }
}
