using Nancy;
using Tracer.Common;
using Tracer.Common.Http;
using Tracer.Web.Helpers;

namespace Tracer.Web.Modules
{
    public class FooBarModule : NancyModule
    {
        private readonly HttpHelper _httpHelper = new HttpHelper();

        private const string ApplicationUri = "{0}/application/{1}";

        public FooBarModule() : base("/foobar")
        {
            Get["/{input:int}"] = parameters => _httpHelper.GetString(new HttpRequest(ApplicationUri, Constants.ApplicationUri, parameters.input));
        }
    }
}
