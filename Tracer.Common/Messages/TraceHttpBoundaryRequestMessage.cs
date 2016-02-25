namespace Tracer.Common.Messages
{
    public class TraceHttpBoundaryRequestMessage : BaseHttpBoundaryMessage
    {
        public string Uri { get; set; }
        public string HttpMethod { get; set; }
        public string MachineName { get; set; }
    }
}
