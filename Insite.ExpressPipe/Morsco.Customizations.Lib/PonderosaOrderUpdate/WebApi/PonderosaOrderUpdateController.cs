using System;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Insite.Common.Logging;
using Morsco.Customizations.Lib.PonderosaOrderUpdate.Interfaces;
using Morsco.Customizations.Lib.PonderosaOrderUpdate.Models;

namespace Morsco.Customizations.Lib.PonderosaOrderUpdate.WebApi
{
    [RoutePrefix("api/morsco/ponderosaorderupdate")]
    public class PonderosaOrderUpdateController : BaseApiController
    {
        private readonly IPonderosaOrderUpdateService _ponderosaOrderUpdateService;

        public PonderosaOrderUpdateController(ICookieManager cookieManager, IPonderosaOrderUpdateService ponderosaOrderUpdateService) 
            : base(cookieManager)
        {
            _ponderosaOrderUpdateService = ponderosaOrderUpdateService;
        }

        [ResponseType(typeof(bool)), Route("")]
        public async Task<IHttpActionResult> Get([FromUri] PonderosaOrderUpdateRequest rqst)
        {
            var m = await _ponderosaOrderUpdateService.GetOrderChanges();
            return Ok(m);
        }
    }
}
