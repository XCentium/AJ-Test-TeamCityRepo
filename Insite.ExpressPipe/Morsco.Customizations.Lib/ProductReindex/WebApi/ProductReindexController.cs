using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
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
            var m = await _productReindexService.Reindex(rqst);
            return Ok(m);
        }
    }

}