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

            Get["/{input:int}"] = parameters => FooBar(parameters);
        }

        public string FooBar(dynamic parameters)
        {
            var message = _foo.Foo(parameters.input);

            return message;
        }
    }
}
