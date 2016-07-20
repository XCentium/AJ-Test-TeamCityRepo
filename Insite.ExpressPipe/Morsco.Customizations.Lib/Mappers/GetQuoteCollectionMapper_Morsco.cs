using System.Linq;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi.Interfaces;
using Insite.Rfq.Services.Parameters;
using Insite.Rfq.Services.Results;
using Insite.Rfq.WebApi.V1.ApiModels;
using Insite.Rfq.WebApi.V1.Mappers;

using System.Net.Http;
using Insite.Core.Context;
using Insite.Plugins.EntityUtilities;

namespace Morsco.Customizations.Lib.Mappers
{
    public class GetQuoteCollectionMapper_Morsco : GetQuoteCollectionMapper
    {
        private readonly CustomerOrderUtilities _customerOrderUtilities;
        private readonly ICurrencyFormatProvider _currencyFormatProvider;

        public GetQuoteCollectionMapper_Morsco(IObjectToObjectMapper objectToObjectMapper, IUrlHelper urlHelper, CustomerOrderUtilities customerOrderUtilities,
            ICurrencyFormatProvider currencyFormatProvider)
            : base(objectToObjectMapper, urlHelper)
        {
            _customerOrderUtilities = customerOrderUtilities;
            _currencyFormatProvider = currencyFormatProvider;
        }

        public override GetQuoteCollectionParameter MapParameter(QuoteCollectionParameter apiParameter, HttpRequestMessage request)
        {
            GetQuoteCollectionParameter destination = base.MapParameter(apiParameter, request);

            string sort = Insite.Core.WebApi.Extensions.HttpRequestMessageExtensions.GetQueryString(request, "sort") ?? string.Empty;
            destination.Sort = sort;
            return destination;
        }

        public override QuoteCollectionModel MapResult(GetQuoteCollectionResult serviceResult, HttpRequestMessage request)
        {
            QuoteCollectionModel quoteCollectionModel = base.MapResult(serviceResult, request);

            foreach (var quote in quoteCollectionModel.Quotes)
            {
                var origQuote = serviceResult.Quotes.FirstOrDefault(q => q.Id.ToString() == quote.Id);
                if (origQuote != null)
                {
                    quote.OrderGrandTotal = _customerOrderUtilities.GetOrderGrandTotal(origQuote);
                    quote.OrderGrandTotalDisplay = _currencyFormatProvider.GetString(quote.OrderGrandTotal, SiteContext.Current.Currency);

                    quote.PoNumber = origQuote.CustomerPO;

                    var value = origQuote.GetProperty("CompanyName", string.Empty);
                    quote.Properties["PlacedByUserName"] = origQuote.PlacedByUserName;
                    quote.Properties["CompanyName"] = value;
                    quote.Properties["ModifiedOn"] = origQuote.ModifiedOn.ToString("M/d/yy");
                    quote.Properties["CustomerSequence"] = origQuote.GetProperty("CustomerSequence", string.Empty);

                }
            }
            return quoteCollectionModel;
        }
    }
}
