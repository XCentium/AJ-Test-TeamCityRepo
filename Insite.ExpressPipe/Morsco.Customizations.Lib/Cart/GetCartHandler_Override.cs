using System;
using Insite.Cart.Services.Handlers;
using Insite.Cart.Services.Handlers.Helpers;
using Insite.Cart.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;
using Insite.Core.Interfaces.Plugins.Security;
using Insite.Core.Plugins.Cart;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.Shipping;
using Insite.Core.Translation;
using Insite.Customers.Services;
using Insite.Data.Entities;
using Insite.Payments.Services;
using Insite.WebFramework.Routing;

namespace Morsco.Customizations.Lib.Cart
{
    [DependencyName("GetCartHandler")]
    public class GetCartHandler_Override : GetCartHandler
    {

        public GetCartHandler_Override(Lazy<IProductUtilities> productUtilities, ICartOrderProviderFactory cartOrderProviderFactory, 
            Lazy<ICustomerOrderUtilities> customerOrderUtilities, Lazy<ICustomerService> customerService, Lazy<IPaymentService> paymentService, 
            Lazy<IShippingEngine> shippingEngine, Lazy<IUrlProvider> urlProvider, Lazy<ICartHelper> cartHelper, IOrderLineUtilities orderLineUtilities, 
            IAuthenticationService authenticationService, Lazy<ITranslationLocalizer> translationLocalizer, Lazy<IEntityTranslationService> entityTranslationService)
           : base(productUtilities, cartOrderProviderFactory, customerOrderUtilities, customerService, paymentService, shippingEngine, urlProvider, cartHelper, orderLineUtilities, 
                 authenticationService, translationLocalizer, entityTranslationService)
        {}

        protected override bool CartAvailableToUser(Guid? cartId, CustomerOrder customerOrder, GetCartResult result)
        {
            UserProfile userProfile = SiteContext.Current.UserProfile;
            if (!cartId.HasValue)
                return true;
            if (userProfile == null || customerOrder.InitiatedByUserProfile == null)
                return false;
            if (customerOrder.InitiatedByUserProfile.Id.Equals(userProfile.Id) 
                || customerOrder.InitiatedByUserProfile.ApproverUserProfile != null && customerOrder.InitiatedByUserProfile.ApproverUserProfile.Id.Equals(userProfile.Id))
                return true;
			//
			if (customerOrder.CustomerNumber == SiteContext.Current.ShipTo.CustomerNumber &&
                (string.IsNullOrEmpty(SiteContext.Current.ShipTo.CustomerSequence) || customerOrder.CustomerSequence == SiteContext.Current.ShipTo.CustomerSequence))
            {
                return true;
            }

            return false;
        }
    }
}
