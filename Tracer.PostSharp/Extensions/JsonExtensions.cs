using Newtonsoft.Json;

namespace Tracer.PostSharp.Extensions
{
    public static class JsonExtensions
    {
        public static string ToJson(this object objectValue)
        {
            try
            {
                var serializerSettings = new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                };

                return JsonConvert.SerializeObject(
                    objectValue,
                    Formatting.Indented,
                    serializerSettings);
            }
            catch
            {

            }

            return "";
        }
    }
}
