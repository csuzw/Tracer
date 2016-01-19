using Microsoft.Owin.Hosting;
using System;

namespace Tracer.Web
{
    class Program
    {
        static void Main(string[] args)
        {
            const string webUri = "http://localhost:8080";
            const string appUri = "http://localhost:8081";
            using (WebApp.Start<Tracer.Web.Startup>(webUri))
            using (WebApp.Start<Tracer.Application.Startup>(appUri))
            {
                Console.WriteLine("Application started at {0}", webUri);
                Console.ReadLine();
                Console.WriteLine("Application exiting...");
            }
        }
    }
}
