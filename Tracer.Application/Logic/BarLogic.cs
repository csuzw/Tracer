namespace Tracer.Application.Logic
{
    public sealed class BarLogic : BaseLogic
    {
        private readonly int _maxDepth;
        private readonly int _maxWidth;

        protected override int MaxDepth { get { return _maxDepth; } }
        protected override int MaxWidth { get { return _maxWidth; } }

        public BarLogic(FooLogic foo, int maxDepth, int maxWidth)
        {
            _maxDepth = maxDepth;
            _maxWidth = maxWidth;
            Register(Duck);
            Register(Horse);
            Register(Elephant);
            Register(Fox);
            Register(foo.Cat);
            Register(foo.Dog);
            Register(foo.Cow);
            Register(foo.Sheep);
        }

        public string Duck(int depth)
        {
            return DoRandom("Quack", depth);
        }

        public string Horse(int depth)
        {
            return DoRandom("Neigh", depth);
        }

        public string Elephant(int depth)
        {
            return DoRandom("Toot", depth);
        }

        public string Fox(int depth)
        {
            return DoRandom("Wa-pa-pa-pa-pa-pa-pow!", depth);
        }
    }
}
