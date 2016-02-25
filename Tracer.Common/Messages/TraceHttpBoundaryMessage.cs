using System;
using System.Collections.Generic;

namespace Tracer.Common.Messages
{
    public class TraceHttpBoundaryMessage
    {
        public string TraceId { get; set; }
        public string ParentMethodId { get; set; }
        public string MethodId { get; set; }
        public TraceEvent TraceEvent { get; set; }
        public DateTime Timestamp { get; set; }
        public long TimeTakenInMilliseconds { get; set; }
        public string Uri { get; set; }
        public string HttpMethod { get; set; }
        public string ContentType { get; set; }
        public string Content { get; set; }
        public Dictionary<string, string> Headers { get; set; }
        public string MachineName { get; set; }
    }
}
