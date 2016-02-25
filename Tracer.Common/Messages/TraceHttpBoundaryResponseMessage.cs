using System.Net;

namespace Tracer.Common.Messages
{
    public class TraceHttpBoundaryResponseMessage : BaseHttpBoundaryMessage
    {
        public HttpStatusCode HttpStatusCode { get; set; }
    }
}
