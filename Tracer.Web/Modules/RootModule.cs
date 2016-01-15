using Nancy;

namespace Tracer.Web.Modules
{
    public class RootModule : NancyModule
    {
        public RootModule()
        {
            Get["/"] = _ => View["trace.html"];
        }
    }
}
