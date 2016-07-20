using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using Insite.Common.Logging;
using Insite.Core.Interfaces.Data;
using Insite.Data.Entities;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Mappers;
using Ponderosa.U2mv;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Repositories
{
    public class OrderRepository : BasePonderosaRepository
    {
        #region Order Public Methods


        public OrderHeader UpdateOrder(OrderHeader order, string session = null)
        {
            Connection connection = null;
            OrderHeader result;

            try
            {
                connection = ConnectionPool.GetConnection();
                var orderRequest = PonderosaOrderToBuildOrderRequestMapper.Map(order);
                if (session != null)
                {
                    orderRequest.OrderHeader[OrderHeaderConstants.Session_ID] = session;
                    orderRequest.OrderHeader[OrderHeaderConstants.Retain_Lock] = false;
                }
                var orderResult = connection.SubmitHeaderDetail(ServiceConstants.UpdateOrder, orderRequest.OrderHeader, orderRequest.OrderDetail);
                result = HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(orderResult);
            }
            catch (Contingency c)
            {
                throw new Exception(c.FullMessage);
            }
            finally
            {
                connection?.Close();
            }

            return result;
        }

        public OrderHeader UpdateOrder2(UpdateOrderDto order, List<UpdateOrderItemDto> orderDetail, string session = null)
        {
            Connection connection = null;
            OrderHeader result;

            if (session != null)
            {
                order.SessionId = session;
                order.RetainLock = false;
            }

            var itemsToUpdate = orderDetail.Select(od => od.Values as IDictionary<string, Object>).ToList();
                
            try
            {   
                connection = ConnectionPool.GetConnection();
                var orderResult = connection.SubmitHeaderDetail(ServiceConstants.UpdateOrder, order.Values, itemsToUpdate);
                result = HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(orderResult);
            }
            catch (Contingency c)
            {
                throw new Exception(c.FullMessage);
            }
            finally
            {
                connection?.Close();
            }

            return result;
        }

        public OrderHeader SubmitOrder(OrderHeader order)
        {
            if (order == null)
            {
                throw new ArgumentException("Order is required");
            }

            BuildOrderRequest request = PonderosaOrderToBuildOrderRequestMapper.Map(order);

            Connection connection = null;
            OrderHeader newOrder;
            try
            {
                connection = ConnectionPool.GetConnection();
                var submitResult = connection.SubmitHeaderDetail(ServiceConstants.SubmitOrder, request.OrderHeader, request.OrderDetail);
                newOrder = HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(submitResult);
            }
            finally
            {
                connection?.Close();
            }
            return newOrder;
        }

        /// <summary>
        /// Function: CalculateTax
        /// function is used to calculate tax for the customer order
        /// </summary>
        /// <param name="customerOrder">Order Header and Details</param>
        /// <param name="alternateCustomerSequence">context's ship-to -- required to get original shipto for a "new" address</param>
        /// <returns>Returns the Tax details</returns>
        public decimal CalculateTax(CustomerOrder customerOrder, string alternateCustomerSequence)
        {
            decimal taxAmount;
            var orderHeader = CustomerOrderToPonderosaOrderMapper.Map(customerOrder, alternateCustomerSequence);
            //Force to Bid as a means of making sure we correctly identify noncatalog products and don't make tax for them
            orderHeader.OrderStatus = OrderHeaderConstants.Bid;
            orderHeader.OrderNo = customerOrder.OrderNumber;
            var orderRequest = PonderosaOrderToBuildOrderRequestMapper.Map(orderHeader);

            try
            {
                ResponseResult result;
                Connection connection = null;
                try
                {
                    connection = ConnectionPool.GetConnection();
                    result = connection.UploadHeaderDetail(ServiceConstants.CalculateTax, orderRequest.OrderHeader, orderRequest.OrderDetail);
                }
                finally
                {
                    connection?.Close();
                }

                if (result != null)
                {
                    taxAmount = result.GetDecimal(ServiceConstants.TaxAmount);
                }
                else
                {
                    throw new Exception("ExpressPipe.PonderosaService.CalculateTax : Service returned null result for Tax Calculation.");
                }
            }
            catch (Contingency c)
            {
                throw new Exception(c.FullMessage);
            }
            return taxAmount;
        }

        public HeaderDetailResult GetHeaderDetailResultByOrderNo(string orderNo)
        {
            var request = new Dictionary<string, object>
            {
                ["Order_No"] = orderNo,
                ["All_Generations"] = true,
                ["Exclude_Bids"] = false,
                ["Include_Canceled"] = false
            };
            // When no generation is specified the first open
            // generation is returned unless All_Generations is true;
            // Additionally, any generation with a status of 'Bid'
            // is included unless Exclude_Bids is true;
            // only effective if All_Generations is true.

            HeaderDetailResult result = RequestOrder(ServiceConstants.OrderInquiry, request);
            return result;
        }
        public OrderHeader GetOrderByOrderNo(string orderNo)
        {
            var result = GetHeaderDetailResultByOrderNo(orderNo);
            var order = HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(result);
            return order;
        }

        public OrderHeader GetOrderByInvoice(string invoiceNo)
        {
            var request = new Dictionary<string, object> {["Invoice_No"] = invoiceNo};

            HeaderDetailResult result = RequestOrder(ServiceConstants.OrderInvoice, request);

            var order = HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(result);

            return order;
        }

        public List<OrderHeader> GetOrderHistory(int customerId, DateTime? startDate)
        {
            var request = new Dictionary<string, object>
            {
                [ServiceConstants.CustomerId] = customerId,
                [ServiceConstants.StartDate] = startDate
            };

            var result = RequestOrder(ServiceConstants.OrderHistory, request);
            
            var orders = new List<OrderHeader>();
            while (result.HasNext())
            {
                var newOrder = HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(result);
                orders.Add(newOrder);
            }
            return orders;
        }

        public List<PriceAvailability> GetPriceAvailability(List<int> productList, Customer billTo, Customer shipTo, IUnitOfWork unitOfWork)
        {
            var nonLoggedInCustomer = GetCustomerForNonLoggedInUser();

            int test;
            var testCustomerNumber = 
                (!string.IsNullOrWhiteSpace(shipTo?.CustomerSequence) && int.TryParse(shipTo.CustomerSequence, out test)) ? shipTo.CustomerSequence
                : (!string.IsNullOrWhiteSpace(billTo?.CustomerNumber) && billTo.CustomerNumber.ToLower() != "abandoned cart") ? billTo.CustomerNumber
                : (!string.IsNullOrWhiteSpace(nonLoggedInCustomer)) ? nonLoggedInCustomer
                : "";

            if (string.IsNullOrWhiteSpace(testCustomerNumber))
            {
                LogHelper.For(this).Error("Customer for Price/Availability not resolved.");
            }

            int customerId;
            if (!int.TryParse(testCustomerNumber, out customerId))
            {
                LogHelper.For(this).Error($"Error converting ({testCustomerNumber}) to int");
            }

            var branch = GetBranch(billTo, shipTo, unitOfWork);
            return GetPriceAvailability2(productList, customerId, branch);
        }

        private string GetBranch(Customer billTo, Customer shipTo, IUnitOfWork unitOfWork)
        {
            var branch = string.Empty;
            string shipToNumber = string.Empty;
            string billToNumber = string.Empty;

            //Try the branches for shipto if available
            if (!string.IsNullOrWhiteSpace(shipTo?.CustomerSequence))
            {
                shipToNumber = shipTo.CustomerSequence;
                branch = GetBranchFromCustomer(shipTo);
            }

            //Then try the branches for billto, if available (not available for unlogged-in user)
            if (string.IsNullOrWhiteSpace(branch) && !string.IsNullOrWhiteSpace(billTo?.CustomerNumber))
            {
                billToNumber = billTo.CustomerNumber;
                branch = GetBranchFromCustomer(billTo);
            }

            //if branch is still unknown try for the default non-logged in user
            if (string.IsNullOrWhiteSpace(branch))
            {
                var defaultCustNum = GetCustomerForNonLoggedInUser();

                var defaultCust = unitOfWork.GetRepository<Customer>().GetTable()
                    .FirstOrDefault(x => x.CustomerNumber.Equals(defaultCustNum, StringComparison.CurrentCultureIgnoreCase));

                if (defaultCust == null)
                {
                    throw new Exception($"Default customer ({defaultCustNum}) not found");
                }
                branch = GetBranchFromCustomer(defaultCust);
            }

            if (string.IsNullOrWhiteSpace(branch))
            {
                throw new Exception($"Price branch not found for billTo ({billToNumber}), shipto ({shipToNumber})");
            }
            return branch;
        }

        public List<PriceAvailability> GetPriceAvailability2(List<int> productList, int customerId, string branch)
        {
            var priceAvailabilityList = new List<PriceAvailability>();
			if (productList == null || productList.Count == 0)
			{
				LogHelper.For(this).Info("GetPriceAvailability: productlist was null or empty, so returning empty priceAvailabilityList");
				return priceAvailabilityList;
			}

            var request = new Dictionary<string, object>
            {
                ["Product_ID_List"] = productList,
                ["Customer_ID"] = customerId,
                ["Price_Branch"] = branch,
                ["Stock_Branch"] = "ALL"
            };
            // optional - defaults to home branch

            Connection connection = null;

            try
            {
                var startdate = DateTime.Now;
                connection = ConnectionPool.GetConnection();

                var result = connection.RequestTable(ServiceConstants.PriceAvailability, request);
#if DEBUG
                LogHelper.For(this).Info($"Get Price/Availability for {productList.Count} items took {DateTime.Now.Subtract(startdate).TotalMilliseconds}");
#endif
                while (result.HasNext())
                {
                    var items = result.GetRowResult();
                    var pa = new PriceAvailability(items)
                    {
                        CustomerId = customerId
                    };
                    priceAvailabilityList.Add(pa);
                }
            }
            finally
            {
                connection?.Close();
            }
            return priceAvailabilityList;
        }

        private string GetBranchFromCustomer(Customer cust)
        {
            if (cust != null)
            {
                var sbo = cust.CustomProperties.FirstOrDefault(x => x.Name.EqualsIgnoreCase("ShipBranchOverride"));
                if (sbo != null)
                {
                    return sbo.Value;
                }
                if (!string.IsNullOrEmpty(cust.DefaultWarehouse?.ShipSite))
                {
                    return cust.DefaultWarehouse.ShipSite;
                }
            }
            return string.Empty;
        }
        
        public bool GetChangedOrdersStreaming(bool onlyChangedOrders, bool excludeBids, DateTime? startDate, DateTime? endDate, int maxIds,
            int flowCount, ResultHandler resultHandler)
        {
            // For testing, get a null result handler
            if (resultHandler == null)
            {
                resultHandler = new OrderHandler();
            }

            var request = new Dictionary<string, object>();
            if (onlyChangedOrders)
            {
                request["Changed_Only"] = true;
            }
            if (excludeBids)
            {
                request["Exclude_Bids"] = true;
            }
            if (startDate != null)
            {
                request["Start_Date"] = startDate;
            }
            if (endDate != null)
            {
                request["End_Date"] = endDate;
            }
            if (maxIds > 0)
            {
                request["Max_IDs"] = maxIds;
            }

            request["Flow_Count"] = flowCount;

            GetOrders(request, resultHandler);

            return true;
        }
        #endregion

        #region Ponderosa Order Endpoint Methods

        private HeaderDetailResult RequestOrder(string transferClass, IDictionary<string, object> request)
        {
            Connection connection = null;
            HeaderDetailResult result;
            try
            {
                connection = ConnectionPool.GetConnection();
                result = connection.RequestHeaderDetail(transferClass, request);
            }
            catch (Contingency c)
            {
                throw new Exception(c.FullMessage);
            }
            finally
            {
                connection?.Close();
            }
            return result;
        }

        public OrderHeader LockOrder(string orderNo, string sessionId)
        {
            Connection connection = null;
            HeaderDetailResult result;
            try
            {
                connection = ConnectionPool.GetConnection();
                var request = new Dictionary<string, object>
                {
                    [OrderHeaderConstants.Order_No] = orderNo,
                    [OrderHeaderConstants.Session_ID] = sessionId,
                    [OrderHeaderConstants.All_Generations] = true
                };
                // unique value for each user session

                result = connection.RequestHeaderDetail(ServiceConstants.LockOrder, request);
            }
            catch (Contingency c)
            {
                throw new Exception(c.FullMessage);
            }
            finally
            {
                connection?.Close();
            }
            return HeaderDetailResultToPonderosaOrderMapper.MapSingleGeneration(result);
        }

        public bool UnlockOrder(string orderNo, string sessionId)
        {
            Connection connection = null;
            try
            {
                connection = ConnectionPool.GetConnection();
                IDictionary<string, object> request = new Dictionary<string, object>();
                request["Order_No"] = orderNo;
                request["Session_ID"] = sessionId;
                connection.SendRequest(ServiceConstants.UnlockOrder, request);
            }
            catch (Contingency c)
            {
                throw new Exception(c.FullMessage);
            }
            finally
            {
                connection?.Close();
            }
            return true;
        }

        private string GetCustomerForNonLoggedInUser()
        {
            var nonLoggedInCustomer = ConfigurationManager.AppSettings["CustomerForNonLoggedInUser"];
            if (string.IsNullOrWhiteSpace(nonLoggedInCustomer))
            {
                throw new Exception("Setting for \"CustomerForNonLoggedInUser\" not found.");
            }
            return nonLoggedInCustomer;
        }


        /// <summary>
        /// Retrieve and display orders.
        /// </summary>
        private void GetOrders(Dictionary<string, object> request, ResultHandler resultHandler)
        {
            Connection connection = null;
            try
            {
                LogHelper.For(this).Info("Getting orders");
                connection = ConnectionPool.GetConnection();
                connection.SendRequest(ServiceConstants.OrderStream, request, resultHandler);
            }
            catch (Contingency ex)
            {
                if (ex.Message == "No open orders or invoices have changed.")
                {
                    LogHelper.For(this).Info(ex.Message);
                }
                else
                {
                    LogHelper.For(this).Error(ex.Message + Environment.NewLine + ex.StackTrace);
                    throw;
                }
            }
            finally
            {
                connection?.Close();
            }
        }

        /// <summary>
        /// Handler that stores individual product rows as they're received.
        /// </summary>
        public class OrderHandler : ResultHandler
        {

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

            }


            private void DisplayOrder(HeaderDetailResult result, bool multiGen)
            {

                // Header
                RowResult header = result.GetHeaderResult();
                System.Diagnostics.Debug.WriteLine("Order Number:   " + header.GetString("Order_No"));

                if (!header.IsIndexed("Generation"))
                {
                    // Single generation
                    DisplayHeader(header);
                    System.Diagnostics.Debug.WriteLine("");
                    DisplayDetail(result, multiGen);
                }
                else
                {
                    // Multiple generations
                    int generationCount = header.GetElementCount("Generation");
                    for (int index = 0; index < generationCount; index++)
                    {
                        HeaderDetailResult generation = result.GetHeaderDetailSlice("Generation", index);
                        System.Diagnostics.Debug.WriteLine("Generation:   #" + generation.GetHeaderInt("Generation"));
                        DisplayHeader(generation.GetHeaderResult());
                        System.Diagnostics.Debug.WriteLine("");
                        result.Reset();
                        while (generation.HasNext())
                        {
                            DisplayLineItem(generation.GetRowResult(), multiGen);
                        }
                        System.Diagnostics.Debug.WriteLine("");
                    }
                }
            }

            private void DisplayHeader(RowResult result)
            {
                System.Diagnostics.Debug.WriteLine("Status:         " + result.GetString("Order_Status"));
                System.Diagnostics.Debug.WriteLine("Order Date:     " + Ponderosa.CSharp.Utility.ToString(result.GetDate("Order_Date")));
                System.Diagnostics.Debug.WriteLine("Require Date:   " + Ponderosa.CSharp.Utility.ToString(result.GetDate("Require_Date")));
                System.Diagnostics.Debug.WriteLine("Ship Date:      " + Ponderosa.CSharp.Utility.ToString(result.GetDate("Ship_Date")));
                System.Diagnostics.Debug.WriteLine("Bill Customer:  " + result.GetString("BillTo") + " (" +
                                                   result.GetInt("BillTo_ID") + ")");
                System.Diagnostics.Debug.WriteLine("Ship Customer:  " + result.GetString("ShipTo") + " (" +
                                                   result.GetInt("ShipTo_ID") + ")");

                //DisplayShippingAddress(result.GetSubMap("Shipping_Address"));

                System.Diagnostics.Debug.WriteLine("PO Number:             " + result.GetString("Customer_PO"));
                System.Diagnostics.Debug.WriteLine("Ordered By:            " + result.GetString("Order_By"));
                System.Diagnostics.Debug.WriteLine("Release Number:        " + result.GetString("Release_No"));
                System.Diagnostics.Debug.WriteLine("Salesperson:           " + result.GetString("Salesperson"));
                System.Diagnostics.Debug.WriteLine("Writer:                " + result.GetString("Writer"));
                System.Diagnostics.Debug.WriteLine("Ship Via:              " + result.GetString("Ship_Via"));
                System.Diagnostics.Debug.WriteLine("Terms:                 " + result.GetString("Terms"));
                System.Diagnostics.Debug.WriteLine("Freight:               " + result.GetDecimal("Freight"));
                System.Diagnostics.Debug.WriteLine("Handling:              " + result.GetDecimal("Handling"));
                System.Diagnostics.Debug.WriteLine("Tax:                   " + result.GetDecimal("Tax"));
                System.Diagnostics.Debug.WriteLine("FET:                   " + result.GetDecimal("FET"));
                System.Diagnostics.Debug.WriteLine("Service Charge:        " + result.GetDecimal("Service_Chrg"));
                System.Diagnostics.Debug.WriteLine("Total:                 " + result.GetDecimal("Total"));
                System.Diagnostics.Debug.WriteLine("Shipping Instructions: " + result.GetString("Shipping_Instr"));

                // Credit card
                RowResult cc = result.GetSubMap("Credit_Card");
                if (cc == null) return;

                System.Diagnostics.Debug.Write("Credit Card - ");
                System.Diagnostics.Debug.Write(cc.GetString("CardType") + " ");
                // VI, MC, etc (recommend using the first letter only)
                System.Diagnostics.Debug.Write("xxxx-xxxx-xxxx-");
                System.Diagnostics.Debug.Write(cc.GetString("CardNumber") + " "); // last four digits
                System.Diagnostics.Debug.Write(cc.GetString("ExpireDate") + " "); // MMYY
                System.Diagnostics.Debug.Write(cc.GetString("CardHolder") + " ");
                System.Diagnostics.Debug.Write(cc.GetString("Street_Address") + " ");
                System.Diagnostics.Debug.Write(cc.GetString("Postal_Code") + " ");

                string acctId = cc.GetString("ElementAcctID");
                string ccv = cc.GetString("CCV_Code");
                int auth = cc.GetInt("AuthType");

                if (acctId.Length > 0)
                {
                    System.Diagnostics.Debug.Write("Element Acct: " + acctId + " ");
                    System.Diagnostics.Debug.Write("Auth Type: " + auth + " ");
                }
                else
                {
                    System.Diagnostics.Debug.Write("***No Element Account***");
                }

                if (ccv.Length > 0)
                {
                    System.Diagnostics.Debug.Write("CCV: " + ccv + " ");
                }

                System.Diagnostics.Debug.WriteLine("");

            }

            private void DisplayDetail(MultiRowResult result, bool mustHaveShipQty)
            {
                System.Diagnostics.Debug.WriteLine("Line Items: ");
                while (result.HasNext())
                {
                    DisplayLineItem(result.GetRowResult(), mustHaveShipQty);
                }
                System.Diagnostics.Debug.WriteLine("");
            }

            /// <summary>
            /// Display line item for an extracted result.
            /// Specify whether items with no ship quantity are displayed.
            /// </summary>
            private void DisplayLineItem(RowResult result, bool mustHaveShipQty)
            {
                string itemCode = result.GetString("Item_Code");

                //Common
                System.Diagnostics.Debug.Write("Line Item: " + result.GetInt("Line_Item_ID") + "|");
                System.Diagnostics.Debug.Write("Item Code: " + itemCode + "|");
                System.Diagnostics.Debug.Write("Item Code: " + string.Join("~", result.GetArray("Description")) + "|");

                if (mustHaveShipQty && itemCode.Equals("P") && result.IsValueEmpty("Ship_Qty")) return;

                System.Diagnostics.Debug.Write(result.GetInt("Line_Item_ID") + "|");
                string unit = result.GetString("Sell_Unit");

                if (itemCode.Equals("P") || itemCode.Equals("L"))
                {
                    // Standard line item.
                    System.Diagnostics.Debug.Write(" " + result.GetInt("Product_ID") + "|");
                    System.Diagnostics.Debug.Write(" " + result.GetInt("Order_Qty") + unit + "|");
                    System.Diagnostics.Debug.Write(" " + result.GetInt("Ship_Qty") + unit + "|");
                    System.Diagnostics.Debug.Write(" " + result.GetDecimal("Unit_Price") + "|");
                    System.Diagnostics.Debug.Write(" " + unit + "=" + result.GetInt("Sell_Unit_Qty") + "|");
                    System.Diagnostics.Debug.Write(" [" + result.GetString("Ship_Qty_Alpha") + "]" + "|");
                    // quantity with sell unit(s) as displayed on the order entry screen
                    System.Diagnostics.Debug.Write(" " + Join(result.GetArray("Description"), ", ") + "|");
                    System.Diagnostics.Debug.Write(" " + result.GetString("UPC") + "|");
                    System.Diagnostics.Debug.Write(" " + result.GetString("Item_Release_No") + "|");
                    if (!result.IsValueEmpty("PDW_ID") && result.GetInt("PDW_ID") > 0)
                    {
                        // PDW ID is included when support for PDW has been provided
                        // and product is linked to a PDW item.
                        System.Diagnostics.Debug.Write(" " + result.GetInt("PDW_ID") + "|");
                    }
                    if (!result.IsValueEmpty("Available_Date"))
                    {
                        // Product availability is included when item hasn't shipped.
                        System.Diagnostics.Debug.Write(" " + Ponderosa.CSharp.Utility.ToString(result.GetDate("Available_Date")) + "|");
                        System.Diagnostics.Debug.Write(" " + result.GetInt("Available_Qty") + "|");
                    }
                    int serialCount = result.GetElementCount("Serial_Numbers");
                    for (int n = 0; n < serialCount; ++n)
                    {
                        System.Diagnostics.Debug.Write((n == 0) ? " " : ",");
                        System.Diagnostics.Debug.Write(result.GetString("Serial_Numbers", n));
                    }
                }
                else if (itemCode.Equals("M"))
                {
                    // Miscellaneous charge item (for example a delivery charge).
                    System.Diagnostics.Debug.Write(" " + itemCode + " " + Join(result.GetArray("Description"), ", ") +
                                                   "|");
                    System.Diagnostics.Debug.Write(" " + result.GetInt("Order_Qty") + unit + "|");
                    System.Diagnostics.Debug.Write(" " + result.GetDecimal("Unit_Price"));
                }
                else
                {
                    // Line item comment. -- has only stock items
                }

                System.Diagnostics.Debug.WriteLine("");

            }

            private string Join(string[] array, string delimiter)
            {
                return string.Join(delimiter, array);
            }

        }
    }

        #endregion

}
