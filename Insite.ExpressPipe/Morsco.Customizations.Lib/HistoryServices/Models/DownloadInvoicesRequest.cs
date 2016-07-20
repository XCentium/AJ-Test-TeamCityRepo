using Insite.Core.WebApi;

namespace Morsco.Customizations.Lib.HistoryServices.Models
{
    public class DownloadInvoicesRequest : BaseParameter
    {
        public bool List { get; set; }
        public string[] SelectedInvoices { get; set; }
    }
}
