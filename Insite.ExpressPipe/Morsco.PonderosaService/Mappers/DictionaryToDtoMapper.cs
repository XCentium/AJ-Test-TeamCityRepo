using System;
using System.Collections.Generic;
using System.Linq;

namespace Morsco.PonderosaService.Mappers
{
    public static class DictionaryToDtoMapper
	{
		public static T Map<T>(List<KeyValuePair<string, string>> input) where T:new()
		{
			T result = new T();
			var props = typeof(T).GetProperties();

			foreach (KeyValuePair<string, string> kvp in input)
			{
				var name = kvp.Key.Replace("_", string.Empty);
				var prop = props.FirstOrDefault(x => x.Name.Equals(name, StringComparison.CurrentCultureIgnoreCase));
				if (prop != null)
				{
					if (prop.PropertyType == typeof(string))
					{
						prop.SetValue(result, kvp.Value);
					}
					else if (prop.PropertyType == typeof(Int32))
					{
						prop.SetValue(result, Int32.Parse((string.IsNullOrWhiteSpace(kvp.Value)) ? "0" : kvp.Value));
					}
					else if (prop.PropertyType == typeof(Decimal))
					{
						prop.SetValue(result, decimal.Parse((string.IsNullOrWhiteSpace(kvp.Value))? "0.0" : kvp.Value));
					}
					else if (prop.PropertyType == typeof(DateTime))
					{
						prop.SetValue(result, DateTime.Parse(kvp.Value));
					} 
					else if (prop.PropertyType == typeof(DateTime?))
					{
						prop.SetValue(result, decimal.Parse((string.IsNullOrWhiteSpace(kvp.Value))? null : kvp.Value));
					} 
					else
					{
						throw (new Exception("DictionaryToDTOMapper does not handle this variable type for output: " + prop.PropertyType.Name));
					}
				}
			}
			return result;
		}
	}
}
