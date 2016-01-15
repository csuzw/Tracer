using System;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.Conventions;
using Nancy.TinyIoc;
using System.Reflection;
using System.IO;
using TracerAttributes;

namespace Tracer.Web
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);
            this.Conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("Scripts"));
        }

        protected override IRootPathProvider RootPathProvider
        {
            get
            {
                return new ServiceRootPathProvider();
            }
        }
    }

    public class ServiceRootPathProvider : IRootPathProvider
    {
        [NoTrace]
        public string GetRootPath()
        {
            var assembly = Assembly.GetEntryAssembly() ?? Assembly.GetExecutingAssembly();

            var assemblyPath = Path.GetDirectoryName(assembly.Location) ?? Environment.CurrentDirectory;

            var rootPath = Path.GetFullPath(Path.Combine(assemblyPath, "..", ".."));

            return rootPath;
        }
    }
}
