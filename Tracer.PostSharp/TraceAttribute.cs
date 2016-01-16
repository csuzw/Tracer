﻿using PostSharp.Extensibility;
using System;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method)] // ignore constructors
    public class TraceAttribute : TraceAttributeBase
    {
        protected override Guid GetTraceId()
        {
            // TODO need to retrieve this from thread/context/whatever
            return Guid.Empty;
        }
    }
}
