using System;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Common.Logging;
using Insite.Core.Context;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Microsoft.Ajax.Utilities;
using Morsco.Customizations.Lib.ProductReindex.Interfaces;
using Morsco.Customizations.Lib.ProductReindex.Models;

namespace Morsco.Customizations.Lib.ProductReindex.WebApi
{
    [RoutePrefix("api/morsco/productreindex")]
    public class ProductReindexController : BaseApiController
    {
        private readonly IProductReindexService _productReindexService;
        
        public ProductReindexController(ICookieManager cookieManager, IProductReindexService productReindexService)
            : base(cookieManager)
        {
            _productReindexService = productReindexService;
        }

        [ResponseType(typeof(ProductReindexResult)), Route("")]
        public async Task<IHttpActionResult> Get([FromUri] ProductReindexRequest rqst)
        {
            LogHelper.For(this).Info($"Reindex request beginning.  From: {System.Web.HttpContext.Current.Request.UserHostAddress} / {System.Web.HttpContext.Current.Request.UserHostName}");
            var m = await _productReindexService.Reindex(rqst);
            LogHelper.For(this).Info($"Reindex request completed");
            return Ok(m);
        }
    }

}