using System;
using System.Collections.Generic;
using System.Linq;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Mappers
{
    public static class HeaderDetailResultToPonderosaOrderMapper
    {
        /// <summary>
        /// Maps HeaderDetailResult to OrderHeader, assuming there is only 1 generation.  Throws exception if multi-gen
        /// </summary>
        /// <param name="orderResult"></param>
        /// <returns></returns>
        public static OrderHeader MapSingleGeneration(HeaderDetailResult orderResult)
        {
            orderResult = GuaranteeSingleGeneration(orderResult);
            var order = CreateOrderHeader(orderResult);
            order.OrderDetail = CreateDetail(orderResult);
            return order;
        }

        /// <summary>
        /// Make sure there is 1 generation of order and it is not indexed.
        /// </summary>
        /// <param name="orderResult"></param>
        /// <returns></returns>
        private static HeaderDetailResult GuaranteeSingleGeneration(HeaderDetailResult orderResult)
        {
            var rowResult = orderResult.GetHeaderResult();
            if (rowResult.IsIndexed(OrderHeaderConstants.Generation))
            {
                var generations = rowResult.GetElementCount(OrderHeaderConstants.Generation);
                if (generations == 1)
                {
                    orderResult = orderResult.GetHeaderDetailSlice(OrderHeaderConstants.Generation, 0);
                }
                else
                {
                    throw new Exception(string.Format("Single-generation Ponderosa order expected.  Generation for order {0} has {1} generations",
                        orderResult.GetHeaderString(OrderHeaderConstants.Order_No),
                        generations));
                }
            }
            return orderResult;
        }

        private static OrderHeader CreateOrderHeader(HeaderDetailResult orderResult)
        {
            var order = new OrderHeader(orderResult);

            var temp = orderResult.GetHeaderValue("Shipping_Address");
            if (temp != null)
            {
                IDictionary<string, object> addr;
                //Depending on ponderosa method called, temp can either be a list containing a dictionary, or a dictionary.
                if (temp is List<object>
                    && (temp as List<object>).Count == 1
                    && (temp as List<object>)[0] is IDictionary<string, object>)
                {
                    addr = ((temp as List<object>)[0] as IDictionary<string, object>);
                }
                else if (temp is IDictionary<string, object>)
                {
                    addr = temp as IDictionary<string, object>;
                }
                else
                {
                    throw new Exception(string.Format("Unexpected data type ({0}) returned, in order Shipping_Address", temp.GetType().Name));
                }

                order.AltShippingName = (addr.ContainsKey("Name")) ? (string)addr["Name"] : null;

                // Address is being returned as a list of objects
                var temp2 = (addr.ContainsKey("Address")) ? addr["Address"] : null;
                if (temp2 != null)
                {
                    var addrList = temp2 as List<object>;
                    if (temp2 is List<object> || temp2 is List<string>)
                    {
                        order.AltShippingAddress = ((List<Object>)temp2).Select(x => x.ToString()).ToList();
                    }
                    else if (temp2 is string)
                    {
                        order.AltShippingAddress = new List<string> { (string)temp2 };
                    }
                    else
                    {
                        throw new Exception(
                            string.Format(
                                "Unexpected data type ({0}) returned, rather than List<Object>, List<String> or String in order Shipping_Address/Address Field",
                                temp2.GetType().Name));
                    }
                }

                order.AltShippingCity = (addr.ContainsKey("City")) ? (string)addr["City"] : null;
                order.AltShippingState = (addr.ContainsKey("State")) ? (string)addr["State"] : null;
                order.AltShippingZip = (addr.ContainsKey("Zip")) ? (string)addr["Zip"] : null;
                order.AltShippingPhoneNumber = (addr.ContainsKey("Phone")) ? (string)addr["Phone"] : null;
            }
            return order;
        }

        private static IList<OrderDetailBase> CreateDetail(MultiRowResult order)
        {
            var result = new List<OrderDetailBase>();

            while (order != null && order.HasNext())
            {
                var items = order.GetRowResult();
                var itemCode = items.GetString("Item_Code");

                if (itemCode.Equals(ItemCode.Product) || itemCode.Equals(ItemCode.StdLineItem))
                {
                    var item = new OrderItem(items);

                    result.Add(item);

                }
                else if (itemCode.Equals(ItemCode.MiscCharge))
                {
                    var item = new MiscCharge(items);

                    result.Add(item);
                }
                //Demo code showed this as the only other example
                else if (itemCode.Equals(ItemCode.Comment))
                {
                    var item = new CommentLine(items);

                    result.Add(item);
                }
                else
                {
                    throw new Exception(string.Format("Unexpected Item Code (\"{0}\") received", itemCode));
                }
            }
            return result;
        }
    }
}
