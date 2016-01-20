using Nancy;
using Tracer.Application.Logic;

namespace Tracer.Application.Modules
{
    public class ApplicationModule : NancyModule
    {
        private readonly FooLogic _foo = new FooLogic();

        public ApplicationModule()
            : base("/application")
        {
            Get["/{input:int}"] = parameters => GetSomething(parameters.input);
        }

        public string GetSomething(int input)
        {
            return _foo.Foo(input);
        }
    }
}
