using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using Morsco.IntegrationProcessor.Repositories;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;

namespace Morsco.IntegrationProcessor.Helper
{
    public class UtilityHelper
    {
        private readonly DataRepository _dataRepository = new DataRepository();

        /// <summary>
        /// Converts the Insite Order Submit dataset to a Ponderosa Order header/Details
        /// Works for Order, Order being turned into QUote and Quote Submission cases
        /// </summary>
        /// <param name="dsOrder"></param>
        /// <param name="eclipseOrderHeader"></param>
        /// <returns></returns>
        public OrderHeader GetOrderHeader(DataSet dsOrder, OrderHeader eclipseOrderHeader)
        {
            var drCustomerOrder = GetFirstTableRow(dsOrder, Constants.CustomerOrder);
            var drCustomer = GetFirstTableRow(dsOrder, Constants.Customer);
            var drOrderLine = GetFirstTableRow(dsOrder, Constants.OrderLine);
            var drShipVia = (dsOrder.Tables.Contains(Constants.ShipVia)) ? GetFirstTableRow(dsOrder, Constants.ShipVia) : null;
            var dtCustomerOrderProperties = (dsOrder.Tables.Contains(Constants.CustomerOrderProperty))
                ? dsOrder.Tables[Constants.CustomerOrderProperty]
                : null;
            var status = drCustomerOrder[Constants.Status].ToString();
            var orderProperties = GetProperties(dsOrder, Constants.CustomerOrderProperty);

            var nonCatalogProductCount = GetDictionaryInt(orderProperties, Constants.NonCatalogProductCount, 0);

            var syncActivity = SyncActivity.Unknown;

            // we are here for one of several reasons:
            if (eclipseOrderHeader == null)
            {
                eclipseOrderHeader = new OrderHeader();

                if (nonCatalogProductCount == 0 && status == Constants.Submitted)  // 1. Submitting a normal order
                {
                    syncActivity = SyncActivity.NormalOrder;
                }
                else if (status == Constants.QuoteRequested)  // 2. User explicitly submitting an Rfq explicitly
                {
                    syncActivity = SyncActivity.Rfq;
                }
                else if (nonCatalogProductCount > 0)
                {
                    syncActivity = SyncActivity.ForceOrderToQuote;  //3. Forcing order to be quote because non-catalog products.
                }

            }
            else if (status == Constants.Submitted)  // 4. Converting a purchased quote to an order
            {
                syncActivity = SyncActivity.QuoteToOrder;
            }

            if (syncActivity == SyncActivity.Unknown)
            {
                throw new Exception(
                    $"Integration Processor : OrderSubmit : Order# ({eclipseOrderHeader.OrderNo}) with status ({drCustomerOrder[Constants.Status]}) cannot be processed.");
            }

            //Unfinished Order should not be processed..
            if (GetStringValue(drCustomerOrder[Constants.CustomerNumber], eclipseOrderHeader?.ShipToId.ToString()) == Constants.ABANDONEDCART)
            {
                throw new Exception(
                    $"Integration Processor : OrderSubmit : Abandoned Cart Order# ({eclipseOrderHeader.OrderNo}) cannot be processed.");
            }

            var customerSequence = GetStringValue(drCustomerOrder[Constants.CustomerSequence], string.Empty);

            //CustomerSequence -> ship-to-id
            //If there is an integer ship-to-id use that
            int temp;
			if (!string.IsNullOrWhiteSpace(customerSequence) && int.TryParse(customerSequence, out temp))
            {
                eclipseOrderHeader.ShipToId = temp;
            }
            //If there is a non-integer ship-to-id, this is a newly-entered "ISC" ship-to.  Use the original customersequence for ship-to-id
            else if (!string.IsNullOrWhiteSpace(customerSequence) && dtCustomerOrderProperties != null)
            {
                var orderPropertyRow = dtCustomerOrderProperties.AsEnumerable()
                    .FirstOrDefault(x => x[Constants.Name].ToString().Equals(Constants.CustomerSequence, StringComparison.CurrentCultureIgnoreCase));
                var customerSequenceString = orderPropertyRow?[Constants.Value]?.ToString();

				int shipToId;
                if (!string.IsNullOrWhiteSpace(customerSequenceString) && int.TryParse(customerSequenceString, out shipToId))
                {
                    eclipseOrderHeader.ShipToId = shipToId;
                }
            }
            // Otherwise, use Bill-to-id
            if (!eclipseOrderHeader.ShipToId.HasValue || eclipseOrderHeader.ShipToId.Value == 0)
            {
                eclipseOrderHeader.ShipToId = int.Parse(GetStringValue(drCustomerOrder[Constants.CustomerNumber], eclipseOrderHeader.ShipToId.ToString()));
            }


            if (syncActivity != SyncActivity.QuoteToOrder)
            {
                eclipseOrderHeader.OrderNo = drCustomerOrder[Constants.OrderNumber].ToString();
                eclipseOrderHeader.PriceBranch = GetStringValue(drOrderLine[Constants.ShipSite], eclipseOrderHeader.PriceBranch);
            }
            eclipseOrderHeader.ShipBranch = GetStringValue(drOrderLine[Constants.ShipSite], eclipseOrderHeader.ShipBranch);

            #region Set Orderstatus and RequestedShipDate based on the business rules

            //Setting Orderstatus and RequestedShipDate based on the business rules
            var requestedShipDate = GetDictionaryDate(orderProperties, Constants.ShipmentRequestedDate, DateTime.MinValue);

            var shipWhen = GetDictionaryString(orderProperties, Constants.ShipmentPreference, ShipmentWhen.OrderComplete);

            if (syncActivity == SyncActivity.Rfq)
            {
                eclipseOrderHeader.OrderStatus = EclipseOrderStatus.Bid;
                eclipseOrderHeader.QuoteStatus = EclipseQuoteStatus.QuoteRequested;
            }
            else if (syncActivity == SyncActivity.ForceOrderToQuote)
            {
                eclipseOrderHeader.OrderStatus = EclipseOrderStatus.Bid;
            }
            else if (shipWhen == ShipmentWhen.ProductAvailable)
            {
                eclipseOrderHeader.OrderStatus = EclipseOrderStatus.ShipWhenAvailable;
            }
            else if (shipWhen == ShipmentWhen.OrderComplete)
            {
                eclipseOrderHeader.OrderStatus = EclipseOrderStatus.ShipWhenComplete;
            }

            //Shipping instructions
            var isDelivery = orderProperties.ContainsKey(Constants.SelectedDeliveryTime);
            var selectedTime = isDelivery
                ? GetDictionaryString(orderProperties, Constants.SelectedDeliveryTime, string.Empty)
                : GetDictionaryString(orderProperties, Constants.SelectedPickupTime, string.Empty);
			var requireDate = Convert.ToDateTime(requestedShipDate).ToString("MM/dd/yyyy");
			eclipseOrderHeader.RequireDate = requestedShipDate;
			var shippingInst = isDelivery? $"Requested Delivery: {requireDate}, {selectedTime}"
				: orderProperties.ContainsKey(Constants.SelectedPickupTime) ? $"Requested Pickup: {requireDate}, {selectedTime}"
				: string.Empty;
            if (shippingInst.Length > 0 && !shippingInst.Trim().EndsWith("."))
            {
                shippingInst = shippingInst + ". ";
            }

            eclipseOrderHeader.ShippingInstr = shippingInst
                                               + (
                                                   GetDictionaryString(orderProperties, Constants.SpecialHandlingInstructions, eclipseOrderHeader.ShippingInstr)
                                                   ?? string.Empty
                                                   );

            #endregion

            eclipseOrderHeader.ShipDate = (requestedShipDate != DateTime.MinValue) ? requestedShipDate : (DateTime?)null;

            eclipseOrderHeader.CustomerPo = GetStringValue(drCustomerOrder[Constants.CustomerPO], eclipseOrderHeader.CustomerPo);

            #region ShipVia Business Rules Handling

            var isWillCall = false;

            //Quotes don't have ShipVia table
            if (drShipVia != null)
            {
                eclipseOrderHeader.ShipBranch = GetStringValue(drShipVia[columnName: Constants.ErpShipCode], string.Empty);

                var carrierId = GetStringValue(drShipVia[columnName: Constants.CarrierId], string.Empty);
                var repository = new DataRepository();
                var carrierName = repository.GetCarrierName(carrierId);
                if (carrierName.Equals(Constants.WillCall, StringComparison.CurrentCultureIgnoreCase))
                {
                    isWillCall = true;
                    eclipseOrderHeader.ShipVia = Constants.WcWillCall;
                }
                else
                {
                    eclipseOrderHeader.ShipVia = Constants.BwBestWay;
                }
            }

            #endregion

            eclipseOrderHeader.AltSalesSource = Constants.SalesSource;
            eclipseOrderHeader.Writer = Constants.Writer;

            if (syncActivity != SyncActivity.QuoteToOrder)
            {
                eclipseOrderHeader.OrderBy = GetStringValue(drCustomerOrder[Constants.PlacedByUserName], eclipseOrderHeader.OrderBy);
                eclipseOrderHeader.WebOrderNo = GetStringValue(drCustomerOrder[Constants.OrderNumber], eclipseOrderHeader.WebOrderNo);
                eclipseOrderHeader.AltPhoneNo = GetStringValue(drCustomerOrder[Constants.BTPhone], eclipseOrderHeader.AltPhoneNo);
                eclipseOrderHeader.Freight = GetDecimalValue(drCustomerOrder[Constants.Shipping], eclipseOrderHeader.Freight);
            }

            #region Terms code handling

            var termsCode = GetDictionaryString(orderProperties, Constants.PaymentMethodName, string.Empty);

            if (termsCode.Equals(PaymentMethod.PayByCreditCard, StringComparison.CurrentCultureIgnoreCase))
            {
                eclipseOrderHeader.AltTerms = EclipseTerms.COD;
            }
            else if (termsCode.Equals(PaymentMethod.BillToMyAccount, StringComparison.CurrentCultureIgnoreCase))
            {
                eclipseOrderHeader.AltTerms = drCustomer[Constants.TermsCode].ToString();
            }
            else if (termsCode.Equals(PaymentMethod.PayWhenIPickUp, StringComparison.CurrentCultureIgnoreCase))
            {
                eclipseOrderHeader.AltTerms = EclipseTerms.COD;
            }

            #endregion

            eclipseOrderHeader.AltShippingPhoneNumber = GetStringValue(drCustomerOrder[Constants.STPhone], eclipseOrderHeader.AltShippingPhoneNumber);

            if (!isWillCall)
            {
                var shippingName = GetStringValue(drCustomerOrder[Constants.STCompanyName], string.Empty);
                if (string.IsNullOrWhiteSpace(shippingName))
                {
                    if (drCustomerOrder[Constants.STFirstName].ToString() != string.Empty)
                    {
                        shippingName = Regex.Replace(
                            GetStringValue(drCustomerOrder[Constants.STFirstName], string.Empty) + " "
                            + GetStringValue(drCustomerOrder[Constants.STMiddleName], string.Empty) + " "
                            + GetStringValue(drCustomerOrder[Constants.STLastName], string.Empty),
                            @"\s+", " ");
                    }
                }
                eclipseOrderHeader.AltShippingName = shippingName;

                var shippingAddressList = new List<string>
                    {
                        GetStringValue(drCustomerOrder[Constants.STAddress1], string.Empty),
                        GetStringValue(drCustomerOrder[Constants.STAddress2], string.Empty),
                        GetStringValue(drCustomerOrder[Constants.STAddress3], string.Empty)
                    };

                eclipseOrderHeader.AltShippingAddress = shippingAddressList;
                eclipseOrderHeader.AltShippingCity = GetStringValue(drCustomerOrder[Constants.STCity], string.Empty);
                eclipseOrderHeader.AltShippingState = GetStringValue(drCustomerOrder[Constants.STState], string.Empty);
                eclipseOrderHeader.AltShippingZip = GetStringValue(drCustomerOrder[Constants.STPostalCode], string.Empty);
            }

            var dtCustomerOrderProperty = (dsOrder.Tables.Contains(Constants.CustomerOrderProperty)) ? dsOrder.Tables[Constants.CustomerOrderProperty] : null;
			var creditCardJson = dtCustomerOrderProperty.AsEnumerable()
				.FirstOrDefault(x => x["Name"].ToString().EqualsIgnoreCase("CreditCard"));

            if (creditCardJson == null ||
                !termsCode.Equals(PaymentMethod.PayByCreditCard, StringComparison.CurrentCultureIgnoreCase))
                return eclipseOrderHeader;
            var creditCardObject = new JavaScriptSerializer();
            var json = creditCardJson["Value"].ToString();
            var ccBlock = creditCardObject.Deserialize<Dictionary<string, string>>(json);

            eclipseOrderHeader.CardHolder = ccBlock[OrderHeaderConstants.TsCardHolder];
            eclipseOrderHeader.CardNumber = ccBlock[OrderHeaderConstants.TsCardNumber];
            eclipseOrderHeader.CardType = ccBlock[OrderHeaderConstants.TsCardType];
            eclipseOrderHeader.ExpireDate = ccBlock[OrderHeaderConstants.TsExpireDate];
            eclipseOrderHeader.ElementAccountId = ccBlock[OrderHeaderConstants.TsElementAccountId];
            eclipseOrderHeader.StreetAddress = ccBlock[OrderHeaderConstants.TsStreetAddress];
            eclipseOrderHeader.PostalCode = ccBlock[OrderHeaderConstants.TsPostalCode];
            var dataRepository = new DataRepository();
            eclipseOrderHeader.AuthType = dataRepository.GetApplicationSetting(OrderHeaderConstants.MSCCreditCardAuthorizationType);

            return eclipseOrderHeader;
        }
        
        public List<OrderDetailBase> GetOrderDetail(DataSet webOrderData)
        {
            var result = new List<OrderDetailBase>();
            var orderLines = webOrderData.Tables["OrderLine"].Rows;
            var orderLineProperties = webOrderData.Tables["OrderLineProperty"];

            if (orderLines.Count > 0)
            {
                foreach (DataRow orderLine in orderLines)
                {
                    var productId = orderLine[Constants.ProductId] as Guid?;
                    if (productId == null)
                    {
                        throw new Exception($"Order Line does not  have a product id");
                    }
                    var orderItem = new OrderItem
                    {
                        ItemCode = "P",
                        ProductId = _dataRepository.GetErpNumber(productId.Value),
                        OrderQty = GetIntValue(orderLine[Constants.QtyOrdered], 0),
                        DescOverride = false
                    };
                    orderItem.SellUnit = GetStringValue(orderLine[Constants.UnitOfMeasure], orderItem.SellUnit);

                    var sopDescriptionProperty = orderLineProperties.AsEnumerable()
                        .FirstOrDefault(olp => 
                            (Guid)olp[Constants.ParentId] == (Guid) orderLine[Constants.Id]
                            && olp[Constants.Name].ToString().EqualsIgnoreCase("SOPDescription"));
                    var sopDescription = sopDescriptionProperty?[Constants.Value]?.ToString();

                    var notes = GetStringValue(orderLine[Constants.Notes], string.Empty);

                    if (!string.IsNullOrWhiteSpace(notes) || !String.IsNullOrWhiteSpace(sopDescription))
                    {
                        orderItem.Description = new List<string>();
                        if (!string.IsNullOrWhiteSpace(sopDescription))
                        {
                            orderItem.Description.Add(sopDescription);
                        };
                        if (!string.IsNullOrWhiteSpace(notes))
                        {
                            orderItem.Description.Add(notes);
                        };
                    }
                    result.Add(orderItem);
                }
            }
            return result;
        }

	    public OrderHeader UpdateQuotedOrder(DataSet webOrderData, OrderHeader eclipseOrder)
	    {
		    var orderLines = webOrderData.Tables["OrderLine"].Rows;
		    eclipseOrder = GetOrderHeader(webOrderData, eclipseOrder);
		    var eclipseOrderLines = SyncQuoteOrderLines(eclipseOrder.OrderDetail, orderLines);

		    return eclipseOrder;
	    }

        private DataRow GetFirstTableRow(DataSet ds, string tableName)
        {
            if (ds == null || ds.Tables == null || ds.Tables.Count < 1)
            {
                throw new Exception("Dataset does not exist or has no tables");
            }

            if (!ds.Tables.Contains(tableName))
            {
                throw new Exception("Dataset did not contain table: " + tableName);
            }
            
            if (ds.Tables[tableName].Rows == null || ds.Tables[tableName].Rows.Count < 1)
            {
                throw new Exception("Table " + tableName + " had no rows");
            }
            
            return ds.Tables[tableName].Rows[0];
        }

        private string GetStringValue(object value, string defaultValue)
        {
            var result = defaultValue;
            if (value != null && value.ToString().Trim() != string.Empty)
            {
                result = value.ToString();
            }
            return result;
        }

        /// <summary>
        /// Odd case of conversion because we want integers of quantities that come out of Insite as decimals
        /// </summary>
        /// <param name="value"></param>
        /// <param name="defaultValue"></param>
        /// <returns></returns>
        private int? GetIntValue(object value, int? defaultValue)
        {
            var result = defaultValue;
            if (value != null && value.ToString().Trim() != string.Empty)
            {
                if (value is Int32? && ((Int32?) value).HasValue)
                {
                    result = (Int32?) value;
                }
                else if (value is Int16? && ((Int16?) value).HasValue)
                {
                    result = Convert.ToInt32(((Int16?) value).Value);
                }
                else if (value is Decimal? && ((Decimal?) value).HasValue)
                {
                    result = Convert.ToInt32(((Decimal?) value).Value);
                }
                else if (value is Int32 || value is Int16 || value is Decimal)
                {
                    result = Convert.ToInt32(value);
                }
            }
            return result;
        }

        private Decimal? GetDecimalValue(object value, Decimal? defaultValue)
        {
            var result = defaultValue;
            if (value != null)
            {
                if (value is Decimal? && ((Decimal?)value).HasValue)
                {
                    result = ((Decimal?)value).Value;
                }
                else if (value is Decimal)
                {
                    result = Convert.ToDecimal(value);
                }
            }
            return result;
        }

        private Dictionary<string, string> GetProperties(DataSet ds, string tableName)
        {
            var result = new Dictionary<string, string>();

            if (ds.Tables[tableName] != null && ds.Tables[tableName].Rows != null)
            {
                foreach (DataRow row in ds.Tables[tableName].Rows)
                {
                    result.Add(row["Name"].ToString(), row["Value"].ToString());
                }
            }
            return result;
        }

        private string GetDictionaryString(Dictionary<string, string> dict, string key, string defaultValue)
        {
            var result = defaultValue;
            if (dict.ContainsKey(key))
            {
                result = dict[key];
            }
            return result;
        }

        private int GetDictionaryInt(Dictionary<string, string> dict, string key, int defaultValue)
        {
            var result = defaultValue;
            if (dict.ContainsKey(key))
            {
                int intResult;
                if (int.TryParse(dict[key], out intResult))
                {
                    result = intResult;
                }
            }
            return result;
        }

        private DateTime GetDictionaryDate(Dictionary<string, string> dict, string key, DateTime defaultValue)
        {
            var result = defaultValue;
            if (dict.ContainsKey(key))
            {
                DateTime test2;
                if (DateTime.TryParse(dict[key], out test2))
                {
                    result = test2;
                }
            }
            return result;
        }

        enum SyncActivity
        {
            NormalOrder,
            Rfq,
            ForceOrderToQuote,
            QuoteToOrder,
            Unknown
        };
        
        private IList<OrderDetailBase> SyncQuoteOrderLines(IList<OrderDetailBase> orderDetail, DataRowCollection eclipseOrderLines)
        {
            var insiteValues = new Dictionary<string, int>();
            foreach (DataRow row in eclipseOrderLines)
            {

                var productId = row[Constants.ProductId] as Guid?;
                if (productId == null || productId == Guid.Empty)
                {
                    throw new Exception("ProductId column not found in orderline row");
                }
                var erpNumber = _dataRepository.GetErpNumber(productId.Value);
                var line = row[Constants.Line].ToString();
                var qty = Convert.ToInt32(row[Constants.QtyOrdered]);
                insiteValues.Add(erpNumber + "-" + line, qty);
            }


            for (var i = orderDetail.Count - 1; i >= 0; i--)
            {
                if (!(orderDetail[i] is OrderItem)) continue;
                var ol = (OrderItem) orderDetail[i];
                if (ol.ProductId == null || ol.LineItemId == null) continue;
                var lookupKey = ol.ProductId.Value + "-" + ol.LineItemId.Value;
                var match = insiteValues.ContainsKey(lookupKey);
                if (match)
                {
                    ol.OrderQty = insiteValues[lookupKey];
                } else
                {
                    // Remove lines that the user may have deleted.
                    orderDetail.RemoveAt(i);
                }
            }
            return orderDetail;
        }

        
    }


}
