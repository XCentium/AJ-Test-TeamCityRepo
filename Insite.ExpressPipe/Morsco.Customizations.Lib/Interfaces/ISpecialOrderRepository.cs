using System.Collections.Generic;
using System.Net.Http;
using Morsco.Customizations.Lib.SpecialOrder.Models;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface ISpecialOrderRepository
    {
        SpecialOrderResult CreateSpecialOrder(SpecialOrderRequest sopRequest, HttpRequestMessage httpRequest);
        SpecialOrderResult CreateMultipleSpecialOrder(List<SpecialOrderRequest> sopRequest, HttpRequestMessage httpRequest);
        bool DeleteQuote(string quoteId, HttpRequestMessage httpRequest);
        bool UpdateQuote(UpdateQuoteRequest request, HttpRequestMessage httpRequest);
		bool RemoveQuoteLine(string quoteLineId, HttpRequestMessage httpRequest);
    }
}
