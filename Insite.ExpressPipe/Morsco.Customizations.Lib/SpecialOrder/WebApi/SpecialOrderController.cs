using System;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.SpecialOrder.Models;
using Morsco.Customizations.Lib.SpecialOrder.Interfaces;
using System.Collections.Generic;
using Insite.Core.Plugins.Utilities;

namespace Morsco.Customizations.Lib.SpecialOrder.WebApi
{
    [RoutePrefix("api/morsco/SpecialOrder")]
    public class SpecialOrderController : BaseApiController
    {
        private readonly ISpecialOrderService _specialOrderService;

        public SpecialOrderController(ICookieManager cookieManager, ISpecialOrderService specialOrderService) 
            : base(cookieManager)
        {
            _specialOrderService = specialOrderService;
        }

        [ResponseType(typeof(SpecialOrderResult)), Route("createSpecialOrder")]
        public async Task<IHttpActionResult> Get([FromUri] SpecialOrderRequest rqst)
        {
            var m = await _specialOrderService.CreateSpecialOrder(rqst, Request);
            return Ok(m);
        }

        [ResponseType(typeof(SpecialOrderResult)), Route("createMultipleSpecialOrder")]
        public async Task<IHttpActionResult> Post([FromBody] List<SpecialOrderRequest> rqst)
        {
            var m = await _specialOrderService.CreateMultipleSpecialOrder(rqst, Request);
            return Ok(m);
        }

        [ResponseType(typeof(bool)), Route("deleteQuote")]
        public async Task<IHttpActionResult> Post([FromUri] string quoteId)
        {
            var m = await _specialOrderService.DeleteQuote(quoteId, Request);
            return Ok(m);
        }

        [ResponseType(typeof(bool)), Route("updateQuote")]
        public async Task<IHttpActionResult> Post([FromUri] UpdateQuoteRequest rqst)
        {
            var m = await _specialOrderService.UpdateQuote(rqst, Request);
            return Ok(m);
        }
		[ResponseType(typeof(bool)), Route("removeQuoteLine")]
		public async Task<IHttpActionResult> Remove([FromUri] string quoteLineId)
		{
		    var m = await _specialOrderService.RemoveQuoteLine(quoteLineId, Request);
			return Ok(m);
		}
    }
}
