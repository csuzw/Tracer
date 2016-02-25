using System;
using System.Collections.Generic;

namespace Tracer.Common.Messages
{
    public class TraceMessage
    {
        public string TraceId { get; set; }
        public string MethodId { get; set; }
        public string ParentMethodId { get; set; }
        public TraceEvent TraceEvent { get; set; }
        public DateTime Timestamp { get; set; }
        public string MethodName { get; set; }
        public List<Argument> Arguments { get; set; }
        public string ReturnValue { get; set; }
        public string Exception { get; set; }
        public long TimeTakenInMilliseconds { get; set; }
    }
}
