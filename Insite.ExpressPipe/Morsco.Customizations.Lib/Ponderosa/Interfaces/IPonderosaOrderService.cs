using System.Collections.Generic;
using System.Threading.Tasks;
using Morsco.Customizations.Lib.Ponderosa.Models;

namespace Morsco.Customizations.Lib.Ponderosa.Interfaces
{
    public interface IPonderosaOrderService
    {
        Task<List<Dictionary<string, object>>> GetOrder(OrderRequest request);
        Task<List<Dictionary<string, object>>> UpdateQuote(UpdateQuoteRequest request);
    }
}

