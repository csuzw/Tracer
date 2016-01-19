using Nancy;
using Tracer.Application.Logic;

namespace Tracer.Application.Modules
{
    public class ApplicationModule : NancyModule
    {
        private readonly FooLogic _foo;

        public ApplicationModule()
            : base("/application")
        {
            _foo = new FooLogic();

            Get["/{input:int}"] = parameters => WouldPreferNotToHaveToMakeThisMethod(parameters.input);
        }

        public string WouldPreferNotToHaveToMakeThisMethod(int input)
        {
            return _foo.Foo(input);
        }
    }
}
