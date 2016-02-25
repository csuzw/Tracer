using System.Net.Http;

namespace Tracer.Web.Helpers
{
    public class HttpHelper
    {
        public HttpResponseMessage Get(HttpRequestMessage request)
        {
            var client = new HttpClient();

            foreach (var header in request.Headers)
            {
                client.DefaultRequestHeaders.Add(header.Key, header.Value);
            }

            var response = client.GetAsync(request.RequestUri).Result;

            return response;
        }
    }
}
