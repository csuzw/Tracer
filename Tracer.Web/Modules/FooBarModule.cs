using Nancy;
using Tracer.Application;

namespace Tracer.Web.Modules
{
    public class FooBarModule : NancyModule
    {
        private readonly FooLogic _foo;

        public FooBarModule() : base("/foobar")
        {
            _foo = new FooLogic();

            Get["/{input:int}"] = parameters => FooBar(parameters.input);
        }

        public string FooBar(int input)
        {
            var message = _foo.Foo(input);

            return message;
        }
    }
}
