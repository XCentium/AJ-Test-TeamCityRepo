using System;
using System.Configuration;
using System.Data;
using Insite.Common.Helpers;
using Insite.Integration.Enums;
using Insite.WIS.Broker;
using Insite.WIS.Broker.Interfaces;
using Insite.WIS.Broker.Plugins.Constants;
using Insite.WIS.Broker.WebIntegrationService;
using Morsco.IntegrationProcessor.Helper;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Services;

namespace Morsco.IntegrationProcessor
{
    /*
     * This method process the web order as soon as it gets submitted and get data to send it to Eclipse for backend ERP processing
     * It calls Ponderosa Order Service to send the web order data and get the ERPOrderNumber and Status after successful submission
     * and the same gets updated back in the Insite database order table
     */
    public class IntegrationProcessorOrderSubmit : IIntegrationProcessor
    {
        public DataSet Execute(SiteConnection siteConnection, IntegrationJob integrationJob, 
        JobDefinitionStep integrationJobStep)
        {

            //make sure the initial dataset is at least usable.
            var dataSet = XmlDatasetManager.ConvertXmlToDataset(integrationJob.InitialData);
            if (dataSet == null
            || !dataSet.Tables.Contains(Data.CustomerOrderTable)
            || dataSet.Tables[Data.CustomerOrderTable].Rows.Count == 0
            || !dataSet.Tables.Contains(Data.OrderLineTable)
            || dataSet.Tables[Data.OrderLineTable].Rows.Count == 0
            || !dataSet.Tables.Contains(Data.CustomerTable)
            || dataSet.Tables[Data.CustomerTable].Rows.Count == 0
            || !dataSet.Tables.Contains(Data.ShipToTable)
            || dataSet.Tables[Data.ShipToTable].Rows.Count == 0)
                throw new ArgumentException(Messages.InvalidInitialDataSetExceptionMessage);

            var mySetting = ConfigurationManager.ConnectionStrings[Constants.InsiteCommerce];
            Log(siteConnection, integrationJob, IntegrationJobLogType.Info, "ConnectionString: " + mySetting.ConnectionString);

            try
            {
                PonderosaService.Services.PonderosaService.PerformInitialization();
                Log(siteConnection, integrationJob, IntegrationJobLogType.Info,
                    "Initialized Ponderosa with configurationSection " + PonderosaService.Services.PonderosaService.GetConfigSectionName());
            }
            catch
            {
                Log(siteConnection, integrationJob, IntegrationJobLogType.Error,
                    "Failed to initialize Ponderosa with configurationSection " + PonderosaService.Services.PonderosaService.GetConfigSectionName());
                throw;
            }

            var customerOrder = dataSet.Tables[Data.CustomerOrderTable].Rows[0];
            
            dataSet = customerOrder[Constants.QuoteExpirationDate] == DBNull.Value 
                ? ExecuteStandardOrder(siteConnection, integrationJob, dataSet, mySetting.ConnectionString) 
                : ExecuteQuotedOrder(siteConnection, integrationJob, dataSet, mySetting.ConnectionString);

            return dataSet;
        }

        public DataSet ExecuteQuotedOrder(SiteConnection siteConnection, IntegrationJob integrationJob,
        DataSet dataSet, string connectionString)
        {
            var helper = new UtilityHelper();
            OrderHeader result;
           
            using (var svc = new OrderServices())
            {
                try
                {
                    var order = dataSet.Tables[Data.CustomerOrderTable].Rows[0];
                    var orderNumber = order[Data.ErpOrderNumberColumn].ToString();
                    var sessionId = Guid.NewGuid().ToString();
                    var ponderosaOrder = svc.LockOrder(orderNumber, sessionId);

                    helper.UpdateQuotedOrder(dataSet, ponderosaOrder);

                    result = svc.UpdateOrder(ponderosaOrder, sessionId);
                }
                finally
                {
                    PonderosaService.Services.PonderosaService.DisposeConnectionPool();
                }

                if (result != null)
                {
                    var row = dataSet.Tables[Data.CustomerOrderTable].Rows[0];
                    // Already set --> row[Constants.ERPOrderNumber] = result.OrderNo;
                    row[Constants.Status] = result.OrderStatus;
                }
            }

            Log(siteConnection, integrationJob, IntegrationJobLogType.Info,
                string.Format("Order Processing Result: {0}; OrderNumber: {1}; OrderStatus: {2}", result != null, 
                (result != null)? result.OrderNo : "Unknown", (result != null)? result.OrderStatus: "Unknown"));

            return dataSet;
        }

        public DataSet ExecuteStandardOrder(SiteConnection siteConnection, IntegrationJob integrationJob,
        DataSet dataSet, string connectionString)
        {

            var helper = new UtilityHelper();
            OrderHeader result;
           
            using (var svc = new OrderServices())
            {
                var orderHeader = helper.GetOrderHeader(dataSet, null);
                orderHeader.OrderDetail = helper.GetOrderDetail(dataSet);

                try
                {
                    result = svc.SubmitOrder(orderHeader);
                }
                finally
                {
                    PonderosaService.Services.PonderosaService.DisposeConnectionPool();
                }

                if (result != null)
                {
                    var row = dataSet.Tables[Data.CustomerOrderTable].Rows[0];
                    row[Constants.ERPOrderNumber] = result.OrderNo;
                    row[Constants.Status] = result.OrderStatus;
                }
            }

            Log(siteConnection, integrationJob, IntegrationJobLogType.Info,
                string.Format("Order Processing Result: {0}; OrderNumber: {1}; OrderStatus: {2}", result != null, 
                (result != null)? result.OrderNo : "Unknown", (result != null)? result.OrderStatus: "Unknown"));

            return dataSet;
        }

        private void Log(SiteConnection siteConnection, IntegrationJob integrationJob, IntegrationJobLogType logType, string message)
        {
            siteConnection.AddLogMessage(
                integrationJob.Id.ToString(),
                logType,
                message);
        }
    } 
}
