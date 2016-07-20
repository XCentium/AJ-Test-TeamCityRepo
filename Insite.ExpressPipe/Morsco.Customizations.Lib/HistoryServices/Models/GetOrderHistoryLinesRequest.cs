using Insite.Core.WebApi;

namespace Morsco.Customizations.Lib.HistoryServices.Models
{
    public class GetOrderHistoryLinesRequest : BaseParameter
    {
        public string ErpOrderNumber { get; set; }
    }
}
