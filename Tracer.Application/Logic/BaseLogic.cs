using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Tracer.Application.Logic
{
    public abstract class BaseLogic
    {
        private readonly List<Func<int, string>> _randomMethods = new List<Func<int, string>>(); 
        private readonly Random _random = new Random();

        protected abstract int MaxDepth { get; }
        protected abstract int MaxWidth { get; }

        protected void Register(Func<int, string> randomMethod)
        {
            _randomMethods.Add(randomMethod);
        }

        protected string DoRandom(string text, int depth)
        {
            var called = string.Empty;
            if (depth != MaxDepth)
            {
                var callCount = _random.Next(0, MaxWidth + 1);
                called = string.Join(", ", Enumerable.Range(0, callCount).Select(_ => _randomMethods[_random.Next(0, _randomMethods.Count)](depth + 1)));
            }
            var randomInterval = _random.Next(0, 1000);
            Thread.Sleep(randomInterval);

            return (!string.IsNullOrEmpty(called)) ? string.Format("{0} [{1}]", text, called) : text;
        }
    }
}
