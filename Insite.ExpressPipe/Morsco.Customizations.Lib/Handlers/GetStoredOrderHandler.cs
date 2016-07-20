using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using Insite.Catalog.Services;
using Insite.Common.Extensions;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Translation;
using Entities = Insite.Data.Entities;
using Insite.Data.Extensions;
using Insite.Order.Services;
using Insite.Order.Services.Handlers;
using Insite.Order.Services.Parameters;
using Insite.Order.Services.Results;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("GetStoredOrderHandlerMorsco")]
	public class GetStoredOrderHandler_Morsco : OrderHandlerBase<GetOrderParameter, GetOrderResult>
	{
        public GetStoredOrderHandler_Morsco(Lazy<IProductService> productService, Lazy<IShipmentService> shipmentService, Lazy<IEntityTranslationService> entityTranslationService)
          : base(productService, shipmentService, entityTranslationService)
        {
        }

        public override GetOrderResult Execute(IUnitOfWork unitOfWork, GetOrderParameter parameter, GetOrderResult result)
		{
			if (result.OrderHistory != null)
			{
				Dictionary<string, string> dict = new Dictionary<string, string>();
				result.OrderHistory.CustomProperties.Each(x => dict.Add(x.Name, x.Value));
				result.Properties = dict;

				var earliestBilltrustInvoices = ConfigurationManager.AppSettings["EarliestBilltrustInvoices"];

				if (!string.IsNullOrEmpty(earliestBilltrustInvoices))
				{
					if (result.Properties.ContainsKey("EarliestBilltrustInvoices"))
					{
						result.Properties["EarliestBilltrustInvoices"] = earliestBilltrustInvoices;
					}
					else
					{
						result.Properties.Add("EarliestBilltrustInvoices", earliestBilltrustInvoices);
					}
				}
			}
			return NextHandler.Execute(unitOfWork, parameter, result);
		}

        protected virtual Insite.Data.Entities.OrderHistory GetOrderHistory(IUnitOfWork unitOfWork, Entities.Customer customer, GetOrderParameter parameter)
        {
            return unitOfWork.GetRepository<Entities.OrderHistory>().GetTable()
                .Expand(x => x.OrderHistoryLines)
                .Where(o => o.ErpOrderNumber.Equals(parameter.OrderNumber, StringComparison.CurrentCultureIgnoreCase) 
                || o.WebOrderNumber.Equals(parameter.OrderNumber, StringComparison.CurrentCultureIgnoreCase))
                .FirstOrDefault(o => o.CustomerNumber.Equals(customer.CustomerNumber, StringComparison.CurrentCultureIgnoreCase));
        }

        public override int Order
		{
			get
			{
				return 600;
			}
		}
	}
}

