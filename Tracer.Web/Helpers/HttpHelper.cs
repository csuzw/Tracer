using System;
using System.Net.Http;
using Tracer.Common.Http;

namespace Tracer.Web.Helpers
{
    public class HttpHelper
    {
        public string GetString(IHttpRequest request)
        {
            var response = Get(request);

            if (response.IsSuccessStatusCode)
            {
                return response.Content.ReadAsStringAsync().Result;
            }
            return string.Format("{0} ({1})", response.StatusCode, response.ReasonPhrase);
        }

        private HttpResponseMessage Get(IHttpRequest request)
        {
            var client = new HttpClient();

            foreach (var header in request.Headers)
            {
                client.DefaultRequestHeaders.Add(header.Key, header.Value);
            }

            var response = client.GetAsync(new Uri(request.Uri)).Result;

            return response;
        }
    }
}
