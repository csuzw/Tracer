namespace Tracer.Application.Logic
{
    public sealed class FooLogic : BaseLogic
    {
        private readonly int _maxDepth;
        private readonly int _maxWidth;

        protected override int MaxDepth { get { return _maxDepth; } }
        protected override int MaxWidth { get { return _maxWidth; } }

        public FooLogic(int maxDepth, int maxWidth)
        {
            _maxDepth = maxDepth;
            _maxWidth = maxWidth;
            var bar = new BarLogic(this, maxDepth, maxWidth);
            Register(Cat);
            Register(Dog);
            Register(Cow);
            Register(Sheep);
            Register(bar.Duck);
            Register(bar.Horse);
            Register(bar.Elephant);
            Register(bar.Fox);
        }

        public string Cat(int depth)
        {
            return DoRandom("Meow", depth);
        }

        public string Dog(int depth)
        {
            return DoRandom("Woof", depth);
        }

        public string Cow(int depth)
        {
            return DoRandom("Moo", depth);
        }

        public string Sheep(int depth)
        {
            return DoRandom("Baa", depth);
        }
    }
}
