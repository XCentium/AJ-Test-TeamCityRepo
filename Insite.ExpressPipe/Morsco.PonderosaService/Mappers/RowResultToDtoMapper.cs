using System;
using System.Linq;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Mappers
{
    static class RowResultToDtoMapper
	{

		public static T Map<T>(RowResult input) where T : new()
		{
			T result = new T();
			var props = typeof (T).GetProperties();

			foreach (var label in input.FieldNames())
			{
				var value = input.GetValue(label).ToString();
				var name = label.Replace("_", string.Empty);
				var prop = props.FirstOrDefault(x => x.Name.Equals(name, StringComparison.CurrentCultureIgnoreCase));
				if (prop != null)
				{
					if (prop.PropertyType == typeof (string))
					{
						prop.SetValue(result, value);
					}
					else if (prop.PropertyType == typeof (Int32))
					{
						prop.SetValue(result, Int32.Parse((string.IsNullOrWhiteSpace(value)) ? "0" : value));
					}
					else if (prop.PropertyType == typeof (Decimal))
					{
						prop.SetValue(result, decimal.Parse((string.IsNullOrWhiteSpace(value)) ? "0.0" : value));
					}
					else if (prop.PropertyType == typeof (DateTime))
					{
						prop.SetValue(result, DateTime.Parse(value));
					}
					else if (prop.PropertyType == typeof (DateTime?))
					{
						prop.SetValue(result, decimal.Parse((string.IsNullOrWhiteSpace(value)) ? null : value));
					}
					else
					{
						throw (new Exception("RowResultToDTOMapper does not handle this variable type for output: " +
						                     prop.PropertyType.Name));
					}
				}
			}
			return result;
		}
	}
}
