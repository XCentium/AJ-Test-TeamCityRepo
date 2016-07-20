using Insite.Core.WebApi;

namespace Morsco.Customizations.Lib.HistoryServices.Models
{
    public class GetShipmentsRequest : BaseParameter
    {
        public string ErpOrderNumber { get; set; }
    }
}
