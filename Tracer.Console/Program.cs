using Microsoft.Owin.Hosting;
using Tracer.Common;

namespace Tracer.Console
{
    class Program
    {
        static void Main(string[] args)
        {
            using (WebApp.Start<Tracer.Web.Startup>(Constants.WebUri))
            using (WebApp.Start<Tracer.Application.Startup>(Constants.ApplicationUri))
            {
                System.Console.WriteLine("Application started at {0}", Constants.WebUri);
                System.Console.ReadLine();
                System.Console.WriteLine("Application exiting...");
            }
        }
    }
}
