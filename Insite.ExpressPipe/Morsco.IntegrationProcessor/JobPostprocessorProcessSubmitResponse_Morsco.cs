using System.Data;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Integration.WebService.Interfaces;
using Insite.Integration.WebService.PlugIns.Postprocessor;
using Insite.WIS.Broker.Plugins.Constants;
using Morsco.IntegrationProcessor.Helper;
using Morsco.IntegrationProcessor.Repositories;

namespace Morsco.IntegrationProcessor
{
    [DependencyName("ProcessSubmitResponseMorsco")]
    public class JobPostprocessorProcessSubmitResponse_Morsco : JobPostprocessorProcessSubmitResponse, IJobPostprocessor, IDependency
    {
        public JobPostprocessorProcessSubmitResponse_Morsco(IUnitOfWorkFactory unitOfWorkFactory):base(unitOfWorkFactory)
        { }


        protected override void ProcessOrderSubmit(DataSet dataSet)
        {
            if (dataSet != null
                && dataSet.Tables.Contains(Data.CustomerOrderTable)
                && dataSet.Tables[Data.CustomerOrderTable].Rows.Count > 0)
            {
                var customerOrder = dataSet.Tables[Data.CustomerOrderTable].Rows[0];
                var erpOrderNumber = customerOrder[Constants.ERPOrderNumber].ToString();
                var erpOrderStatus = customerOrder[Constants.Status].ToString();
                var webOrderNumber = customerOrder[Constants.OrderNumber].ToString();
                var orderedBy = customerOrder[Constants.PlacedByUserName].ToString();
                var companyName = customerOrder[Constants.STCompanyName].ToString();
                var shipDate = $"{customerOrder[Constants.RequestedShipDate]:yyyy-MM-dd}";

                // force OrderHistory to be made prior to updating
                UnitOfWork.Save();

                var repo = new DataRepository();
                repo.UpdateEclipseOrderResponseDetails(erpOrderNumber, erpOrderStatus, webOrderNumber,
                    orderedBy, companyName, shipDate);
            }
        }
    }
}