using Nancy;

namespace Tracer.Web.Modules
{
    public class GraphModule : NancyModule
    {
        public GraphModule()
        {
            Get["/graph"] = _ => View["graph.html"];
        }
    }
}
