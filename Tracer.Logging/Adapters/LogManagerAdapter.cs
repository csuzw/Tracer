using System;

namespace Tracer.Logging.Adapters
{
    public class LogManagerAdapter
    {
        public static LoggerAdapter GetLogger(Type type)
        {
            return new LoggerAdapter(type);
        }
    }
}
