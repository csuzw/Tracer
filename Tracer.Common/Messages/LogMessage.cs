using System;

namespace Tracer.Common.Messages
{
    public class LogMessage : BaseMessage
    {
        public LogType LogType { get; set; }
        public string Message { get; set; }
    }
}
