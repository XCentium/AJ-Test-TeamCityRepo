using System;
using System.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PonderosaUnitTests.Helpers;
using System.Collections.Generic;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Services;

//using Morsco.Customizations.Lib.PonderosaOrderUpdate.Services;


namespace PonderosaUnitTests
{
    [TestClass]
    public class UnitTest1
    {
        [ClassInitialize]
        public static void Init(TestContext context)
        {
            PonderosaService.PerformInitialization();
        }

        [ClassCleanup]
        public static void Cleanup()
        {
            PonderosaService.DisposeConnectionPool();
        }

		[TestMethod]
		public void Test_AddContact()
		{
			var cr = new ContactServices();

			//Set up contact
			Dictionary<string, object> contact = new Dictionary<string, object>();
			// Required for new contacts
			contact[ContactConstants.CustomerID] = 1007; //This will break when we switch back to expresspipe
			contact[ContactConstants.FirstName] = "..";
			contact[ContactConstants.LastName] = "Joe Smith";

			// Contact address (optional)
			Dictionary<string, object> contactAddress = new Dictionary<string, object>();
			contactAddress[ContactConstants.Address] = "742 Evergreen Terrace";
			contactAddress[ContactConstants.City] = "Springfield";
			contactAddress[ContactConstants.State] = "PO";
			contactAddress[ContactConstants.Zip] = "12345";
			contact[ContactConstants.ContactAddress] = contactAddress;

			// User ID for Eclipse change log (required)
			contact[ContactConstants.ChangedBy] = ContactConstants.WebsiteTest;

			Dictionary<string, object> access = new Dictionary<string, object>();
			access["Login"] = "test5@xcentium.com";
			access["Password"] = "NotApplicable";
			contact["Access_Control"] = access;


			var result = cr.AddContact(contact);

			Assert.IsNotNull(result, "Failed to add account");
		}

		[TestMethod]
		public void Test_GetContact()
		{
			var cr = new ContactServices();
			var contactId = 1005;
			var result = cr.GetContact(contactId);

			Assert.IsNotNull(result, "Failed to get contact");
		}

		[TestMethod]
		public void Test_DeleteContact()
		{
			var cs = new ContactServices();
			var contactId = 1007;
			var result = cs.DeleteContact(contactId);

			Assert.IsNotNull(result, "Failed to get contact");
		}

		//[TestMethod]
		//public void Test_SubmitOrder_With_TestData()
		//{
		//	bool testSuccess = false;
		//	using (var svc = new OrderServices())
		//	{
		//		var order = PonderosaTestHelper.GetTestOrder();
		//		order.OrderDetail = PonderosaTestHelper.GetTestDetail();

		//		var result = svc.SubmitOrder(order);
		//		testSuccess = result != null;
		//		Assert.IsFalse(String.IsNullOrEmpty(result.OrderNo), "Order not found");
		//	}
		//	Assert.IsTrue(testSuccess, "Failed to create order");
		//}

		//[TestMethod]
		//public void Test_UpdateOrder()
		//{
		//	bool testSuccess = false;
		//	string orderNo = "S100004995";

		//	Assert.IsTrue(testSuccess, "Failed to update order");
		//}

		//[TestMethod]
		//public void Test_GetOrderByInvoice()
		//{
		//	bool testSuccess = false;
		//	using (var svc = new OrderServices())
		//	{
		//		var invoiceNo = "123";

		//		var result = svc.GetOrderByInvoice(invoiceNo);
		//		testSuccess = result != null;
		//		Assert.IsFalse(String.IsNullOrEmpty(result.OrderNo), "Order not found");
		//	}
		//}

		//[TestMethod]
		//public void Test_GetOrderHistory()
		//{
		//	bool testSuccess = false;
		//	int customerId = 1;
		//	DateTime? startDate = (DateTime.Now).AddMonths(-1);
		//	List<OrderHeader> orders = new List<OrderHeader>();
		//	using (var svc = new OrderServices())
		//	{
		//		orders = svc.GetOrderHistory(customerId, startDate);
		//	}

		//	Assert.IsTrue(orders.Count > 0, "Failed to get order history");
		//}

		//[TestMethod]
		//public void Test_GetPriceAvailability()
		//{
		//	bool testSuccess = false;
		//	var c = Customer.GetByNumber("17926");
		//	List<PriceAvailability> priceAvailList = null;
		//	var productIds = new List<Int32> { 2040798, 2040799, 20408, 2040801 };
		//	using (var svc = new OrderServices())
		//	{
		//		priceAvailList = svc.GetPriceAvailability(productIds, c, null);
		//	}

		//	Assert.IsTrue(priceAvailList.Count > 0, "Failed to get price availability");
		//}

		//[TestMethod]
		//public void Test_PriceAvailabilityLoadTest()
		//{
		//	List<PriceAvailability> priceAvailList = new List<PriceAvailability>();

		//	List<int> billToIds = PonderosaTestHelper.GetBillToCustomerIDs();
		//	List<int> shipToIds = PonderosaTestHelper.GetShipToCustomerIDs();
		//	List<int> productIds = PonderosaTestHelper.GetProductIDs();

		//	List<string> results = new List<string>();
		//	foreach (int id in billToIds)
		//	{
		//		var watch = Stopwatch.StartNew();

		//		priceAvailList = GetProductsFromID(id, productIds);
		//		watch.Stop();
		//		var elapsedMs = watch.ElapsedMilliseconds;

		//		results.Add("----------------------------------");

		//		results.Add(string.Format("GetPriceAvailability() for id {0}  ({1} product ID's)", id, productIds.Count));

		//		foreach (var priceAvail in priceAvailList)
		//		{
		//			results.Add(string.Format("Product ID : {0}/n  ListPrice : {1}/n  PricePer : {2}/n  SellUnit : {3}/n  SellUnitQty : {4}/n  Status : {5}/n  StockQty : {6}/n  UnitPrice : {7}/n",
		//											priceAvail.ProductId, priceAvail.ListPrice,
		//											priceAvail.PricePer, priceAvail.SellUnit, priceAvail.SellUnitQty,
		//											priceAvail.Status, priceAvail.StockQty, priceAvail.UnitPrice));
		//		}

		//		results.Add(string.Format(" => Elapsed time: {0} seconds", elapsedMs / 1000.0));
		//	}
		//	foreach (var line in results)
		//	{
		//		Debug.WriteLine(line);
		//	}
		//}

		//// Takes 5 min -- dont run all the time [TestMethod]
		//public void Test_PriceAvailabilityLoadTestSingle()
		//{
		//	List<PriceAvailability> priceAvailList = new List<PriceAvailability>();

		//	List<int> billToIds = PonderosaTestHelper.GetBillToCustomerIDs();
		//	List<int> shipToIds = PonderosaTestHelper.GetShipToCustomerIDs();
		//	List<int> productIds = PonderosaTestHelper.GetProductIDs();
		//	var times = new List<long>();

		//	List<string> results = new List<string>();
		//	foreach (int id in billToIds)
		//	{
		//		foreach (var productId in productIds)
		//		{
		//			var list = new List<int>() {productId};

		//			var watch = Stopwatch.StartNew();
		//			priceAvailList = GetProductsFromID(id, list);
		//			watch.Stop();

		//			times.Add(watch.ElapsedMilliseconds);
		//		}
		//	}
		//	Debug.WriteLine("average: " + times.Average().ToString());
		//}

		//private static List<PriceAvailability> GetProductsFromID(int customerId, List<int> products)
		//{
		//	List<PriceAvailability> priceAvailList = null;
		//	var c = Customer.GetByNumber(customerId.ToString());
		//	using (var svc = new OrderServices())
		//	{
		//		priceAvailList = svc.GetPriceAvailability(products, c, null);
		//	}
		//	return priceAvailList;
		//}

		//[TestMethod]
		//public void Test_GetChangedOrders()
		//{
		//	string timeStamp = string.Format("{0:yyyyMMdd-hhmmss}", DateTime.Now);
		//	string tempFolder = "C:\\ETL\\EclipseOrderRefresh\\";
		//	string headerFile = "EclilpseOrderHeader.txt";
		//	string detailFile = "EclilpseOrderDetail.txt";
		//	headerFile = tempFolder + string.Concat(Path.GetFileNameWithoutExtension(headerFile), timeStamp, Path.GetExtension(headerFile));
		//	detailFile = tempFolder + string.Concat(Path.GetFileNameWithoutExtension(detailFile), timeStamp, Path.GetExtension(detailFile));
            
		//		using (var svc = new OrderServices())
		//		using (var handler = new OrderRefreshResultHandler(headerFile, detailFile))
		//		{
		//			svc.GetChangedOrders(ChangedOrdersToGet.Changed, handler);
		//		}

		//}

		//[TestMethod]
		//public void Test_GetOpenInvoicedOrders()
		//{
		//	string timeStamp = string.Format("{0:yyyyMMdd-hhmmss}", DateTime.Now);
		//	string tempFolder = "C:\\ETL\\EclipseOrderRefresh\\";
		//	string headerFile = "EclilpseOrderHeader.txt";
		//	string detailFile = "EclilpseOrderDetail.txt";
		//	headerFile = tempFolder + string.Concat(Path.GetFileNameWithoutExtension(headerFile), timeStamp, Path.GetExtension(headerFile));
		//	detailFile = tempFolder + string.Concat(Path.GetFileNameWithoutExtension(detailFile), timeStamp, Path.GetExtension(detailFile));
		//	using (var svc = new OrderServices())
		//	using (var handler = new OrderRefreshResultHandler(headerFile, detailFile))
		//	{
		//		svc.GetChangedOrders(ChangedOrdersToGet.InOpenInvoicePeriod, handler);
		//	}
            
		//}

        //[TestMethod]
        //public void Test_GetOrderChanges()
        //{

        //    var svc = new PonderosaOrderUpdateService();
        //    svc.GetOrderChanges(ChangedOrdersToGet.InOpenInvoicePeriod, handler);
                
        //}

        /// <summary>
        /// Don't use this for testing.  It was to find max lengths of various fields
        /// 
        /// </summary>
        //[TestMethod]

        #region Integration Processor Testing
        [TestMethod]
        public void IP_Test_SubmitOrder_With_TestData()
        {
            bool testSuccess = false;
            using (var svc = new OrderServices())
            {
                DataSet ds = PonderosaTestHelper.GetSerializedDataSet();

                var order = PonderosaTestHelper.GetOrderHeader(ds);
                order.OrderDetail = PonderosaTestHelper.GetOrderDetail(ds);
                var result = svc.SubmitOrder(order);
                testSuccess = result != null;
                if (!testSuccess)
                    Assert.IsTrue(testSuccess, "Failed to create order");
                Assert.IsFalse(string.IsNullOrEmpty(result.OrderNo), "Order not found");
            }
            Assert.IsTrue(testSuccess, "Failed to create order");
        }
        #endregion
    }
}
