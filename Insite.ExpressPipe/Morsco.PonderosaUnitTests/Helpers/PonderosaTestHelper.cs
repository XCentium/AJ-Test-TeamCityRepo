using System;
using System.Data;
using System.Xml.Serialization;
using System.Collections.Generic;
using System.IO;
using Morsco.PonderosaService.Entities;

namespace PonderosaUnitTests.Helpers
{
    class PonderosaTestHelper
    {

        public static OrderHeader GetTestOrder()
        {
            var result = new OrderHeader
            {
                ShipToId = 17926,
                PriceBranch = "99",
                ShipBranch = "99",
                OrderStatus = "B",
                RequireDate = DateTime.Now,
                ShipDate = DateTime.Now,
                CustomerPo = "FD-375684",
                ReleaseNo = "01-TEST",
                OrderBy = "Matt Glover",
                ShipVia = "OT OUR TRUCK",
                Freight = 101.65M,
                Handling = 10.0M,
                TaxExemptNo = "COLO-1857930",
                TaxJurisdiction = "Grand Junction",
                Keywords = "Keyword1",
                ShippingInstr = "Must notify 24 hours before delivery.",
                InternalNotes = "Freuhoff Project",
                AltPhoneNo = "303-444-5555",
                AltSalesSource = "NORM",
                AltShippingName = "Freuhoff Project Jobsite",
                AltShippingAddress = (new [] {"2300 Delaware St", "Building C"}),
                AltShippingCity = "Palisade",
                AltShippingState = "CO",
                AltShippingZip = "81526"
            };
            return result;
        }

        public static IList<OrderDetailBase> GetTestDetail()
        {
            var productIds = new List<Int32> { 2040798, 2040799, 20408, 2040801 };
            var result = new List<OrderDetailBase>
            {
                new CommentLine
                {
                    Description = new List<string> {"WEBSITE TEST ORDER"}
                },
                new OrderItem
                {
                    ProductId = productIds[0],
                    OrderQty = 1,
                    SellUnit = "cs"
                },
                new OrderItem
                {
                    ProductId = productIds[1],
                    Description = new List<string> {"Additional comment line"},
                    DescOverride = false,
                    OrderQty = 2
                },
                new OrderItem
                {
                    ProductId = productIds[2],
                    Description = new List<string> {"Replacement for Product Description"},
                    DescOverride = true,
                    OrderQty = 32,
                    SellUnit = "cs",
                    UnitPrice = 1.382M,
                    ItemReleaseNo = "72-9375"
                }
            };
            return result;
        }
        
        public static List<int> GetBillToCustomerIDs()
        {
            List<int> billToCustomerIDs = new List<int>
            {
                141,
                69561,
                18515,
                18218,
                67815,
                69563,
                69568,
                31378,
                28608,
                69562,
                18696,
                31461,
                69567,
                18040,
                11680,
                69566,
                24595,
                24597,
                46289,
                18118
            };
            return billToCustomerIDs;
        }

        public static List<int> GetShipToCustomerIDs()
        {
            List<int> shipToCustomerIDs = new List<int>
            {
                18515,
                18118,
                18696,
                46289,
                19190,
                18040,
                25244,
                25846,
                54722,
                51592,
                49364,
                24081,
                44774,
                29746,
                29820,
                64344,
                29247,
                29846,
                19163,
                29914
            };
            return shipToCustomerIDs;
        }

        public static List<int> GetProductIDs()
        {
            List<int> productIDs = new List<int>
            {
                1795633,
                1801906,
                1800056,
                1800057,
                1950749,
                1996408,
                1801905,
                1808232,
                1950747,
                1948189,
                1797650,
                1801908,
                1624104,
                1743598
            };
            return productIDs;
        }
        #region Integration Processor UnitTesting


        public static DataSet GetSerializedDataSet()
        {
            var xmlSerializer = new XmlSerializer(typeof(DataSet));
            var readStream = new FileStream("C:\\serialObjectXML_System.Data.DataSet_20150929201302302.xml", FileMode.Open);
            var ds = (DataSet)xmlSerializer.Deserialize(readStream);
            readStream.Close();
            return ds;
        }

        public static OrderHeader GetOrderHeader(DataSet dataSetOrderData)
        {
            var eclipseOrderHeader = new OrderHeader();

            if (dataSetOrderData != null && dataSetOrderData.Tables.Count > 0)
            {
                DataTable dtCustomerOrder = dataSetOrderData.Tables["CustomerOrder"];
                DataTable dtCustomer = dataSetOrderData.Tables["Customer"];
                DataTable dtShipVia = dataSetOrderData.Tables["ShipVia"];
                DataTable dtOrderLine = dataSetOrderData.Tables["OrderLine"];

                if (dtCustomerOrder != null && dtCustomerOrder.Rows.Count > 0)
                {
                    DataRow drCustomerOrder = dtCustomerOrder.Rows[0];
                    DataRow drCustomer = dtCustomer.Rows[0];
                    DataRow drOrderLine = dtOrderLine.Rows[0];
                    DataRow drShipVia = dtShipVia.Rows[0];

                    if (drCustomerOrder["CustomerSequence"] != null && drCustomerOrder["CustomerSequence"].ToString() != string.Empty)
                        eclipseOrderHeader.ShipToId = Convert.ToInt32(drCustomerOrder["CustomerSequence"]);
                    else
                        eclipseOrderHeader.ShipToId = Convert.ToInt32(drCustomerOrder["CustomerNumber"]);

                    eclipseOrderHeader.PriceBranch = drOrderLine["ShipSite"].ToString();
                    eclipseOrderHeader.ShipBranch = drOrderLine["ShipSite"].ToString();

                    #region Setting Orderstatus and RequestedShipDate based on the business rules

                    bool shipEarly = false;
                    bool shipPartial = false;
                    DateTime requestedShipDate = Convert.ToDateTime("1/1/1111");

                    if (drCustomerOrder["ShipEarly"] != null && drCustomerOrder["ShipEarly"].ToString() != string.Empty)
                    {
                        shipEarly = Convert.ToBoolean(drCustomerOrder["ShipEarly"]);
                    }
                    if (drCustomerOrder["ShipPartial"] != null && drCustomerOrder["ShipPartial"].ToString() != string.Empty)
                    {
                        shipPartial = Convert.ToBoolean(drCustomerOrder["ShipPartial"]);
                    }
                    if (drCustomerOrder["RequestedShipDate"] != null && drCustomerOrder["RequestedShipDate"].ToString() != string.Empty)
                    {
                        requestedShipDate = Convert.ToDateTime(drCustomerOrder["RequestedShipDate"]);
                    }

                    //Setting Orderstatus and RequestedShipDate based on the business rules
                    if (!shipEarly)
                        eclipseOrderHeader.OrderStatus = "H";
                    else if (shipEarly && !shipPartial)
                        eclipseOrderHeader.OrderStatus = "S";
                    else if (shipEarly && shipPartial && requestedShipDate != Convert.ToDateTime("1/1/1111"))
                    {
                        eclipseOrderHeader.OrderStatus = "S";
                        eclipseOrderHeader.RequireDate = requestedShipDate;
                    }
                    #endregion

                    eclipseOrderHeader.CustomerPo = drCustomerOrder["CustomerPO"].ToString();

                    #region ShipVia Business Rules Handling

                    string carrierName = drShipVia["CarrierName"].ToString();
                    if (carrierName == "Will Call")
                    {
                        eclipseOrderHeader.ShipVia = "WILL CALL";
                    }
                    else if (carrierName == "Deliver")
                    {
                        eclipseOrderHeader.ShipVia = "BEST WAY";
                    }
                    else // *****TO BE REMOVED LATER*****
                    {
                        //throw Exception("");
                        //Throw exception 
                    }

                    //Temporarily hard coding and needs to be removed..
                    //??PrimarySalespersonNumberName???
                    eclipseOrderHeader.AltSalesperson = "HOUSE123"; //drCustomer["PrimarySalespersonNumberName"].ToString();
                    //EclipseOrderHeader.Writer = drCustomerOrder["PlacedByUserName"].ToString();
                    //EclipseOrderHeader.OrderBy = drCustomerOrder["PlacedByUserName"].ToString();

                    #endregion

                    //??OrderFreightableTotal??
                    if (drCustomerOrder["OrderFreightableTotal"] != null && drCustomerOrder["OrderFreightableTotal"].ToString() != string.Empty)
                        eclipseOrderHeader.Freight = Convert.ToDecimal(drCustomerOrder["OrderFreightableTotal"]);
                    if (drCustomerOrder["Handling"] != null && drCustomerOrder["Handling"].ToString() != string.Empty)
                        eclipseOrderHeader.Handling = Convert.ToDecimal(drCustomerOrder["Handling"].ToString());
                    eclipseOrderHeader.WebOrderNo = drCustomerOrder["OrderNumber"].ToString();
                    eclipseOrderHeader.ShippingInstr = drCustomerOrder["Notes"].ToString();
                    eclipseOrderHeader.AltPhoneNo = drCustomerOrder["BTPhone"].ToString();
                    

                    #region Terms code handling
                    string termsCode = drCustomerOrder["TermsCode"].ToString();

                    if (termsCode == "CreditCard")
                        eclipseOrderHeader.AltTerms = "COD";
                    else if (termsCode == "")
                        eclipseOrderHeader.AltTerms = drCustomer["TermsCode"].ToString();
                    #endregion

                    eclipseOrderHeader.AltShippingPhoneNumber = drCustomerOrder["STPhone"].ToString();

                    var shippingName = string.Empty;
                    if (drCustomerOrder["STCompanyName"].ToString() != string.Empty)
                        shippingName = drCustomerOrder["STCompanyName"].ToString();
                    else if (drCustomerOrder["STFirstName"].ToString() != string.Empty)
                        shippingName = drCustomerOrder["STFirstName"] + " " + drCustomerOrder["STMiddleName"] + " " + drCustomerOrder["STLastName"];
                    eclipseOrderHeader.AltShippingName = shippingName;

                    var shippingAddressList = new List<string>
                    {
                        drCustomerOrder["STAddress1"].ToString(),
                        drCustomerOrder["STAddress2"].ToString(),
                        drCustomerOrder["STAddress3"].ToString()
                    };

                    eclipseOrderHeader.AltShippingAddress = shippingAddressList;
                    eclipseOrderHeader.AltShippingCity = drCustomerOrder["STCity"].ToString();
                    eclipseOrderHeader.AltShippingState = drCustomerOrder["STState"].ToString();
                    eclipseOrderHeader.AltShippingZip = drCustomerOrder["STPostalCode"].ToString();
                }
            }
            return eclipseOrderHeader;
        }

        /*
         * This method populates the Eclipse Order Details from the Web Order data 
         * 
         */

        public static IList<OrderDetailBase> GetOrderDetail(DataSet webOrderData)
        {
            var result = new List<OrderDetailBase>();
            var notes = new List<string>();

            var orderLines = webOrderData.Tables["OrderLine"].Rows;
            var products = webOrderData.Tables["Product"].Rows;

            if (orderLines.Count > 0)
            {
                int rowCount = 0;
                foreach (var drOrderLine in orderLines)
                {
                    OrderItem newOrderLine = new OrderItem {ItemCode = "P"};
                    if (products[rowCount]["ERPNumber"] != null && products[rowCount]["ERPNumber"].ToString() != string.Empty)
                        newOrderLine.ProductId = Convert.ToInt32(products[rowCount]["ERPNumber"]);
                    newOrderLine.SellUnit = products[rowCount]["UnitOfMeasure"].ToString();
                    newOrderLine.OrderQty = Convert.ToInt32(orderLines[rowCount]["QtyOrdered"]);
                    newOrderLine.DescOverride = false;
                    result.Add(newOrderLine);
                    if (orderLines[rowCount]["Notes"] != null && orderLines[rowCount]["Notes"].ToString() != string.Empty)
                    {
                        notes.Add(orderLines[rowCount]["Notes"].ToString());
                    }
                    rowCount++;
                }

                if (notes.Count > 0)
                {
                    var newNotesItem = new OrderItem
                    {
                        ItemCode = "C",
                        Description = notes
                    };
                    result.Add(newNotesItem);
                }
            }

            return result;
        }

        #endregion
    }
}
