using System.Collections.Generic;
using System.Linq;

namespace Tracer.Common.Extensions
{
    public static class HttpRequestMessageExtensions
    {
        public static Dictionary<string, string> GetHeaders(this IEnumerable<KeyValuePair<string, IEnumerable<string>>> httpRequestHeaders)
        {
            return httpRequestHeaders.ToDictionary(header => header.Key, header => header.Value.ToString());
        }
    }
}
