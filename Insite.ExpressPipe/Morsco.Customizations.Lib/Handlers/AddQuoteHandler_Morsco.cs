using Insite.Common.Logging;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Core.Plugins.Application;
using Insite.Core.Plugins.Integration;
using Insite.Core.Services.Handlers;
using Insite.Data.Entities;
using Insite.Rfq.Services.Handlers;
using Insite.Rfq.Services.Parameters;
using Insite.Rfq.Services.Results;
using Insite.WebFramework;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using WebGrease.Css.Extensions;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("AddQuoteHandler_Morsco")]
    public class AddQuoteHandler_Morsco : QuoteHandlerBase<AddQuoteParameter, AddQuoteResult>
    {
        protected readonly IHandlerFactory HandlerFactory;
        protected readonly IIntegrationJobSchedulingService IntegrationJobSchedulingService;
        protected readonly IApplicationSettingProvider ApplicationSettingProvider;

        public AddQuoteHandler_Morsco(IHandlerFactory handlerFactory, IPricingServiceFactory pricingServiceFactory,
            IIntegrationJobSchedulingService integrationJobSchedulingService, IApplicationSettingProvider applicationSettingProvider)
            : base(pricingServiceFactory)
        {
            HandlerFactory = handlerFactory;
            IntegrationJobSchedulingService = integrationJobSchedulingService;
            ApplicationSettingProvider = applicationSettingProvider;
        }

        public override AddQuoteResult Execute(IUnitOfWork unitOfWork, AddQuoteParameter parameter, AddQuoteResult result)
        {
            SubmitQuoteToErp(result.QuoteResult.Cart.OrderNumber, unitOfWork);
            return result;
        }

        protected virtual void SubmitQuoteToErp(string orderNumber, IUnitOfWork unitOfWork)
        {
            try
            {
                if (ApplicationSettingProvider.GetOrCreateByName<bool>("ERP_SubmitQuotes"))
                {
                    var jobDefinition = unitOfWork.GetRepository<JobDefinition>().GetByNaturalKey("Quote Submit");
                    if ((jobDefinition == null) || (jobDefinition.JobDefinitionSteps.Count < 1))
                    {
                        LogHelper.ForType(typeof(ErrorHandler)).Error("IntegrationJob not found for name \"Quote Submit\"", "AddQuoteHandler_Morsco.SubmitQuoteToErp");
                    }
                    else
                    {
                        var parameters = jobDefinition.JobDefinitionSteps.SelectMany(x => x.JobDefinitionStepParameters).ToList();

                        if (!parameters.Any(x => x.Name.EqualsIgnoreCase("OrderNumber")))
                        {
                            LogHelper.ForType(typeof(ErrorHandler)).Error("Job Definition Steps does not have \"Order Number\"", "AddQuoteHandler_Morsco.SubmitQuoteToErp");
                        }

                        parameters.Where(x => x.Name.EqualsIgnoreCase("OrderNumber")).ForEach(x => x.Value = orderNumber);
                        var paramCollection = new Collection<JobDefinitionStepParameter>();
                        parameters.ForEach(x => paramCollection.Add(x));

                        unitOfWork.CommitTransaction(); //must commit or else CustomerOrder won't be found by WIS job
                        IntegrationJobSchedulingService.RunRealTimeIntegrationJob("Quote Submit", null, paramCollection, orderNumber);
                        unitOfWork.BeginTransaction();
                    }
                }
            }
            catch (Exception exception)
            {
                LogHelper.ForType(typeof(ErrorHandler)).Error(exception.Message, "AddQuoteHandler_Morsco.SubmitQuoteToErp");

            }
            finally
            {
                if (!unitOfWork.DataProvider.TransactionActive)
                {
                    unitOfWork.BeginTransaction();
                }
            }
        }

        public override int Order => 600;
    }
}

