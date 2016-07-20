using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Services;
using Morsco.Customizations.Lib.BillTrust.Helpers;
using Morsco.Customizations.Lib.BillTrust.Interfaces;
using Morsco.Customizations.Lib.BillTrust.Models;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.BillTrust.Services
{
    public class BillTrustService : ServiceBase, IBillTrustService, IInterceptable, IDependency
    {
        public BillTrustService(IUnitOfWorkFactory unitOfWorkFactory)
            : base(unitOfWorkFactory)
        {
        }

        public async Task<string> GetInvoiceUrl(BillTrustInvoiceRequest request)
        {
            var result = "";

            result = await Task.FromResult<string>(
                BillTrustHelper.GetInvoices(request.AccountNumber, request.Invoices)
                );
            
            return result;
        }

        public async Task<string> GetSSOUrl(BillTrustSSORequest request)
        {
            var result = "";

            result = await Task.FromResult<string>(
                BillTrustHelper.GenerateSSOUrl(request.CustomerNumber, request.Email, request.UserName)
                );

            return result;
        }
    }
}
