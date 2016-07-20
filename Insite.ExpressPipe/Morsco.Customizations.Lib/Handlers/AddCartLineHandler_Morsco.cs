using Insite.Cart.Services.Handlers;
using Insite.Cart.Services.Handlers.Helpers;
using Insite.Cart.Services.Parameters;
using Insite.Cart.Services.Results;
using Insite.Catalog.Services;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.Utilities;
using Insite.Core.Services.Handlers;
using System;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("AddCartLineHandler_Morsco")]
    public class AddCartLineHandler_Morsco : AddCartLineHandler
    {
        public AddCartLineHandler_Morsco(IRoundingRulesProvider roundingRulesProvider, Lazy<IProductService> productService, IHandlerFactory handlerFactory, ICartHelper cartHelper, 
            Lazy<IProductUtilities> productUtilities, IOrderLineUtilities orderLineUtilities, ICustomerOrderUtilities customerOrderUtilities)
            : base(roundingRulesProvider, productService, handlerFactory, cartHelper, productUtilities, orderLineUtilities, customerOrderUtilities)
        { }

        public override int Order
        {
            get
            {
                return 680;
            }
        }

        public override AddCartLineResult Execute(IUnitOfWork unitOfWork, AddCartLineParameter parameter, AddCartLineResult result)
        {
            var targetProperties = result.GetCartLineResult.ProductDto.Properties;
            foreach (var property in parameter.Properties)
            {
                if (targetProperties.ContainsKey(property.Key))
                {
                    targetProperties[property.Key] = property.Value;
                }
                else
                {
                    targetProperties.Add(property.Key, property.Value);
                }
            }
            return NextHandler.Execute(unitOfWork, parameter, result);
        }
    }
}
