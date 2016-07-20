using System;
using System.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Morsco.IntegrationProcessor.Repositories;
using Morsco.IntegrationProcessor.Helper;
using Morsco.PonderosaService.Services;

namespace Morsco.IntegrationProcessor.UnitTest
{
    [TestClass]
    public class OrderSubmitTest
    {
        #region Integration Processor Testing
        [TestMethod]
        public void SubmitOrder_With_TestData()
        {
            bool testSuccess = false;
            using (var svc = new OrderServices())
            {
                DataSet ds = TestHelper.GetSerializedDataSet();

                Helper.UtilityHelper IPHelper = new UtilityHelper();
                Repositories.DataRepository IPRepository = new DataRepository();

                var order = IPHelper.GetOrderHeader(ds, null);
                order.OrderDetail = IPHelper.GetOrderDetail(ds);
                var result = svc.SubmitOrder(order);
                testSuccess = result != null;
                if (!testSuccess)
                    Assert.IsTrue(testSuccess, "Failed to create order");
                Assert.IsFalse(string.IsNullOrEmpty(result.OrderNo), "Order not found");
            }
            Assert.IsTrue(testSuccess, "Failed to create order");
        }

        [TestMethod]
        public void UpdateCustomerOrderWithERPProcessingDetails_With_TestData()
        {
            DataRepository dataRep = new DataRepository();
            string erpOrderNumber = "ERP89756436";
            string erpOrderStatus = "S";
            string webOrderNumber = "WEB001568";
            string userName = string.Empty;
            string companyName = string.Empty;
            string shipDate = "2015-11-27";

            bool testSuccess = false;
 
            try
            {
                dataRep.UpdateEclipseOrderResponseDetails(erpOrderNumber, erpOrderStatus, webOrderNumber, userName, companyName, shipDate);
                testSuccess = true;
            }
            catch (Exception)
            {
                testSuccess = false;
            }
            Assert.IsTrue(testSuccess, "Failed to update CustomerOrder table with ERP Details");
        }
        
        #endregion
    }
}
