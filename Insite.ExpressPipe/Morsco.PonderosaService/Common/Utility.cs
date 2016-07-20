using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Text;
using Insite.Data.Entities;

namespace Morsco.PonderosaService.Common
{
    internal static class Utility
    {
        internal static bool IsNumeric(string val, System.Globalization.NumberStyles NumberStyle)
        {
            Double result;
            return Double.TryParse(val, NumberStyle,
                System.Globalization.CultureInfo.CurrentCulture, out result);
        }

        internal static T GetConfigValueWithDefault<T>(string configurationKey, T defaultValue)
        {
            T result = defaultValue;

            var test = ConfigurationManager.AppSettings[configurationKey];
            var converter = TypeDescriptor.GetConverter(typeof (T));
            if (test != null && converter != null)
            {
                result = (T) converter.ConvertFromString(test);
            }
            return result;
        }

        internal static string GetParameterString(MethodInfo methodInfo, object[] parameters)
        {
            var result = new StringBuilder();
            var param = 0;

            foreach (var parameterInfo in methodInfo.GetParameters())
            {
                result.Append(parameterInfo.Name);
                result.Append(": ");

                var obj = parameters[param];

                //We only need lists of ints at this point
                if (obj == null)
                {
                    result.Append("null");
                }
                else if (obj is IEnumerable<int>)
                {
                    result.Append(string.Join(", ", (obj as IEnumerable<int>).Select(x => x.ToString())));
                }
                else if (obj is Customer)
                {
                    var cust = obj as Customer;
                    result.Append(cust.CustomerNumber + "/" + cust.CustomerSequence);
                }
                else
                {
                    result.Append(parameters[param]);
                }
                result.Append("; ");
                param++;
            }
            return result.ToString();
        }

        internal static bool StringStartsWithListMember(string test, string[] list)
        {
            return list.Any(test.StartsWith);
        }

        internal static string ReplaceTabChar(string value)
        {
            // tab-character
            char tab = '\u0009';
            return value.Replace(tab.ToString(), "    ");
        }
    }
}
