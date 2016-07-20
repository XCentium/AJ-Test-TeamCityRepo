using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.ProductHistory.Interfaces;
using Morsco.Customizations.Lib.ProductHistory.Models;
using Insite.Core.Plugins.Utilities;

namespace Morsco.Customizations.Lib.ProductHistory.WebApi
{
    [RoutePrefix("api/morsco/ProductHistory")]
    public class ProductHistoryController : BaseApiController
    {
        private readonly IProductHistoryService _productHistoryService;

        public ProductHistoryController(ICookieManager cookieManager, IProductHistoryService productHistoryService) 
            : base(cookieManager)
        {
            _productHistoryService = productHistoryService;
        }

        [ResponseType(typeof(PurchasedProductsResult)), Route("getPurchasedProducts")]
        public async Task<IHttpActionResult> Get([FromUri] PurchasedProductsRequest rqst)
        {
            var m = await _productHistoryService.GetPurchasedProducts(rqst, Request);
            return Ok(m);
        }

    }
}
