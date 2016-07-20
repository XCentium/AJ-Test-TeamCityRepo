using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Common
{
    public class TestResultHandler : ResultHandler
    {
        private readonly StreamWriter _headerStream = File.CreateText(@"C:\junk\EclipseHeaders.txt");
        private readonly StreamWriter _detailStream = File.CreateText(@"C:\junk\EclipseDetails.txt");
        
        /// <summary>
        /// Store the next table row which is wrapped in the supplied Result object.
        /// </summary>
        public override void StoreResult(Result genericResult)
        {
            // Look for specific result type
            // and ignore anything else.
            if (genericResult is HeaderDetailResult)
            {
                var result = (HeaderDetailResult) genericResult;
                //?? May or may not be multi-generation
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
                int generation = result.GetInt("Generation");
                _headerStream.WriteLine("Order: " + orderNo + ", Generations: Single");
				DisplayHeader(header);
                DisplayDetail(result, orderNo, generation);
            }
            else
            {
                // Multiple generations
                string orderNo = result.GetHeaderString(Constants.OrderHeaderConstants.Order_No);
                int generationCount = header.GetElementCount("Generation");
                _headerStream.WriteLine("Order: " + orderNo + ", Generations: " + generationCount);

				for (int index = 0; index < generationCount; index++)
                {
                    HeaderDetailResult generation = result.GetHeaderDetailSlice("Generation", index);
                    int generationNo = generation.GetHeaderInt("Generation");
					DisplayHeader(generation.GetHeaderResult());
                    result.Reset();
                    while (generation.HasNext())
                    {
                        DisplayLineItem(generation.GetRowResult(), orderNo, generationNo);
                    }
                }
            }
        }


        private void DisplayHeader(RowResult result)

        {
            _headerStream.WriteLine(string.Join("|", GetValues(string.Empty, result, new List<string>())));
        }

        private void DisplayLineItem(RowResult result, string orderNo, int generation)
        {
            _detailStream.WriteLine(string.Format("{0}|{1}|", orderNo, generation) +
                                    string.Join("|", GetValues(string.Empty, result, new List<string>())));
        }
        
        private List<string> GetValues(string suffix, RowResult result, List<string> values )
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
                    values.Add((value != null)? suffix + label + "`" + value : label + "`");
                }
            }
            return values;
        }

        private List<string> AddDictionaryValues(string suffix, Dictionary<string, object> dict, List<string> values)
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
                    values.Add(suffix + key + "`" + dict[key]);
                }
            }
            return values;
        }

        private List<string> AddListValues(List<Object> list, string label,  List<string> values)
        {
            var sb = new StringBuilder();
            sb.Append(label + '`');
            foreach (var obj in list)
            {
                if (obj != null)
                {
                    sb.Append(obj);
                }
                sb.Append("~");
            }
            values.Add(sb.ToString());
            return values;
        }

        private void DisplayDetail(MultiRowResult result, string orderNo, int generation)
        {
            while (result.HasNext())
            {
                DisplayLineItem(result.GetRowResult(), orderNo, generation);
            }
        }
    }
}

