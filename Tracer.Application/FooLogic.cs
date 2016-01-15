namespace Tracer.Application
{
    public class FooLogic
    {
        private readonly BarLogic _bar = new BarLogic();

        public string Foo(int input)
        {
            return string.Format("The number {0} was received at approximately {1}!", input, _bar.Bar());
        }
    }
}
