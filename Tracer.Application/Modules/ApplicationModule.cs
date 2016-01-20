using Nancy;
using Tracer.Application.Logic;

namespace Tracer.Application.Modules
{
    public class ApplicationModule : NancyModule
    {
        public ApplicationModule()
            : base("/application")
        {
            Get["/depth/{depth:int}/width/{width:int}"] = parameters => GetSomething(parameters.depth, parameters.width);
        }

        public string GetSomething(int depth, int width)
        {
            return new FooLogic(depth, width).Dog(0);
        }
    }
}
