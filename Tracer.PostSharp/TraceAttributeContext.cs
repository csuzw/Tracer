using System.Diagnostics;

namespace Tracer.PostSharp
{
    public class TraceAttributeContext
    {
        public string TraceId { get; private set; }
        public string MethodId { get; private set; }
        public Stopwatch Stopwatch { get; private set; }

        public TraceAttributeContext(string traceId, string methodId)
        {
            TraceId = traceId;
            MethodId = methodId;
            Stopwatch = Stopwatch.StartNew();
        }
    }
}
