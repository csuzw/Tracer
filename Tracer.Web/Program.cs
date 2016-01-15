using Microsoft.Owin.Hosting;
using System;

namespace Tracer.Web
{
    class Program
    {
        static void Main(string[] args)
        {
            var uri = "http://localhost:8080";
            using (WebApp.Start<Startup>(uri))
            {
                Console.WriteLine("Application started at {0}", uri);
                Console.ReadLine();
                Console.WriteLine("Application exiting...");
            }
        }
    }
}
