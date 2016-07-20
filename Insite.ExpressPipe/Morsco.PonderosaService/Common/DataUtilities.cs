using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Common
{
    public static class DataUtilities
    {
        #region Utility Methods
        /// <summary>
        /// Different overloads of SetEntryIfNotNull
        /// Cannot do Generics with Nullables
        /// </summary>
        /// <param name="dict"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public static void SetEntryIfNotNull(IDictionary<string, object> dict, string key, int? value)
        {
            if (value.HasValue)
            {
                dict[key] = value.Value;
            }
        }
        public static void SetEntryIfNotNull(IDictionary<string, object> dict, string key, DateTime? value)
        {
            if (value.HasValue)
            {
                dict[key] = value.Value;
            }
        }
        public static void SetEntryIfNotNull(IDictionary<string, object> dict, string key, decimal? value)
        {
            if (value.HasValue)
            {
                dict[key] = value.Value;
            }
        }
        public static void SetEntryIfNotNull(IDictionary<string, object> dict, string key, string value)
        {
            if (value != null)
            {
                dict[key] = value;
            }
        }
        public static void SetEntryIfNotNull(IDictionary<string, object> dict, string key, bool? value)
        {
            if (value != null)
            {
                dict[key] = value;
            }
        }
        public static void SetEntryIfNotNullOrEmpty(IDictionary<string, object> dict, string key, IList<string> value)
        {
            if (value != null && value.Any())
            {
                dict[key] = value.ToArray();
            }
        }
        public static void SetEntryIfNotNullOrEmpty(IDictionary<string, object> dict, string key, IList<Int32> value)
        {
            if (value != null && value.Any())
            {
                dict[key] = value.ToArray();
            }
        }

		public static void SetEntryIfNotNullOrWhiteSpace(IDictionary<string, object> dict, string key, string value)
		{
			if (!string.IsNullOrWhiteSpace(value))
			{
				dict[key] = value;
			}
		}

        public static T GetHeaderValue<T>(HeaderDetailResult source, string key)
        {
            //Evidently everything can be accessed as a string.  The string will be empty if no value is found.
            var result = ConvertValue<T>("");
            if (source == null) return result;
            try
            {
                var test = source.GetHeaderValue(key);

                // Weve discovered that some values (ShipTo_Id as one) come in as lists of objects with 1 element
                // if that's the case and we don't actually want a list, get the element out of this list
                if (test is IList<object> && !(result is IList<object>))
                {
                    var list = test as IList<object>;
                    if (list.Count == 1)
                    {
                        test = list[0];
                    }
                }

                result = ConvertValue<T>((string) test);
            }
            catch
            {
                //deliberately eating exceptions..
            }

            return result;
        }

        public static T GetValue<T>(DataResult source, string key)
        {
            //Evidently everything can be accessed as a string.  The string will be empty if no value is found.
            var result = ConvertValue<T>("");
            if (source == null) return result;
            try
            {
                var test = source.GetValue(key);
                var list = test as IList<object>;
                result = list != null ? ConvertValue<T>(string.Join(",", list.ToArray())) : ConvertValue<T>((string) test);
            }
            catch
            {
                //deliberately eating exceptions..
            }
            return result;
        }

        public static T ConvertValue<T>(string value)
        {
            var type = typeof(T);
            if (typeof(T).Name == typeof(int).Name && value == "") { value = "0"; }
            T result = default(T);

            if (value == null) return result;
            if (type == typeof(bool?))
            {
                value = ((string)value == "1") ? "true" : "false";
            }

            var converter = TypeDescriptor.GetConverter(type);
            var a = converter.ConvertFrom(value);
            result = (T)a;

            return result;
        }

        public static IList<string> GetListOfStrings(DataResult source, string key)
        {
            var test = source?.GetArray(key);
            return test?.ToList() ?? new List<string>();
        }

        public static IList<string> GetListOfStrings(HeaderDetailResult source, string key)
        {
            List<string> result = null;

            var temp = source?.GetHeaderValue(key);
            if (temp is List<object>)
            {
                result = (temp as List<object>).Select(x => x.ToString()).ToList();
            }
            return result;
        }

        private static IList<Int32> GetListOfInts(DataResult source, string key)
        {
            var test = source?.GetArray(key);
            return test?.Select(Int32.Parse).ToList() ?? new List<Int32>();
        }

        public static List<Dictionary<string, object>> GetListOfObjects(RowResult source, string key)
        {
            var test = (List<Dictionary<string, object>>)source.GetValue(key);
            return test ?? new List<Dictionary<string, object>>();
        }
        #endregion

    }
}
