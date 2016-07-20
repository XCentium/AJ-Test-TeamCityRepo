using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.DataRepositories;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Common
{
    public class OrderRefreshResultHandler : ResultHandler, IDisposable
    {
        private readonly StreamWriter _headerStream ;
        private readonly StreamWriter _detailStream ;
        private bool _columnHeaderCreated;
        private List<string> _orderHeaderColumnList;
        private List<string> _orderHeaderColumns;
        private List<string> _orderDetailColumnList;
        private List<string> _orderDetailColumns;

        public OrderRefreshResultHandler(string headerFile, string detailFile)
        {
            _headerStream = File.CreateText(headerFile);
            _detailStream = File.CreateText(detailFile); 
        }

        /// <summary>
        /// Store the next table row which is wrapped in the supplied Result object.
        /// </summary>
        public override void StoreResult(Result genericResult)
        {
            var detailResult = genericResult as HeaderDetailResult;
            if (detailResult != null)
            {
                var result = detailResult;
                CreateColumnHeaders();
                DisplayOrder(result);
            }
        }

        private void DisplayOrder(HeaderDetailResult result)
        {
            // Header
            var header = result.GetHeaderResult();
            if (!header.IsIndexed(OrderHeaderConstants.Generation))
            {
                // Single generation
                var orderNo = result.GetHeaderString(OrderHeaderConstants.Order_No);
                var generation = result.GetInt(OrderHeaderConstants.Generation);
                DisplayHeader(header);
                DisplayDetail(result, orderNo, generation);
            }
            else
            {
                // Multiple generations
                var orderNo = result.GetHeaderString(OrderHeaderConstants.Order_No);
                var generationCount = header.GetElementCount(OrderHeaderConstants.Generation);
                for (var index = 0; index < generationCount; index++)
                {
                    var generation = result.GetHeaderDetailSlice(OrderHeaderConstants.Generation, index);
                    var generationNo = generation.GetHeaderInt(OrderHeaderConstants.Generation);

                    DisplayHeader(generation.GetHeaderResult());

                    result.Reset();
                    while (generation.HasNext())
                    {
                        DisplayLineItem(generation.GetRowResult(), orderNo, generationNo);
                    }
                }
            }
        }

        private void CreateColumnHeaders()
        {
            if (!_columnHeaderCreated)
            {

                var dataRep = new DataRepository();
                
                _orderHeaderColumnList = dataRep.GetOrderHeaderColumnList();
                _orderDetailColumnList = dataRep.GetOrderDetailColumnList();
                GetEclipseColumnList();

                if (_orderHeaderColumnList != null && _orderDetailColumnList != null)
                {
                    _headerStream.WriteLine(string.Join("\t", _orderHeaderColumnList));

                    _detailStream.WriteLine(string.Join("\t", _orderDetailColumnList));
                    _columnHeaderCreated = true;
                }
            }

        }

        private void DisplayHeader(RowResult result)
        {
            _headerStream.WriteLine(string.Join("\t", GetValues(string.Empty, result, _orderHeaderColumns, new List<string>())));
            _headerStream.Flush();
        }

        private void DisplayDetail(MultiRowResult result, string orderNo, int generation)
        {
            while (result.HasNext())
            {
                DisplayLineItem(result.GetRowResult(), orderNo, generation);
            }
        }
        private void DisplayLineItem(RowResult result, string orderNo, int generation)
        {
            _detailStream.WriteLine(
                $"{orderNo}\t{generation}\t" + string.Join("\t", GetValues(string.Empty, result,_orderDetailColumns, new List<string>())));
            _detailStream.Flush();
        }

        private List<string> GetValues(string suffix, RowResult result, List<string> values)
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
                    values = AddDictionaryValues(suffix, dict, values);
                }
                else if (value is List<Object>)
                {
                    values = AddListValues(value as List<Object>, values);
                }
                else
                {
                    values.Add((value != null) ? suffix + value : "");
                }
            }
            return values;
        }


        private List<string> GetValues(string suffix, RowResult result, List<string> columnList, List<string> values)
        {
            if (!string.IsNullOrEmpty(suffix))
            {
                suffix = suffix + "/";
            }

            foreach (var label in columnList)
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
                    var dictColumns = _orderHeaderColumnList.Where(row => row.Contains(label + "/")).ToList()
                        .Select(col => col.Substring(col.IndexOf("/", StringComparison.Ordinal) + 1)).ToList(); 
                    values = AddDictionaryValues(suffix, dict,dictColumns, values);
                }
                else if (value is List<Object>)
                {
                    values = AddListValues(value as List<Object>, values);
                }
                else
                {
                    values.Add((value != null) ? suffix + value.ToString().Replace("\t", "") : "");
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
                    values = AddListValues(list, values);
                }
                else
                {
                    values.Add(dict[key].ToString());
                }
            }
            return values;
        }

        private List<string> AddDictionaryValues(string suffix, Dictionary<string, object> dict, List<string> columnList, List<string> values)
        {
            if (!string.IsNullOrEmpty(suffix))
            {
                suffix = suffix + "/";
            }
            foreach (var key in columnList)
            {
                var value = dict.ContainsKey(key)?dict[key]:string.Empty;

                if (value is Dictionary<string, object>)
                {
                    var dict2 = value as Dictionary<string, object>;
                    values = AddDictionaryValues(suffix + key, dict2, values);
                }
                else if (value is List<Object>)
                {
                    var list = value as List<Object>;
                    values = AddListValues(list, values);
                }
                else
                {
                    values.Add(value.ToString().Replace("\t", ""));
                }
            }
            return values;
        }

        private List<string> AddListValues(List<Object> list, List<string> values)
        {
            var sb = new StringBuilder();
            //sb.Append(label + '`');
            foreach (var obj in list)
            {
                if (obj != null)
                {
                    sb.Append(obj);
                }
                sb.Append(" ");
            }
            values.Add(sb.ToString().Replace("\t", ""));
            return values;
        }

        private void GetEclipseColumnList()
        {
            _orderHeaderColumns = new List<string>();
            _orderDetailColumns = new List<string>();
            foreach (var columnName in _orderHeaderColumnList)
            {
                if (!columnName.Contains("/"))
                {
                    _orderHeaderColumns.Add(columnName);
                }
                else // if it is dictionary object to be handled differently
                {
                    var label = columnName.Substring(0, columnName.IndexOf("/", StringComparison.Ordinal));
                    if (_orderHeaderColumns.IndexOf(label) < 0)
                    {
                        _orderHeaderColumns.Add(label);
                    }
                }
            }

            foreach (var columnName in _orderDetailColumnList)
            {
                
                if (!columnName.Contains("/"))
                {
                    //Order No and Generation columns already rendered..
                    if (columnName != "Order_No" && columnName != "Generation")
                    {
                        _orderDetailColumns.Add(columnName);
                    }
                }
                else // if it is dictionary object to be handled differently
                {
                    var label = columnName.Substring(1, columnName.IndexOf("/", StringComparison.Ordinal) - 1);
                    if (_orderDetailColumns.IndexOf(label) < 0)
                    {
                        _orderDetailColumns.Add(label);
                    }
                }
            }
        }
        
        public void Dispose()
        {
            if (_headerStream != null)
            {
                _headerStream.Flush();
                _headerStream.Close();
                _headerStream.Dispose();
            }
            if (_detailStream != null)
            {
                _detailStream.Flush();
                _detailStream.Close();
                _detailStream.Dispose();
            }
        }
    }
}

