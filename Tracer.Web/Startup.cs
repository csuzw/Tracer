using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Cors;
using Owin;

namespace Tracer.Web
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var hubConfig = new HubConfiguration { EnableDetailedErrors = true };
            app
                .UseCors(CorsOptions.AllowAll)
                .MapSignalR(hubConfig)
                .UseNancy();
        }
    }
}
