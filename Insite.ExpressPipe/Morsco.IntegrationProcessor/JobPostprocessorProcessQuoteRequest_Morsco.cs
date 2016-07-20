using Insite.Core.Interfaces.Dependency;
using Morsco.IntegrationProcessor.Helper;
using Morsco.IntegrationProcessor.Repositories;
using System.Data;
using Insite.Core.Interfaces.Data;
using Insite.WIS.Broker.Plugins.Constants;
using Insite.Integration.WebService.PlugIns.Postprocessor;

namespace Morsco.IntegrationProcessor
{
    /// <summary>
    /// This class does the WIS Postprocessing for Quote Requests.
    /// </summary>
    [DependencyName("ProcessQuoteRequestMorsco")]
    public class JobPostprocessorProcessQuoteRequest_Morsco : JobPostprocessorProcessSubmitResponse
    {
        public JobPostprocessorProcessQuoteRequest_Morsco(IUnitOfWorkFactory unitOfWorkFactory)
            : base(unitOfWorkFactory){ }
        
        protected override void ProcessOrderSubmit(DataSet dataSet)
        {
            if (dataSet != null
                && dataSet.Tables.Contains(Data.CustomerOrderTable)
                && dataSet.Tables[Data.CustomerOrderTable].Rows.Count > 0)
            {
                var customerOrder = dataSet.Tables[Data.CustomerOrderTable].Rows[0];
                var erpOrderNumber = customerOrder[Constants.ERPOrderNumber].ToString();
                var webOrderNumber = customerOrder[Constants.OrderNumber].ToString();
                var orderedBy = customerOrder[Constants.PlacedByUserName].ToString();
                var companyName = customerOrder[Constants.STCompanyName].ToString();
                
                // force OrderHistory to be made prior to updating
                UnitOfWork.Save();

                var repo = new DataRepository();
                repo.UpdateEclipseQuoteRequestDetails(erpOrderNumber,webOrderNumber, orderedBy, companyName);
            }
        }
    }
}