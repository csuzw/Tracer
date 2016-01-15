using System;
using System.Threading.Tasks;

namespace Tracer.Common.Extensions
{
    public static class TaskExtensions
    {
        public static async void FireAndForget(this Task task)
        {
            try
            {
                await task;
            }
            catch (Exception e)
            {
                Console.WriteLine("FireAndForget Exception: {0}", e);
            }
        }
    }
}
