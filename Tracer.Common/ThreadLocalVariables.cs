using System;
using System.Collections.Generic;
using System.Threading;

namespace Tracer.Common
{
    public static class ThreadLocalVariables
    {
        private static readonly ThreadLocal<string> _traceId = new ThreadLocal<string>(() => Guid.NewGuid().ToString());
        private static readonly ThreadLocal<Stack<string>> _methodIds = new ThreadLocal<Stack<string>>(() => new Stack<string>());

        public static string TraceId
        {
            get { return _traceId.Value; }
            set { _traceId.Value = value; }
        }

        public static Stack<string> MethodIds
        {
            get { return _methodIds.Value; }
        }

        public static string MethodId
        {
            get { return _methodIds.Value.Peek(); }
        }
    }
}
