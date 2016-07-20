using Insite.Cart.Services;
using Insite.Cart.Services.Parameters;
using Insite.Cart.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Core.Providers;
using Insite.Core.Services;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Message.Services;
using Insite.Message.Services.Dtos;
using Insite.Message.Services.Parameters;
using Insite.Message.Services.Results;
using Insite.Rfq.Services.Parameters;
using Insite.Rfq.Services.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using Insite.Rfq.Services.Handlers;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("GetQuoteHandler")]
    public class GetQuoteHandler_Morsco : GetQuoteHandler
    {
        public override int Order
        {
            get
            {
                return 500;
            }
        }

        public GetQuoteHandler_Morsco(ICartService cartService, IMessageService messageService, IPricingServiceFactory pricingServiceFactory, ISalespersonRepository salespersonRepository)
            : base(cartService, messageService, pricingServiceFactory, salespersonRepository)
        {
        }

        public override GetQuoteResult Execute(IUnitOfWork unitOfWork, GetQuoteParameter parameter, GetQuoteResult result)
        {
            // We couldnt override the QuoteHandlerBase method (CanUserViewQuote()) so we created our own.
            if (!this.CanUserViewQuote_Morsco(unitOfWork, parameter.QuoteId))
                return this.CreateErrorServiceResult<GetQuoteResult>(result, SubCode.RfqAccessDenied, MessageProvider.Current.Rfq_AccessDenied);
            ICartService cartService = this.CartService;
            GetCartParameter parameter1 = new GetCartParameter();
            parameter1.CartId = new Guid?(parameter.QuoteId);
            int num1 = 1;
            parameter1.GetCartLineResults = num1 != 0;
            int num2 = 1;
            parameter1.GetCostCodes = num2 != 0;
            int num3 = 1;
            parameter1.GetValidation = num3 != 0;
            int num4 = parameter.GetShipTos ? 1 : 0;
            parameter1.GetShipTos = num4 != 0;
            GetCartResult cart = cartService.GetCart(parameter1);
            result = this.ObjectToObjectMapper.Map<GetCartResult, GetQuoteResult>(cart);
            if (cart.ResultCode != ResultCode.Success || result == null || result.Cart.Type != "Quote" && result.Cart.Type != "Job")
                return this.CreateErrorServiceResult<GetQuoteResult>(result, SubCode.CartServiceCartNotFound, MessageProvider.Current.Rfq_NotFound);
            GetQuoteResult getQuoteResult = result;
            int num5 = !getQuoteResult.IsSalesperson ? 0 : (result.Cart.Status != "QuoteProposed" ? 1 : 0);
            getQuoteResult.IsEditable = num5 != 0;
            result.MessageCollection = this.GetMessageCollection(unitOfWork, result.Cart.Id);
            Salesperson byUserProfile = unitOfWork.GetTypedRepository<ISalespersonRepository>().GetByUserProfile(SiteContext.Current.UserProfile.Id);
            if (byUserProfile != null)
                result.CalculationMethods = this.GetCalculationMethods(unitOfWork, byUserProfile);
            this.GetQuoteLineResultCollection(unitOfWork, result);
            return this.NextHandler.Execute(unitOfWork, parameter, result);
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
