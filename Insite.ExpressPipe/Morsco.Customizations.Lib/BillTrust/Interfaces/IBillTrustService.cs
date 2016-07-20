using Morsco.Customizations.Lib.BillTrust.Models;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.BillTrust.Interfaces
{
    public interface IBillTrustService
    {
        Task<string> GetInvoiceUrl(BillTrustInvoiceRequest request);
        Task<string> GetSSOUrl(BillTrustSSORequest request);
    }
}