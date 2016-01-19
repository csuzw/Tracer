using Nancy;
using Tracer.Common.Http;
using Tracer.Web.Helpers;

namespace Tracer.Web.Modules
{
    public class FooBarModule : NancyModule
    {
        private readonly HttpHelper _httpHelper = new HttpHelper();

        private const string ApplicationUri = "http://localhost:8081/application/{0}";

        public FooBarModule() : base("/foobar")
        {
            Get["/{input:int}"] = parameters => _httpHelper.GetString(new HttpRequest(ApplicationUri, parameters.input));
        }
    }
}
