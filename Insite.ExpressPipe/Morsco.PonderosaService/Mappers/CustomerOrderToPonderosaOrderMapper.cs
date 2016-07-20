using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Insite.Data.Entities;
using Morsco.PonderosaService.Common;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.DataRepositories;
using Morsco.PonderosaService.Entities;

namespace Morsco.PonderosaService.Mappers
{
    public static class CustomerOrderToPonderosaOrderMapper
    {
        public static class OrderConstants
        {
            public const string EclipseShipViaWillCall = "WILL CALL";
            public const string EclipseShipViaDeliver = "BEST WAY";
            public const string Deliver = "Deliver";
            public const string WillCall = "WillCall";
            public const string ErpShipCode = "ErpShipCode";
            public const string SalesSource = "WOE";
            public const string Writer = "WEB";
        }


        public static OrderHeader Map(CustomerOrder customerOrder, string alternateCustomerSequence)
        {
            var orderHeader = new OrderHeader();

            var customer = customerOrder.Customer;
            var shipVia = customerOrder.ShipVia;
            var orderLines = customerOrder.OrderLines;

            if (orderLines != null && orderLines.Count > 0)
            {
                orderHeader.PriceBranch = orderLines.ToList()[0].ShipSite;
            }

            if (!string.IsNullOrWhiteSpace(customerOrder.CustomerSequence)  
                && Utility.IsNumeric(customerOrder.CustomerSequence, System.Globalization.NumberStyles.Integer))
            {
                orderHeader.ShipToId = Convert.ToInt32(customerOrder.CustomerSequence);
            }
            else if (!string.IsNullOrWhiteSpace(alternateCustomerSequence))
            {
                if (!Utility.IsNumeric(alternateCustomerSequence, System.Globalization.NumberStyles.Integer))
                {
                    throw new ArgumentException($"Invalid alternate customer sequence ({alternateCustomerSequence}) provided");
                }
                orderHeader.ShipToId = Convert.ToInt32(alternateCustomerSequence);
            }
            else
            {
                if (Utility.IsNumeric(customer.CustomerNumber, System.Globalization.NumberStyles.Integer))
                {
                    orderHeader.ShipToId = Convert.ToInt32(customer.CustomerNumber);
                }
                else
                {
                    throw new Exception($"Customer Number {customer.CustomerNumber} must be numeric");
                }
            }

            #region ShipVia Business Rules Handling

            bool isWillCall = false;

            string carrierName = shipVia.Carrier.Name;

            if (carrierName.Replace(" ", string.Empty).Equals(OrderConstants.WillCall, StringComparison.CurrentCultureIgnoreCase))
            {
                isWillCall = true;
                orderHeader.ShipVia = OrderConstants.EclipseShipViaWillCall;
            }
            else if (carrierName.Replace(" ", string.Empty).Equals(OrderConstants.Deliver, StringComparison.CurrentCultureIgnoreCase))
            {
                orderHeader.ShipVia = OrderConstants.EclipseShipViaDeliver;
            }
            else
            {
                //Throwing exception as there was no carrier found to be processed
                throw new Exception("Carrier (" + carrierName + ") Not Setup");
            }

            if (isWillCall)
            {
                var dataRepositories = new DataRepository();

                string shipCode = shipVia.ErpShipCode;

                DataTable dtWarehouse = dataRepositories.GetWarehouseData(shipCode);
                if (dtWarehouse != null && dtWarehouse.Rows.Count > 0)
                {
                    DataRow drWarehouse = dtWarehouse.Rows[0];
                    orderHeader.AltShippingName = drWarehouse[OrderHeaderConstants.Name].ToString();

                    var shippingAddressList = new List<string>
                    {
                        drWarehouse[OrderHeaderConstants.Address1].ToString(),
                        drWarehouse[OrderHeaderConstants.Address2].ToString()
                    };

                    orderHeader.AltShippingAddress = shippingAddressList;
                    orderHeader.AltShippingCity = drWarehouse[OrderHeaderConstants.City].ToString();
                    orderHeader.AltShippingState = drWarehouse[OrderHeaderConstants.State].ToString();
                    orderHeader.AltShippingZip = drWarehouse[OrderHeaderConstants.PostalCode].ToString();
                }
                else
                {
                    throw new Exception("Tax Calculation : Warehouse details not found for the given shipsite: " + shipCode);
                }
            }
            else
            {
                var shippingName = string.Empty;
                if (customerOrder.STCompanyName != string.Empty)
                {
                    shippingName = customerOrder.STCompanyName;
                }
                else if (customerOrder.STFirstName != string.Empty)
                {
                    shippingName = customerOrder.STFirstName + " " + customerOrder.STMiddleName + " " + customerOrder.STLastName;
                }
                orderHeader.AltShippingName = shippingName;

                var shippingAddressList = new List<string>
                {
                    customerOrder.STAddress1, 
                    customerOrder.STAddress2, 
                    customerOrder.STAddress3
                };

                orderHeader.AltShippingAddress = shippingAddressList;
                orderHeader.AltShippingCity = customerOrder.STCity;
                orderHeader.AltShippingState = customerOrder.STState;
                orderHeader.AltShippingZip = customerOrder.STPostalCode;
                orderHeader.AltSalesSource = OrderConstants.SalesSource;
                orderHeader.Writer = OrderConstants.Writer;
            }

            #endregion

            var orderDetails = new List<OrderDetailBase>();

            if (orderLines != null)
            {
                orderDetails.AddRange(orderLines.Select(ol => new OrderItem
                {
                    ItemCode = ItemCode.Product, 
                    ProductId = Convert.ToInt32(ol.Product.ErpNumber), 
                    OrderQty = Convert.ToInt32(ol.QtyOrdered), 
                    SellUnit = ol.UnitOfMeasure
                }));
            }
            orderHeader.OrderDetail = orderDetails;

            return orderHeader;
        }

    }
}
