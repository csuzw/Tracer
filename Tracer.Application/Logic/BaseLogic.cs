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
                called = string.Join(", ", Enumerable.Range(0, callCount).Select(_ =>
                {
                    try
                    {
                        return _randomMethods[_random.Next(0, _randomMethods.Count)](depth + 1);
                    }
                    catch (Exception e)
                    {
                        return e.Message;
                    }
                }));
            }
            var randomInterval = _random.Next(0, 1000);
            Thread.Sleep(randomInterval);

            var randomException = _random.Next(0, 100);
            if (randomException > 90)
            {
                throw new Exception(string.Format("{0} failed!", text));
            }

            return (!string.IsNullOrEmpty(called)) ? string.Format("{0} [{1}]", text, called) : text;
        }
    }
}
