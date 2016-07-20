using Insite.Catalog.WebApi.V1.ApiModels;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.BulkUpload.Interfaces;
using Morsco.Customizations.Lib.BulkUpload.Models;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;

namespace Morsco.Customizations.Lib.BulkUpload.WebApi
{
    [RoutePrefix("api/morsco/BulkUpload")]
    public class BulkUploadController : BaseApiController
    {
        private readonly IBulkUploadService _bulkUploadService;

        public BulkUploadController(ICookieManager cookieManager, IBulkUploadService bulkUploadService) 
            : base(cookieManager)
        {
            _bulkUploadService = bulkUploadService;
        }

        [ResponseType(typeof(ProductCollectionModel)), Route("GetBulkUploadProducts")]
        public async Task<IHttpActionResult> Get([FromUri] BulkUploadRequest rqst)
        {
            var m = await _bulkUploadService.GetBulkUploadProducts(rqst, Request);
            return Ok(m);
        }		
    }
}
