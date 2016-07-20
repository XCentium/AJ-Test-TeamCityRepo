using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.ProductList.Interfaces;
using Morsco.Customizations.Lib.ProductList.Models;
using Insite.Core.Plugins.Utilities;

namespace Morsco.Customizations.Lib.ProductList.WebApi
{
    [RoutePrefix("api/morsco/productlist")]
    public class ProductListController : BaseApiController
    {
        private readonly IProductListService _productListService;


        public ProductListController(ICookieManager cookieManager, IProductListService productListService) 
            : base(cookieManager)
        {
            _productListService = productListService;
        }

        [ResponseType(typeof(ProductListResult)), Route("")]
        public async Task<IHttpActionResult> Get([FromUri] ProductListRequest rqst)
        {
            var m = await _productListService.GetProductList(rqst);
            return Ok(m);
        }

    }
}
