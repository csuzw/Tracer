using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Cors;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Owin;

namespace Tracer.Web
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var serializerSettings = new JsonSerializerSettings();
            serializerSettings.Converters.Add(new StringEnumConverter());
            var serializer = JsonSerializer.Create(serializerSettings);

            GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => serializer);

            var hubConfig = new HubConfiguration { EnableDetailedErrors = true };
            app
                .UseCors(CorsOptions.AllowAll)
                .MapSignalR(hubConfig)
                .UseNancy();
        }
    }
}
