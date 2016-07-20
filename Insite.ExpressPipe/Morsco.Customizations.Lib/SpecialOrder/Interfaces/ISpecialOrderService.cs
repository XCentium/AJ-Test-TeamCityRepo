using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using Morsco.Customizations.Lib.SpecialOrder.Models;

namespace Morsco.Customizations.Lib.SpecialOrder.Interfaces
{
    public interface ISpecialOrderService
    {
        Task<SpecialOrderResult> CreateSpecialOrder(SpecialOrderRequest request, HttpRequestMessage httpRequest);
        Task<SpecialOrderResult> CreateMultipleSpecialOrder(List<SpecialOrderRequest> request, HttpRequestMessage httpRequest);
        Task<bool> DeleteQuote(string quoteId, HttpRequestMessage httpRequest);
        Task<bool> UpdateQuote(UpdateQuoteRequest request, HttpRequestMessage httpRequest);
		Task<bool> RemoveQuoteLine(string quoteLineId, HttpRequestMessage httpRequest);
    }
}

