using System;
using System.Collections.Generic;
using System.Linq;
using Morsco.PonderosaService.Common;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.DataRepositories;
using Morsco.PonderosaService.Entities;

namespace Morsco.PonderosaService.Mappers
{
    public static class PonderosaOrderToBuildOrderRequestMapper
    {
        public static BuildOrderRequest Map(OrderHeader order)
        {
            var orderHeader = BuildOrderHeader(order);
            var orderDetail = BuildOrderDetail(order);
            return new BuildOrderRequest
            {
                OrderHeader = orderHeader,
                OrderDetail = orderDetail
            };
        }

        public static IDictionary<string, object> BuildOrderHeader(OrderHeader order)
        {
            var result = new Dictionary<string, object>();

            //Mandatory
            result[OrderHeaderConstants.ShipTo_ID] = order.ShipToId;
            result[OrderHeaderConstants.Price_Branch] = order.PriceBranch;
            result[OrderHeaderConstants.Ship_Branch] = order.ShipBranch;
            result[OrderHeaderConstants.Order_Status] = order.OrderStatus;  // defaults to B, other options are C,H,M,L,A,W,S,P

            result[OrderHeaderConstants.Order_No] = order.OrderNo;

            //Newly-created (in insite) orders don't have generations.  need for update, though
            DataUtilities.SetEntryIfNotNull(result,OrderHeaderConstants.Generation, order.Generation);
           
            // Define optional dates
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Require_Date, order.RequireDate);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Ship_Date, order.ShipDate);

            // Define optional header fields.
            DataUtilities.SetEntryIfNotNullOrWhiteSpace(result, OrderHeaderConstants.Quote_Status, order.QuoteStatus);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Customer_PO, order.CustomerPo);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Release_No, order.ReleaseNo);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Writer, order.Writer);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Order_By, order.OrderBy);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Ship_Via, order.ShipVia);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Freight, order.Freight);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Handling, order.Handling);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Tax_Exempt_No, order.TaxExemptNo);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Tax_Jurisdiction, order.TaxJurisdiction);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Keywords, order.Keywords);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Web_Order_No, order.WebOrderNo);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Shipping_Instr, order.ShippingInstr);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Internal_Notes, order.InternalNotes);

            // Typically these are left undefined and the default values for the customer are used.

            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Phone_No, order.AltPhoneNo);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Sales_Source, order.AltSalesSource);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Salesperson, order.AltSalesperson);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Salesperson_In, order.AltSalespersonIn);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Terms, order.AltTerms);

            // Shipping Address (Only needed if the normal ship-to customer address needs to be overridden)
            if (order.AltShippingAddress != null || order.AltShippingCity != null || order.AltShippingName != null ||
                order.AltShippingState != null || order.AltShippingZip != null)
            {
                var altShip = new Dictionary<string, object>();
                DataUtilities.SetEntryIfNotNull(altShip, OrderHeaderConstants.Name, order.AltShippingName);
                DataUtilities.SetEntryIfNotNullOrEmpty(altShip, OrderHeaderConstants.Address, order.AltShippingAddress);
                DataUtilities.SetEntryIfNotNull(altShip, OrderHeaderConstants.City, order.AltShippingCity);
                DataUtilities.SetEntryIfNotNull(altShip, OrderHeaderConstants.State, order.AltShippingState);
                DataUtilities.SetEntryIfNotNull(altShip, OrderHeaderConstants.Zip, order.AltShippingZip);
                result[OrderHeaderConstants.Shipping_Address] = altShip;
            }

            if (!string.IsNullOrWhiteSpace(order.ElementAccountId))
            {
                var ccBlock = new Dictionary<string, object>();

                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Card_Type, order.CardType);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Card_Number, order.CardNumber);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Expire_Date, order.ExpireDate);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Card_Holder, order.CardHolder);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Street_Address, order.StreetAddress);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Postal_Code, order.PostalCode);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Element_Account_Id, order.ElementAccountId);
                DataUtilities.SetEntryIfNotNullOrWhiteSpace(ccBlock, OrderHeaderConstants.Auth_Type, order.AuthType);

                result[OrderHeaderConstants.Credit_Card] = ccBlock;
            }

            //Used for testing Quotes
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Tax, order.Tax);
            DataUtilities.SetEntryIfNotNull(result, OrderHeaderConstants.Bid_Expire_Date, order.BidExpireDate);

            return result;
        }

        private static IList<IDictionary<string, object>> BuildOrderDetail(OrderHeader order)
        {
            //Set prices for noncatalog items to $0 in bids as a means of alerting salesperson to set price.
            var catalogProducts = new List<string>();
            var isBid = (order.OrderStatus.Equals(OrderHeaderConstants.Bid, StringComparison.CurrentCultureIgnoreCase));
            if (isBid)
            {
                var dataRepository = new DataRepository();
                var productList = order.OrderDetail.Where(x => x is OrderItem).Select(x => ((OrderItem)x).ProductId).ToList();

                catalogProducts = dataRepository.GetCatalogProductsForOrder(order);
            }

            var result = new List<IDictionary<string, Object>>();
            foreach (var detail in order.OrderDetail)
            {
                var line = new Dictionary<string, object>();
                line[OrderDetailConstants.Item_Code] = detail.ItemCode;
                DataUtilities.SetEntryIfNotNullOrEmpty(line, OrderDetailConstants.Description, detail.Description);
                line[OrderDetailConstants.Line_Item_ID] = detail.LineItemId;

                if (detail is OrderItem)
                {
                    var orderItem = detail as OrderItem;

                    //required
                    line[OrderDetailConstants.Product_ID] = orderItem.ProductId;
                    line[OrderDetailConstants.Order_Qty] = orderItem.OrderQty;

                    //Optional
                    DataUtilities.SetEntryIfNotNull(line, OrderDetailConstants.Sell_Unit, orderItem.SellUnit);

                    // Set pricing
                    //When purchasing a quote, the prices in Eclipse are right, so don't change prices.
                    //When it is a catalog product, leave the prices alone, so they'll be set by Eclipse
                    //Normal orders don't have non-catalog products
                    //Therefore if the order is a bid/quote of some sort, set the noncatalog unit prices to 0 to alert salesperson to set price.
                    if (isBid && !catalogProducts.Contains(orderItem.ProductId.ToString()))
                    {
                        line[OrderDetailConstants.Unit_Price] = 0m;
                    }

                    DataUtilities.SetEntryIfNotNull(line, OrderDetailConstants.Desc_Override, orderItem.DescOverride);
                    DataUtilities.SetEntryIfNotNull(line, OrderDetailConstants.PDW_ID, orderItem.PdwId);
                    DataUtilities.SetEntryIfNotNull(line, OrderDetailConstants.Item_Release_No, orderItem.ItemReleaseNo);
                }
                else if (detail is CommentLine)
                {
                    //No additional vars need to be set here
                }
                else if (detail is MiscCharge)
                {
                    var miscCharge = detail as MiscCharge;
                    DataUtilities.SetEntryIfNotNull(line, OrderDetailConstants.Order_Qty, miscCharge.OrderQty);
                    DataUtilities.SetEntryIfNotNull(line, OrderDetailConstants.Unit_Price, miscCharge.UnitPrice);
                }
                else
                {
                    throw new ArgumentException("OrderBuilder does not handle OrderDetail type of " + detail.GetType());
                }

                result.Add(line);
            }
            return result;
        }


    }
}
