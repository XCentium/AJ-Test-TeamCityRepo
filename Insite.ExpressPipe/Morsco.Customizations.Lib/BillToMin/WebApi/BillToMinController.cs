using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.BillToMin.Interfaces;
using Morsco.Customizations.Lib.BillToMin.Models;
using Insite.Core.Plugins.Utilities;
using Insite.Customers.WebApi.V1.ApiModels;

namespace Morsco.Customizations.Lib.BillToMin.WebApi
{
    [RoutePrefix("api/morsco/BillToMin")]
    public class BillToMinController : BaseApiController
    {
        private readonly IBillToMinService _billToMinService;


        public BillToMinController(ICookieManager cookieManager, IBillToMinService billToMinService) 
            : base(cookieManager)
        {
            _billToMinService = billToMinService;
        }

        //Using standard model to keep using as close to Insite as possible in the UI, but not populating completely
        [ResponseType(typeof(BillToMinResult)), Route("")]
        public async Task<IHttpActionResult> Get([FromUri] BillToMinRequest rqst)
        {
            //Parameters are all optional, so request can be null
            if (rqst == null)
            {
                rqst = new BillToMinRequest();
            }
            var m = await _billToMinService.GetBillToMin(rqst);
            return Ok(m);
        }

    }
}
