using Owin;
using Tracer.PostSharp;

namespace Tracer.Application
{
    [Trace(AttributeExclude = true)]
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseNancy();
        }
    }
}
