using Insite.Core.WebApi.Interfaces;
using Insite.Rfq.Services.Results;
using Insite.Rfq.WebApi.V1.ApiModels;
using Insite.Rfq.WebApi.V1.Mappers.Interfaces;
using System.Net.Http;
using Insite.Core.Interfaces.Localization;
using Insite.Core.Plugins.Utilities;
using Insite.Rfq.WebApi.V1.Mappers;
using Insite.Core.Context;

namespace Morsco.Customizations.Lib.Mappers
{
    public class GetQuoteMapper_Morsco : GetQuoteMapper
    {
        public GetQuoteMapper_Morsco(ICurrencyFormatProvider currencyFormatProvider, IUrlHelper urlHelper, IGetQuoteLineMapper getQuoteLineMapper, 
            IObjectToObjectMapper objectToObjectMapper, ITranslationLocalizer translationLocalizer)
            : base(currencyFormatProvider, urlHelper, getQuoteLineMapper, objectToObjectMapper, translationLocalizer)
        { }

        public override QuoteModel MapResult(GetQuoteResult serviceResult, HttpRequestMessage request)
        {
            var destination = base.MapResult(serviceResult, request);

            destination.PoNumber = serviceResult.Cart.CustomerPO;

            foreach (var insiteProduct in destination.QuoteLineCollection)
            {
                insiteProduct.Pricing.ExtendedRegularPrice = insiteProduct.Pricing.RegularPrice * (decimal)insiteProduct.QtyOrdered;
                insiteProduct.Pricing.ExtendedActualPrice = insiteProduct.Pricing.RegularPrice * (decimal)insiteProduct.QtyOrdered;
                insiteProduct.Pricing.ExtendedRegularPriceDisplay = CurrencyFormatProvider.GetString(insiteProduct.Pricing.ExtendedRegularPrice, SiteContext.Current.Currency);
                insiteProduct.Pricing.ExtendedActualPrice = insiteProduct.Pricing.ActualPrice * (decimal)insiteProduct.QtyOrdered;
                insiteProduct.Pricing.ExtendedActualPriceDisplay = CurrencyFormatProvider.GetString(insiteProduct.Pricing.ExtendedActualPrice, SiteContext.Current.Currency);
                insiteProduct.Pricing.ActualPriceDisplay = CurrencyFormatProvider.GetString(insiteProduct.Pricing.ActualPrice, SiteContext.Current.Currency);
            }
            destination.Properties["PlacedByUserName"] = serviceResult.Cart.PlacedByUserName;
            return destination;
        }
    }
}
