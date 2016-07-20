using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Configuration;
using Insite.Common.Logging;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.Utilities;
using Insite.Data.Entities;
using Insite.Plugins.Pricing;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Services;

namespace Morsco.Customizations.Lib.PricingService
{
    [DependencyName("MorscoPricing")]
    public class PricingServiceMorsco : PricingServiceBase
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public PricingServiceMorsco(IUnitOfWorkFactory unitOfWorkFactory, ICurrencyFormatProvider currencyFormatProvider, IOrderLineUtilities orderLineUtilities,
            IPricingServiceFactory pricingServiceFactory)
            : base(unitOfWorkFactory, currencyFormatProvider, orderLineUtilities, pricingServiceFactory)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        /// <summary>
        /// Calculate the price of a product.
        /// </summary>
        /// <param name="pricingServiceParameter">The <see cref="PricingServiceParameter"/> holding information for how to calculate the price</param>
        /// <returns><see cref="PricingServiceResult"/> with the calculated prices.</returns>
        public override PricingServiceResult ProcessPriceCalculation(PricingServiceParameter pricingServiceParameter)
        {
            //Insite 4.2 Note:
            //We appear to be called from CalculatePrice.  That initializes a lot of stuff we need

            if (pricingServiceParameter.ProductId == null)
            {
                throw new ArgumentNullException(nameof(pricingServiceParameter), "pricingServiceParameter.ProductId is null");
            }

            bool isQuote = OrderLine != null && OrderLine.CustomerOrder.Type.EqualsIgnoreCase(CustomerOrder.OrderType.Quote);

            if (!isQuote && Boolean.Parse(WebConfigurationManager.AppSettings["Morsco.Ponderosa.Disabled"]) == false && pricingServiceParameter.OrderLineId == null)
            {
                //If we've chosen a "new" address, it will have an ISC# for CustomerSequence.  That as a customersequence will cause Eclipse to fail.
                //Therefore revert back to the SiteContext.Current.ShipTo, which will have the user's logged-in context
                int test;
                if(string.IsNullOrWhiteSpace(ShipTo?.CustomerSequence) && !int.TryParse(ShipTo?.CustomerSequence, out test))
                {
                    ShipTo = SiteContext.Current.ShipTo;
                }

                var priceAvailList = new List<PriceAvailability>();
                var productIDs = new List<int>{Convert.ToInt32(Product.ErpNumber)};

                try
                {
                    using (var svc = new OrderServices())
                    {
                        //create a context from the pricingServiceParameter
                        var unitOfWork = _unitOfWorkFactory.GetUnitOfWork();
                        priceAvailList = svc.GetPriceAvailability(productIDs, BillTo, ShipTo, unitOfWork);
                    }
                }
                catch (Exception ex)
                {
                    LogHelper.For(this).Error("Exception", ex);
                }

                foreach (var priceAvail in priceAvailList
                    .Where(x => Product.CustomProperties.Any(y => y.Name.Equals("CatalogWebSite", StringComparison.CurrentCultureIgnoreCase)
                                  && y.Value.Split('.').Contains(SiteContext.Current.Website.Name))
                        && x.UnitPrice.HasValue))
                    {
                        Product.BasicListPrice = priceAvail.UnitPrice.Value;
                    }
                }

            var price = isQuote ? OrderLine.ActualPrice : Product.BasicListPrice;
            
            var pricingServiceResult = new PricingServiceResult
            {
                RegularPrice = price,
                ActualPrice = price,
            };

            AddDisplayPrices(pricingServiceResult, GetCurrency(pricingServiceParameter.CurrencyCode));
            AddExtendedPrices(pricingServiceParameter, pricingServiceResult, GetCurrency(pricingServiceParameter.CurrencyCode));

            return pricingServiceResult;
        }
    }
}