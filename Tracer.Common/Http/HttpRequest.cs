using System.Collections.Generic;

namespace Tracer.Common.Http
{
    public class HttpRequest : IHttpRequest
    {
        public string Uri { get; private set; }
        public Dictionary<string, string> Headers { get; private set; }

        public HttpRequest(string uri, params object[] parameters)
        {
            Uri = string.Format(uri, parameters);
            Headers = new Dictionary<string, string>();
        }
    }
}
