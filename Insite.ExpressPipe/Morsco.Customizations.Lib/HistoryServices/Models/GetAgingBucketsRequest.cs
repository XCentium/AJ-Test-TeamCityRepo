using Insite.Core.WebApi;

namespace Morsco.Customizations.Lib.HistoryServices.Models
{
    public class GetAgingBucketsRequest : BaseParameter
    {
        public string CustomerNumber { get; set; }
        public string CustomerSequence { get; set; }
    }
}
