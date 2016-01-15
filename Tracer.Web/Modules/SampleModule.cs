using Nancy;
using Tracer.Application;

namespace Tracer.Web.Modules
{
    public class SampleModule : NancyModule
    {
        private readonly FooLogic _foo;

        public SampleModule()
        {
            _foo = new FooLogic();

            Get["/"] = _ => View["trace.html"];
            Get["/foobar/{input:int}"] = parameters => FooBar(parameters);
        }

        public string FooBar(dynamic parameters)
        {
            var message = _foo.Foo(parameters.input);

            return message;
        }
    }
}
