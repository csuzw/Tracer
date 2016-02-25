namespace Tracer.Common.Messages
{
    public class TraceHttpBoundaryResponseMessage : BaseHttpBoundaryMessage
    {
        public string HttpStatusCode { get; set; }
    }
}
