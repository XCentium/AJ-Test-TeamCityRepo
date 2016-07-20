using Insite.Core.WebApi;
using Morsco.Customizations.Lib.CreditCardIntegration.Interfaces;
using Morsco.Customizations.Lib.CreditCardIntegration.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.Plugins.Utilities;

namespace Morsco.Customizations.Lib.CreditCardIntegration.WebApi
{
    [RoutePrefix("api/morsco/creditcard")]
    public class CreditCardController : BaseApiController
    {
		private readonly ICreditCardService _creditCardService;

		public CreditCardController(ICookieManager cookieManager, ICreditCardService creditCardService) 
            : base(cookieManager)
		{
			_creditCardService = creditCardService;
        }


		[ResponseType(typeof(CreditCardsResult)), Route("getcards")]
        public async Task<IHttpActionResult> Get()
		{
		    var m = await _creditCardService.GetUserCardList();
            return Ok(m);
        }

		[ResponseType(typeof(CreditCardInitiateResult)), Route("initiatenewcard")]
		public async Task<IHttpActionResult> Initiate([FromUri] AddCardRequest addCardRequest)
		{
            IEnumerable<string> headerValues;
            var origin = string.Empty;
            var keyFound = Request.Headers.TryGetValues("Origin", out headerValues);
            if (keyFound)
            {
                origin = headerValues.FirstOrDefault();
            }
		    var m = await _creditCardService.InitiateAddNewCreditCard(addCardRequest, origin);
			return Ok(m);
		}

		[ResponseType(typeof(CreditCardsResult)), Route("finalizenewcard")]
		public async Task<IHttpActionResult> Finalize([FromBody] Dictionary<string, object> setupResult)
		{
		    var m = await _creditCardService.FinalizeNewCreditCard(setupResult);
			return Ok(m);
		}

		[ResponseType(typeof(CreditCardsResult)), Route("deletecard")]
		public async Task<IHttpActionResult> Delete([FromUri] string elementAccountId)
		{
		    var m = await _creditCardService.DeleteCardFromContact(elementAccountId);
			return Ok(m);
		}

        [ResponseType(typeof(CreditCardsResult)), Route("selectcard")]
		public async Task<IHttpActionResult> Select([FromUri] string elementAccountId)
        {
            var m = await _creditCardService.StoreMostRecentlyUsedCard(elementAccountId);
			return Ok(m);
		}
	}
}
