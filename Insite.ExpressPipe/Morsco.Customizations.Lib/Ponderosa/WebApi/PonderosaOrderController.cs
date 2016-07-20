using Insite.Core.WebApi;
using Morsco.Customizations.Lib.Ponderosa.Interfaces;
using Morsco.Customizations.Lib.Ponderosa.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.Plugins.Utilities;


namespace Morsco.Customizations.Lib.Ponderosa.WebApi
{
    [RoutePrefix("api/morsco/PonderosaOrder")]
    public class PonderosaOrderController : BaseApiController
    {
        private readonly IPonderosaOrderService _ponderosaOrderService;

        public PonderosaOrderController(ICookieManager cookieManager, IPonderosaOrderService ponderosaOrderService) 
            : base(cookieManager)
        {
            _ponderosaOrderService = ponderosaOrderService;
        }

        [ResponseType(typeof(List<Dictionary<string, object>>)), Route("getEclipseOrder")]
        public async Task<IHttpActionResult> Get([FromUri] OrderRequest rqst)
        {
            var m = await _ponderosaOrderService.GetOrder(rqst);
            return Ok(m);
        }
    
        [ResponseType(typeof(List<Dictionary<string, object>>)), Route("updateQuote")]
        public async Task<IHttpActionResult> Put([FromUri] UpdateQuoteRequest rqst)
        {
            var m = await _ponderosaOrderService.UpdateQuote(rqst);
            return Ok(m);
        }
    }
}
