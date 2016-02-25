using System;
using System.Net.Http;
using Nancy;
using Tracer.Common;
using Tracer.Web.Helpers;

namespace Tracer.Web.Modules
{
    public class FooBarModule : NancyModule
    {
        private readonly HttpHelper _httpHelper = new HttpHelper();

        private const string ApplicationUri = "{0}/application/depth/{1}/width/{2}";

        public FooBarModule() : base("/foobar")
        {
            Get["/depth/{depth:int}/width/{width:int}"] = parameters =>
            {
                var uri = string.Format(ApplicationUri, Constants.ApplicationUri, parameters.depth, parameters.width);

                var request = new HttpRequestMessage(HttpMethod.Get, new Uri(uri));

                return _httpHelper.Get(request);
            };
        }
    }
}
