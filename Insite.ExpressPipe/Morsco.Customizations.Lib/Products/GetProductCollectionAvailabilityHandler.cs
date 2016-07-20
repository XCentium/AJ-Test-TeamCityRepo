using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web.Configuration;
using System.Web.Script.Serialization;
using Insite.Catalog.Services.Dtos;
using Insite.Catalog.Services.Parameters;
using Insite.Catalog.Services.Results;
using Insite.Common.Logging;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Core.Services.Handlers;
using Insite.Data.Entities;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Services;
using Newtonsoft.Json;

namespace Morsco.Customizations.Lib.Products
{
	public struct Branch
	{
		public string Address;
		public string BranchName;
	}

    [DependencyName("GetProductCollectionAvailabilityHandler")]
    public class GetProductCollectionAvailabilityHandler : HandlerBase<GetProductCollectionParameter, GetProductCollectionResult>
    {
        private readonly ICurrencyFormatProvider _currencyFormatProvider;

        public GetProductCollectionAvailabilityHandler(ICurrencyFormatProvider currencyFormatProvider)
        {
            _currencyFormatProvider = currencyFormatProvider;
        }

        public override GetProductCollectionResult Execute(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, GetProductCollectionResult result)
        {
            var warehouses = unitOfWork.GetRepository<Warehouse>().GetTable().Where(x => x.DeactivateOn > DateTime.Now || x.DeactivateOn == null).ToList();
            
            if (Boolean.Parse(WebConfigurationManager.AppSettings["Morsco.Ponderosa.Disabled"]) || parameter.GetPrices == false)
            {
                return NextHandler.Execute(unitOfWork, parameter, result);
            }

			var whDictionary = new Dictionary<string, Branch>();

			foreach (var wh in warehouses)
			{
				var branch = new Branch
				{
					Address = wh.Address1,
					BranchName = wh.Description
				};
                if (whDictionary.ContainsKey(wh.ShipSite))
                {
                    whDictionary[wh.ShipSite] = branch;
                } else
                {
                    whDictionary.Add(wh.ShipSite, branch);
                }
				
			}
			var sortedWh = whDictionary.ToList().OrderBy(x => x.Value.BranchName);
			var jsonSerialiser = new JavaScriptSerializer();
            var jsonWarehouses = jsonSerialiser.Serialize(sortedWh);
			result.Properties["warehouses"] = jsonWarehouses;

			List<PriceAvailability> priceAvailList;

			var productIDs = result.ProductDtos.Select(x => Int32.Parse(x.ERPNumber)).ToList();

			try
			{
				using (var svc = new OrderServices())
				{
					priceAvailList = svc.GetPriceAvailability(productIDs.ToList(), SiteContext.Current.BillTo, SiteContext.Current.ShipTo, unitOfWork);
				}
			}
			catch (Exception ex)
			{
                LogHelper.For(this).Error(ex.ToString());
				return NextHandler.Execute(unitOfWork, parameter, result);
			}

            var failoverDefaultWarehouse = ConfigurationManager.AppSettings["FailoverDefaultWarehouse"];
            var defaultWarehouse = 
                (  SiteContext.Current.ShipTo != null 
                && SiteContext.Current.ShipTo.DefaultWarehouse != null 
                && SiteContext.Current.ShipTo.DefaultWarehouse.ShipSite != null) 
                    ? SiteContext.Current.ShipTo.DefaultWarehouse.ShipSite
                : (SiteContext.Current.BillTo != null 
                && SiteContext.Current.BillTo.DefaultWarehouse != null 
                && SiteContext.Current.BillTo.DefaultWarehouse.ShipSite != null) 
                    ? SiteContext.Current.BillTo.DefaultWarehouse.ShipSite
                : (!string.IsNullOrWhiteSpace(failoverDefaultWarehouse)) ? failoverDefaultWarehouse
                : "12";

			//foreach (var insiteProduct in result.ProductDtos)
			//{
				
			//	if (insiteProduct.Pricing == null)
			//	{
			//		insiteProduct.Pricing = new ProductPriceDto();
			//		insiteProduct.Pricing.ActualPriceDisplay = "";
			//		if (insiteProduct.Properties.ContainsKey("CatalogWebSite"))
			//		{
			//			var websites = insiteProduct.Properties["CatalogWebSite"].ToString().Split(',');
			//			var currentWebsite = SiteContext.Current.Website.Name;
			//			if (websites.Contains(currentWebsite))
			//			{
			//				insiteProduct.Pricing.ActualPrice = 13;
			//				insiteProduct.Pricing.ActualPriceDisplay = Currency.Format(insiteProduct.Pricing.ActualPrice, SiteContext.Current.Currency.CurrencyCode);
			//				insiteProduct.QtyOnHand = (decimal)13;
			//			}
			//		}
			//	}

			//}

			foreach (var priceAvail in priceAvailList)
			{
				var availMessage = "Available for Order";
				var availMessageType = AvailabilityMessageType.OutOfStock;
				var insiteProduct = result.ProductDtos.FirstOrDefault(x => x.ERPNumber == priceAvail.ProductId.ToString());

				priceAvail.DefaultWarehouse = defaultWarehouse;

				var stockQty = 0;
				foreach (var x in priceAvail.StockList)
				{
					if (x.Last().Key == "Stock_Qty" && Int32.Parse(x.Last().Value.ToString()) > 0)
					{
						stockQty += Int32.Parse(x.Last().Value.ToString());
					}
				}

				priceAvail.StockQty = stockQty;

			    if (insiteProduct.Properties != null)
			    {
                    insiteProduct.Properties["availability"] = JsonConvert.SerializeObject(priceAvail);
			    }

			    if (insiteProduct.Pricing == null)
				{
					insiteProduct.Pricing = new ProductPriceDto();
				}

			    if (insiteProduct.Properties != null)
			    {
			        if (insiteProduct.Properties.ContainsKey("CatalogWebSite"))
			        {
			            var websites = insiteProduct.Properties["CatalogWebSite"].Split(',');
			            var currentWebsite = SiteContext.Current.Website.Name;
			            if (websites.Contains(currentWebsite))
			            {
			                insiteProduct.Pricing.ActualPrice = priceAvail.UnitPrice.Value;
                            insiteProduct.Pricing.RegularPrice = priceAvail.UnitPrice.Value;

                            insiteProduct.Pricing.ActualPriceDisplay = _currencyFormatProvider.GetString(insiteProduct.Pricing.ActualPrice, SiteContext.Current.Currency);
			                insiteProduct.QtyOnHand = priceAvail.StockQty.Value;
			            }
			            else
			            {
			                insiteProduct.Pricing.ActualPriceDisplay = "";
			            }
			        }
			    }

			    if (insiteProduct.QtyOnHand > 0)
				{
					availMessage = "In Stock";
					availMessageType = AvailabilityMessageType.Available;
				}
				if (insiteProduct.Availability == null)
				{
					insiteProduct.Availability = new AvailabilityDto();
				}
				insiteProduct.Availability.Message = availMessage;
				insiteProduct.Availability.MessageType = availMessageType;
			}

            return result;
        }

        public override int Order => 560;
    }
}