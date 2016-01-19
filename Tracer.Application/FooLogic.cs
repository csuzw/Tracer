using System.Threading;
using Tracer.Application.Logic;

namespace Tracer.Application
{
    public class FooLogic
    {
        private readonly BarLogic _bar = new BarLogic();

        public string Foo(int input)
        {
            Wee();

            return string.Format("The number {0} was received at approximately {1}!", input, _bar.Bar());
        }

        public void Wee()
        {
            Thread.Sleep(2000);
        }
    }
}
