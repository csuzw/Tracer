using System;

namespace Tracer.Common.Messages
{
    public class LogMessage
    {
        public string TraceId { get; set; }
        public string MethodId { get; set; }
        public LogType LogType { get; set; }
        public DateTime Timestamp { get; set; }
        public string Message { get; set; }
    }
}
