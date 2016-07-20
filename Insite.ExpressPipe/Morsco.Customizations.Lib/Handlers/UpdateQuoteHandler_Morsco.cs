using Insite.Core.Services.Handlers;
using Insite.Rfq.Services.Parameters;
using Insite.Rfq.Services.Results;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Rfq.Services.Handlers;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("UpdateQuoteHandler")]
    public class UpdateQuoteHandler_Morsco : UpdateQuoteHandler
    {
        public override int Order => 620;

        public UpdateQuoteHandler_Morsco(IHandlerFactory handlerFactory, IPricingServiceFactory pricingServiceFactory) 
            : base(handlerFactory, pricingServiceFactory)
        {
        }

        public override UpdateQuoteResult Execute(IUnitOfWork unitOfWork, UpdateQuoteParameter parameter, UpdateQuoteResult result)
        {
            var order = result.QuoteResult.Cart;

            if (order != null)
            {
                order.SetProperty("CompanyName", parameter.JobName);

                //CustomerSequence is not provided in the QuoteCollectionHandler
                if (order.ShipTo != null)
                {
                    order.SetProperty("CustomerSequence",
                        !string.IsNullOrWhiteSpace(order.ShipTo.CustomerSequence) ? order.ShipTo.CustomerSequence : order.ShipTo.CustomerNumber);
                }
            }
            return NextHandler.Execute(unitOfWork, parameter, result);
        }
    }
}
