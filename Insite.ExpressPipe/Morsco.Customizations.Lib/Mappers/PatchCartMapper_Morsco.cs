using System.Net.Http;
using Insite.Cart.Services.Parameters;
using Insite.Cart.Services.Results;
using Insite.Cart.WebApi.V1.ApiModels;
using Insite.Cart.WebApi.V1.Mappers;
using Insite.Cart.WebApi.V1.Mappers.Interfaces;
using Insite.Core.Context;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.WebApi.Interfaces;

namespace Morsco.Customizations.Lib.Mappers
{
    public class PatchCartMapper_Morsco : PatchCartMapper, IPatchCartMapper, IWebApiMapper<CartModel, UpdateCartParameter, UpdateCartResult, CartModel>, ISingletonLifetime, IDependency
    {

        public PatchCartMapper_Morsco(IGetCartMapper getCartMapper): base(getCartMapper)
        {
        }

        /// <summary>
        /// The purpose of this override is to add a customproperty for the user's shipto.  
        /// This is used for shipto in Eclipse if a new address is being entered
        /// </summary>
        /// <param name="cartModel"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        public override UpdateCartParameter MapParameter(CartModel cartModel, HttpRequestMessage request)
        {
            var parameter = base.MapParameter(cartModel, request);
            var ctx = SiteContext.Current;

            //Need these because "new" address entry makes a different company name and CustomerSequence
            parameter.Properties["CustomerSequence"] = 
                !string.IsNullOrWhiteSpace(ctx?.ShipTo?.CustomerSequence)? ctx.ShipTo.CustomerSequence
                : !string.IsNullOrWhiteSpace(ctx?.ShipTo?.CustomerNumber)? ctx.ShipTo.CustomerNumber
                :ctx?.BillTo?.CustomerNumber;
            parameter.Properties["CompanyName"] = ctx?.ShipTo?.CompanyName;

            return parameter;
        }
    }
}
