using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.BillTrust.Interfaces;
using Morsco.Customizations.Lib.BillTrust.Models;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;

namespace Morsco.Customizations.Lib.BillTrust.WebApi
{
    [RoutePrefix("api/morsco/billtrust")]
    public class BillTrustController : BaseApiController
    {
        private readonly IBillTrustService _billTrustService;

        public BillTrustController(ICookieManager cookieManager, IBillTrustService billTrustService) 
            : base(cookieManager)
        {
            _billTrustService = billTrustService;
        }

        [ResponseType(typeof(string)), Route("getssourl")]
        public async Task<IHttpActionResult> Get([FromUri] BillTrustSSORequest rqst)
        {
            var m = await _billTrustService.GetSSOUrl(rqst);
            return Ok(m);
        }

        [ResponseType(typeof(string)), Route("getinvoiceurl")]
        public async Task<IHttpActionResult> Get([FromUri] BillTrustInvoiceRequest rqst)
        {
            var m = await _billTrustService.GetInvoiceUrl(rqst);
            return Ok(m);
        }
    }
}
