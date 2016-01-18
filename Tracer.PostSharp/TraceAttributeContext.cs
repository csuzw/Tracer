using System.Diagnostics;

namespace Tracer.PostSharp
{
    public class TraceAttributeContext
    {
        public string TraceId { get; private set; }
        public string MethodId { get; private set; }
        public string ParentMethodId { get; private set; }
        public Stopwatch Stopwatch { get; private set; }

        public TraceAttributeContext(string traceId, string methodId, string parentMethodId)
        {
            TraceId = traceId;
            MethodId = methodId;
            ParentMethodId = parentMethodId;
            Stopwatch = Stopwatch.StartNew();
        }
    }
}
