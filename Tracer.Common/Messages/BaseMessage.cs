using System;

namespace Tracer.Common.Messages
{
    public class BaseMessage
    {
        public string TraceId { get; set; }
        public string MethodId { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
