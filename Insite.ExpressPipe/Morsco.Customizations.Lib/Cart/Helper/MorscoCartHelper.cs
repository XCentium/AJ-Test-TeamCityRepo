using System;
using System.Web.Configuration;
using Insite.Cart.Services.Handlers.Helpers;
using Insite.Catalog.Services;
using Insite.Common.Logging;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.Inventory;
using Insite.Core.Plugins.PromotionEngine;
using Insite.Core.Plugins.Shipping;
using Insite.Core.Plugins.Tax;
using Insite.Data.Entities;
using Morsco.PonderosaService.Services;

namespace Morsco.Customizations.Lib.Cart.Helper
{
    public class MorscoCartHelper : CartHelper
    {
        public MorscoCartHelper(Lazy<System.Web.HttpContextBase> httpContextBase, 
            Lazy<IProductService> productService, 
            Lazy<ITaxEngine> taxEngine,
            Lazy<IPromotionEngine> promotionEngine, 
            Lazy<IShippingEngine> shippingEngine,
            Lazy<IInventoryProvider> inventoryProvider,
            IOrderLineUtilities orderLineUtilities,
            ICustomerOrderUtilities customerOrderUtilities)
            : base(httpContextBase, productService, taxEngine, promotionEngine, shippingEngine, inventoryProvider, orderLineUtilities, customerOrderUtilities)
        { }

        public override void RecalculateTax(CustomerOrder customerOrder, IUnitOfWork unitOfWork)
        {
            if (SiteContext.Current.UserProfile != null)
            {
                if (customerOrder.Type != CustomerOrder.OrderType.Quote
                    //need a shipvia to calculate tax 
                    // -- also don't want to override the quote-to-order conversion's tax where there is no shipvia
                    && customerOrder.ShipVia != null
                    && !Boolean.Parse(WebConfigurationManager.AppSettings["Morsco.Ponderosa.Disabled"]))
                {
                    try
                    {
                        // For orders shipped to "new" addresses, the order has something like ISC99 as the customersequence.
                        // This is unknown to Eclipse.  So temporarily substitute in the user's current ship-to
                        int test;
                        Customer saveShipTo = null;
                        if (!string.IsNullOrWhiteSpace(customerOrder.ShipTo?.CustomerSequence) 
                            && !int.TryParse(customerOrder.ShipTo.CustomerSequence, out test) 
                            && SiteContext.Current.ShipTo != null)
                        {
                            saveShipTo = customerOrder.ShipTo;
                            customerOrder.ShipTo = SiteContext.Current.ShipTo;
                        }

                        using (var svc = new OrderServices())
                        {
                            customerOrder.StateTax = svc.CalculateTax(customerOrder, SiteContext.Current.ShipTo?.CustomerSequence);
                        }
                        foreach (var orderline in customerOrder.OrderLines)
                        {
                            OrderLineUtilities.CalculatePrice(orderline, true);
                        }

                        // Restore original ship to if appropriate.
                        if (saveShipTo != null)
                        {
                            customerOrder.ShipTo = saveShipTo;
                        }
                    }
                    catch(Exception ex)
                    {
                        LogHelper.For(this).Error(ex.ToString());
                    }
                    
                }
            }
        }
    }
}


