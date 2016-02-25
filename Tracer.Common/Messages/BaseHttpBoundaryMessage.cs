using System.Collections.Generic;

namespace Tracer.Common.Messages
{
    public class BaseHttpBoundaryMessage : BaseMessage
    {
        public string Content { get; set; }
        public Dictionary<string, string> Headers { get; set; }
    }
}
