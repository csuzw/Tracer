using PostSharp.Extensibility;
using System;

namespace Tracer.PostSharp
{
    [Serializable]
    [MulticastAttributeUsage(MulticastTargets.Method)] // ignore constructors
    public class TraceBoundaryAttribute : TraceAttributeBase
    {
        protected override Guid GetTraceId()
        {
            // TODO need to store this in thread/context/whatever
            return Guid.NewGuid();
        }
    }
}
