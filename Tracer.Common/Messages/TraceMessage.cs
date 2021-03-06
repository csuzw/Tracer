﻿using System.Collections.Generic;

namespace Tracer.Common.Messages
{
    public class TraceMessage : BaseMessage
    {
        public string ParentMethodId { get; set; }
        public TraceEvent TraceEvent { get; set; }
        public string MethodName { get; set; }
        public List<Argument> Arguments { get; set; }
        public string ReturnValue { get; set; }
        public string Exception { get; set; }
        public long TimeTakenInMilliseconds { get; set; }
        public string MachineName { get; set; }
        public string WindowsUsername { get; set; }
        public string ExceptionMessage { get; set; }
    }
}
