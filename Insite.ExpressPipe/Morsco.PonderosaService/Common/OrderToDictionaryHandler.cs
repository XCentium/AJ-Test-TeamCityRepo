using System;
using System.Collections.Generic;
using System.Linq;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Common
{
    public class OrderToDictionaryHandler : ResultHandler
    {
        public List<Dictionary<string,object>>Result = new List<Dictionary<string, object>>();

        /// <summary>
        /// Store the next table row which is wrapped in the supplied Result object.
        /// </summary>
        public override void StoreResult(Result genericResult)
        {
            // Look for specific row type
            // and ignore anything else.
            if (genericResult is HeaderDetailResult)
            {
                var result = (HeaderDetailResult) genericResult;
				DisplayOrder(result, true);
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
                int generation = result.GetInt(Constants.OrderHeaderConstants.Generation);
				var hdr = GetHeader(header);
                hdr["OrderDetails"] = GetDetail(result);

                hdr = hdr.OrderBy(x => x.Key).ToDictionary(x => x.Key, x => x.Value);

                Result.Add(hdr);
            }
            else
            {
                // Multiple generations
                string orderNo = result.GetHeaderString(Constants.OrderHeaderConstants.Order_No);
                int generationCount = header.GetElementCount(Constants.OrderHeaderConstants.Generation);
                for (int index = 0; index < generationCount; index++)
                {
                    HeaderDetailResult generation = result.GetHeaderDetailSlice("Generation", index);
                    int generationNo = generation.GetHeaderInt("Generation");
					var hdr = GetHeader(generation.GetHeaderResult());
                    var details = new List<Dictionary<string, object>>();
                    result.Reset();
                    while (generation.HasNext())
                    {
                        var item = GetLineItem(generation.GetRowResult());
                        details.Add(item);
                    }
                    hdr["OrderDetails"] = details;
                    hdr = hdr.OrderBy(x => x.Key).ToDictionary(x => x.Key, x => x.Value);
                    Result.Add(hdr);
                }
            }
        }

        private Dictionary<string, object> GetHeader(RowResult row)
        {
            var result = GetValues(string.Empty, row, new Dictionary<string, object>());
            return result;
        }

        private List<Dictionary<string, object>> GetDetail(MultiRowResult result)
        {
            var dict = new List<Dictionary<string, object>>();
            while (result.HasNext())
            {
                GetLineItem(result.GetRowResult());
            }
            return dict;
        }

        private Dictionary<string, object> GetLineItem(RowResult result)
        {
            return GetValues(string.Empty, result, new Dictionary<string, object>());
        }

        private Dictionary<string, object> GetValues(string suffix, RowResult row, Dictionary<string, object> values)
        {
            if (!string.IsNullOrEmpty(suffix))
            {
                suffix = suffix + "/";
            }

            foreach (var label in row.FieldNames())
            {

                var value = row.GetValue(label);
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
                    values.Add(suffix + label, (value != null)? value.ToString() : string.Empty);
                }
            }
            return values;
        }

        private Dictionary<string, object> AddDictionaryValues(string suffix, Dictionary<string, object> dict, Dictionary<string, object> values)
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
                    values.Add(suffix + key, dict[key].ToString());
                }
            }
            return values;
        }

        private Dictionary<string, object> AddListValues(IEnumerable<Object> list, string label, Dictionary<string, object> values)
        {
            values.Add(label, string.Join("~", list));
            return values;
        }
    }
}

