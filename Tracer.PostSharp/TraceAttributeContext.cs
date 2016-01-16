using System;
using System.Diagnostics;

namespace Tracer.PostSharp
{
    public class TraceAttributeContext
    {
        public Guid TraceId { get; private set; }
        public Guid MethodId { get; private set; }
        public Stopwatch Stopwatch { get; private set; }

        public TraceAttributeContext(Guid traceId, Guid methodId)
        {
            TraceId = traceId;
            MethodId = methodId;
            Stopwatch = Stopwatch.StartNew();
        }
    }
}
