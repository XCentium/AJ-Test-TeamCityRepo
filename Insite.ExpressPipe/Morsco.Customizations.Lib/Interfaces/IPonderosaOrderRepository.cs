using System.Collections.Generic;
using Morsco.Customizations.Lib.Ponderosa.Models;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface IPonderosaOrderRepository
    {
        List<Dictionary<string, object>>  GetOrder(string eclipseOrderId);
        List<Dictionary<string, object>>  UpdateQuote(UpdateQuoteRequest request);
    }
}
