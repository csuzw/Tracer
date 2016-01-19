using System;
using System.Threading;

namespace Tracer.Application.Logic
{
    public class FooLogic
    {
        private readonly BarLogic _bar = new BarLogic();
        private readonly Random _random = new Random();

        public string Foo(int input)
        {
            Sleep(_random.Next(1, 3000));

            return string.Format("The number {0} was received at approximately {1}!", input, _bar.Bar());
        }

        public void Sleep(int interval)
        {
            Thread.Sleep(interval);
        }
    }
}
