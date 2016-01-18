using System.Collections.Generic;

namespace Tracer.Common.Http
{
    public interface IHttpRequest
    {
        Dictionary<string, string> Headers { get; }
    }
}
