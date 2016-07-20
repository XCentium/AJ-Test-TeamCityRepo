using System;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.Registration.Interfaces;
using Morsco.Customizations.Lib.Registration.Models;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.Plugins.Utilities;

namespace Morsco.Customizations.Lib.Registration.WebApi
{
    [RoutePrefix("api/morsco/registration")]
    public class RegistrationController : BaseApiController
    {
        private readonly IRegistrationService _registrationService;

        public RegistrationController(ICookieManager cookieManager, IRegistrationService registrationService) 
            : base(cookieManager)
        {
            _registrationService = registrationService;
        }

        [ResponseType(typeof(SearchCustomerResult)), Route("searchcustomer")]
        public async Task<IHttpActionResult> Get([FromUri] SearchCustomerRequest rqst)
        {
            var m = await _registrationService.SearchCustomer(rqst);
            return Ok(m);
        }

        [ResponseType(typeof(GetWarehousesResult)), Route("getwarehouses")]
        public async Task<IHttpActionResult> Get()
        {
            var m = await _registrationService.GetWarehouses();
            return Ok(m);
        }

        [ResponseType(typeof(Boolean)), Route("useremailexists")]
        public async Task<IHttpActionResult> Get(string userEmail)
        {
            var m = await _registrationService.UserEmailExists(userEmail);
            return Ok(m);
        }
    }
}
