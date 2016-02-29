using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Tracer.Common.Extensions;
using Tracer.Common.Messages;

namespace Tracer.Application.Logic
{
    public abstract class BaseLogic
    {
        private readonly List<Func<int, string>> _randomMethods = new List<Func<int, string>>(); 
        private readonly Random _random = new Random();
        private readonly List<string> _logMessages = new List<string>
        {
            "A {0} happened.",
            "{0}! {0}! {0}!",
            "What noise does a fox make?",
            "Something interesting?",
            "I am broken!"
        };

        protected abstract int MaxDepth { get; }
        protected abstract int MaxWidth { get; }

        protected void Register(Func<int, string> randomMethod)
        {
            _randomMethods.Add(randomMethod);
        }

        public string Hullabaloo()
        {
            try
            {
                return _randomMethods[_random.Next(0, _randomMethods.Count)](0);
            }
            catch (Exception e)
            {
                return e.Message;
            }
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

            var randomEvent = _random.Next(0, 100);
            if (randomEvent > 90)
            {
                throw new Exception(string.Format("{0} failed!", text));
            }
            else if (randomEvent > 70)
            {
                for (int i = 0; i < _random.Next(1, 4); i++)
                {
                    var logType = (LogType)_random.Next(1, 4);
                    logType.Log(_logMessages[_random.Next(0, _logMessages.Count)], text);
                }
            }

            return (!string.IsNullOrEmpty(called)) ? string.Format("{0} [{1}]", text, called) : text;
        }
    }
}
