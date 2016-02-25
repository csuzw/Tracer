namespace Tracer.Common.Messages
{
    public class BaseHttpBoundaryMessage : BaseMessage
    {
        public string ContentType { get; set; }
        public string Content { get; set; }
        public string MachineName { get; set; }
    }
}
