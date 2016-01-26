using System.Collections.Generic;
using PostSharp.Aspects;
using Tracer.Common.Messages;

namespace Tracer.PostSharp.Extensions
{
    public static class MethodExecutionArgsExtensions
    {
        public static List<Argument> GetMethodArguments(this MethodExecutionArgs args)
        {
            var arguments = new List<Argument>();
            var reflectedMethodParameters = args.Method.GetParameters();

            for (var i = 0; i < reflectedMethodParameters.Length; i++)
            {
                arguments.Add(new Argument
                {
                    Name = reflectedMethodParameters[i].Name,
                    Value = args.Arguments.GetArgument(i).ToJson()
                });
            }

            return arguments;
        }
    }
}
