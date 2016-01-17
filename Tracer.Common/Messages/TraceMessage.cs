﻿using System.Collections.Generic;

namespace Tracer.Common.Messages
{
    public class TraceMessage
    {
        public string TraceId { get; set; }
        public string MethodId { get; set; }
        public TraceEvent TraceEvent { get; set; }
        public string MethodName { get; set; }
        public List<string> Arguments { get; set; }
        public string ReturnValue { get; set; }
        public string Exception { get; set; }
        public long TimeTakenInMilliseconds { get; set; }
    }
}
