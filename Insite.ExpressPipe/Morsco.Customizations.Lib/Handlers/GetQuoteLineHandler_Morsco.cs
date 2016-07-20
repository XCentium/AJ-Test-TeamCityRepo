using System;
using System.Linq;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Core.Providers;
using Insite.Core.Services;
using Insite.Core.Services.Handlers;
using Insite.Data.Entities;
using Insite.Rfq.Services.Handlers;
using Insite.Rfq.Services.Parameters;
using Insite.Rfq.Services.Results;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("GetQuoteLineHandler")]
    public class GetQuoteLineHandler_Morsco : QuoteHandlerBase<GetQuoteLineParameter, GetQuoteLineResult>
    {
        protected readonly IHandlerFactory HandlerFactory;

        public override int Order => 500;

        public GetQuoteLineHandler_Morsco(IHandlerFactory handlerFactory, IPricingServiceFactory pricingServiceFactory)
          : base(pricingServiceFactory)
        {
            HandlerFactory = handlerFactory;
        }

        public override GetQuoteLineResult Execute(IUnitOfWork unitOfWork, GetQuoteLineParameter parameter, GetQuoteLineResult result)
        {
            // We couldnt override the QuoteHandlerBase method (CanUserViewQuote()) so we created our own.
            if (!CanUserViewQuote_Morsco(unitOfWork, parameter.QuoteId))
                return CreateErrorServiceResult(result, SubCode.RfqAccessDenied, MessageProvider.Current.Rfq_AccessDenied);
            GetQuoteResult getQuoteResult = HandlerFactory.GetHandler<IHandler<GetQuoteParameter, GetQuoteResult>>().Execute(unitOfWork, new GetQuoteParameter(parameter.QuoteId), new GetQuoteResult());
            if (getQuoteResult.ResultCode != ResultCode.Success)
                return CreateErrorServiceResult(result, getQuoteResult.SubCode, getQuoteResult.Message);
            result = getQuoteResult.QuoteLineResults.FirstOrDefault(c => c.QuoteLineId == parameter.QuoteLineId);
            if (result != null)
            {
                result.QuoteId = parameter.QuoteId;
                result.QuoteLineId = parameter.QuoteLineId;
            }
            return NextHandler.Execute(unitOfWork, parameter, result);
        }

        private bool CanUserViewQuote_Morsco(IUnitOfWork unitOfWork, Guid quoteId)
        {
            UserProfile userProfile = SiteContext.Current.UserProfile;
            CustomerOrder quote = unitOfWork.GetRepository<CustomerOrder>().Get(quoteId);

            if (userProfile == null || quote == null || quote.InitiatedByUserProfile == null)
                return false;
            if (quote.InitiatedByUserProfile.Id.Equals(userProfile.Id)
                || quote.InitiatedByUserProfile.ApproverUserProfile != null && quote.InitiatedByUserProfile.ApproverUserProfile.Id.Equals(userProfile.Id))
                return true;
            //
            if (quote.CustomerNumber == SiteContext.Current.ShipTo.CustomerNumber &&
                (string.IsNullOrEmpty(SiteContext.Current.ShipTo.CustomerSequence) || quote.CustomerSequence == SiteContext.Current.ShipTo.CustomerSequence))
            {
                return true;
            }


            return false;
        }
    }
}
