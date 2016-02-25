using System;
using Tracer.Common.Messages;

namespace Tracer.Common.Extensions
{
    public static class LogExtensions
    {
        public static void Log(this LogType logType, string message, params object[] args)
        {
            var formattedMessage = string.Format(message, args);
            var logMessage = new LogMessage
            {
                TraceId = ThreadLocalVariables.TraceId,
                MethodId = ThreadLocalVariables.MethodId,
                Timestamp = DateTime.Now,
                LogType = logType,
                Message = formattedMessage
            };

            logMessage.Broadcast();
        }
    }
}
