using System;

namespace Tracer.Fody.Adapters
{
    public class LoggerAdapter
    {
        private readonly Type _type;

        public LoggerAdapter(Type type)
        {
            _type = type;
        }

        public void TraceEnter(string methodInfo, string[] paramNames, object[] paramValues)
        {
            throw new NotImplementedException();
        }

        public void TraceLeave(string methodInfo, long startTicks, long endTicks, string[] paramNames, object[] paramValues)
        {
            throw new NotImplementedException();
        }
    }
}
