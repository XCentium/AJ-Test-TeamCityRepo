using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Mappers;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Common
{
    public class DbResultHandler : ResultHandler
	{
		//TODO Remove these
		//private DataRepository dataRepository = new DataRepository();
		//private int rows = 0;
		
		private readonly PropertyInfo[] headerProperties = typeof(OrderHeaderScrub).GetProperties();
		private readonly PropertyInfo[] detailProperties = typeof(OrderDetailScrub).GetProperties();
		private readonly StreamWriter headerWriter = null;
		private readonly StreamWriter detailWriter = null;
		private int rowCount = 0;

		public DbResultHandler(string headerFileName, string detailFileName)
		{
			headerWriter = File.CreateText(headerFileName);
			detailWriter = File.CreateText(detailFileName);
			WriteHeader(headerProperties, headerWriter);
			WriteHeader(detailProperties, detailWriter);
		}

		/// <summary>
		/// Store the next table row which is wrapped in the supplied Result object.
		/// </summary>
		public override void StoreResult(Result genericResult)
		{
			// Look for specific result type
			// and ignore anything else.
			if (genericResult is HeaderDetailResult)
			{
				var result = (HeaderDetailResult)genericResult;
				//?? May or may not be multi-generation
				DisplayOrder(result, true);
			}

			rowCount++;
			Console.WriteLine(rowCount);
			if (rowCount > 1000)
			{
				throw new Exception("Got to 100!");
			}
		}


		private void DisplayOrder(HeaderDetailResult result, bool multiGen)
		{
			// Header
			RowResult header = result.GetHeaderResult();

			if (!header.IsIndexed("Generation"))
			{
				// Single generation
				string orderNo = result.GetHeaderString(Constants.OrderHeaderConstants.Order_No);
				int generation = result.GetInt("Generation");
				ProcessHeader(header);

				DisplayDetail(result, orderNo, generation);
			}
			else
			{
				// Multiple generations
				string orderNo = result.GetHeaderString(Constants.OrderHeaderConstants.Order_No);
				int generationCount = header.GetElementCount("Generation");
				for (int index = 0; index < generationCount; index++)
				{
					HeaderDetailResult generation = result.GetHeaderDetailSlice("Generation", index);
					int generationNo = generation.GetHeaderInt("Generation");
					ProcessHeader(generation.GetHeaderResult());
					result.Reset();
					while (generation.HasNext())
					{
						ProcessDetail(generation.GetRowResult(), orderNo, generationNo.ToString());
					}
				}
			}
		}


		private void ProcessHeader(RowResult result)
		{
			var values = GetValues(string.Empty, result, new List<KeyValuePair<string, string>>());
			var hdr = DictionaryToDtoMapper.Map<OrderHeaderScrub>(values);

			WriteSerialized(hdr, headerProperties, headerWriter);
			//return dataRepository.InsertOrderHeaderScrub(hdr);
		}

		private void ProcessDetail(RowResult result, string orderNo, string generation)
		{
			var values = GetValues(string.Empty, result, new List<KeyValuePair<string, string>>());
			var detail = DictionaryToDtoMapper.Map<OrderDetailScrub>(values);
			detail.OrderNo = orderNo;
			detail.Generation = generation;
			WriteSerialized(detail, detailProperties, detailWriter);
			//var rows = dataRepository.InsertOrderDetailScrub(detail);
		}

		private List<KeyValuePair<string, string>> GetValues(string suffix, RowResult result, List<KeyValuePair<string, string>> values)
		{
			if (!string.IsNullOrEmpty(suffix))
			{
				suffix = suffix + "/";
			}

			foreach (var label in result.FieldNames())
			{

				var value = result.GetValue(label);
				if (value is RowResult)
				{
					var rowResult = value as RowResult;
					values = GetValues(suffix + label, rowResult, values);
				}
				else if (value is Dictionary<string, object>)
				{
					var dict = value as Dictionary<string, object>;
					values = AddDictionaryValues(suffix + label, dict, values);
				}
				else if (value is List<Object>)
				{
					values = AddListValues(value as List<Object>, suffix + label, values);
				}
				else
				{
					values.Add(new KeyValuePair<string, string>(suffix + label, (value != null) ? value.ToString() : string.Empty));
				}
			}
			return values;
		}

		private List<KeyValuePair<string, string>> AddDictionaryValues(string suffix, Dictionary<string, object> dict, List<KeyValuePair<string, string>> values)
		{
			if (!string.IsNullOrEmpty(suffix))
			{
				suffix = suffix + "/";
			}
			foreach (var key in dict.Keys)
			{
				var value = dict[key];
				if (value is Dictionary<string, object>)
				{
					var dict2 = value as Dictionary<string, object>;
					values = AddDictionaryValues(suffix + key, dict2, values);
				}
				else if (value is List<Object>)
				{
					var list = value as List<Object>;
					values = AddListValues(list, suffix + key, values);
				}
				else
				{
					values.Add(new KeyValuePair<string, string>(suffix + key, dict[key].ToString()));
				}
			}
			return values;
		}

		private List<KeyValuePair<string, string>> AddListValues(List<Object> list, string label, List<KeyValuePair<string, string>> values)
		{
			var sb = new StringBuilder();
			foreach (var obj in list)
			{
				if (obj != null)
				{
					sb.Append(obj);
				}
				sb.Append("~");
			}
			values.Add(new KeyValuePair<string, string>(label, sb.ToString()));

			return values;
		}

		private void DisplayDetail(MultiRowResult result, string orderNo, int generation)
		{
			while (result.HasNext())
			{
				ProcessDetail(result.GetRowResult(), orderNo, generation.ToString());
			}
		}

		private void WriteSerialized(object o, PropertyInfo[] props, StreamWriter sw)
		{
			var sb = new StringBuilder();
			var first = true;

			foreach(var prop in props)
			{
				if (!first)
				{
					sb.Append(",");
				}
				else
				{
					first = false;
				}

				var val = prop.GetValue(o);

				if (prop.PropertyType == typeof(string) && val != null)
				{
					var quote = string.Empty;
					var val2 = (string) val;
					if (val2.Contains(","))
					{
						quote = "\"";
					}

					val = quote + val2.Trim('~').Replace("\"", string.Empty) + quote;
				}

				sb.Append(val);
			}

			sw.WriteLine(sb.ToString());
		}

		private void WriteHeader(PropertyInfo[] props, StreamWriter sw)
		{
			var first = true;
			foreach(var prop in props)
			{
				if (!first)
				{
					sw.Write(",");
				}
				else 
				{
					first = false;
				}

				sw.Write(prop.Name);
			}

			sw.WriteLine("");
		}

	}
}

