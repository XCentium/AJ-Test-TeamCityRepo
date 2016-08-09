using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web.Configuration;
using System.Web.Script.Serialization;
using Insite.Cart.Services.Dtos;
using Insite.Cart.Services.Handlers;
using Insite.Cart.Services.Handlers.Helpers;
using Insite.Cart.Services.Parameters;
using Insite.Cart.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;
using Insite.Core.Interfaces.Plugins.Security;
using Insite.Core.Plugins.Cart;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.Shipping;
using Insite.Core.Translation;
using Insite.Customers.Services;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Payments.Services;
using Insite.RatingService.FedEx.FedExRateService;
using Insite.WebFramework.Routing;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Globalization;

namespace Morsco.Customizations.Lib.Cart
{
	public struct Branch
	{
		public string Address;
		public string BranchName;
	}

	public struct RequestedTime
	{
		public string Time;
		public bool Default;
	}

	[DependencyName("GetCartHandler_Morsco")]
    public class GetCartHandlerMorsco : GetCartHandler
    {

        public GetCartHandlerMorsco(Lazy<IProductUtilities> productUtilities, ICartOrderProviderFactory cartOrderProviderFactory, Lazy<ICustomerOrderUtilities> customerOrderUtilities, 
            Lazy<ICustomerService> customerService, Lazy<IPaymentService> paymentService, Lazy<IShippingEngine> shippingEngine, Lazy<IUrlProvider> urlProvider, Lazy<ICartHelper> cartHelper, 
            IOrderLineUtilities orderLineUtilities, IAuthenticationService authenticationService, Lazy<ITranslationLocalizer> translationLocalizer, Lazy<IEntityTranslationService> entityTranslationService)
            : base(productUtilities, cartOrderProviderFactory, customerOrderUtilities, customerService, paymentService, shippingEngine, urlProvider, cartHelper, orderLineUtilities, authenticationService, translationLocalizer, entityTranslationService)
        {
        }

        public override GetCartResult Execute(IUnitOfWork unitOfWork, GetCartParameter parameter, GetCartResult result)
        {
			var shipVias = unitOfWork.GetRepository<ShipVia>().GetTable()
                .Where(x => x.Enable)
                .OrderBy(x => x.Description);

            var validShipVias = new List<ShipVia>();

            var mscBranch = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>()
                    .GetOrCreateByName<string>("MSC_OpcoTerritory", SiteContext.Current.Website.Id);
            var warehouses = unitOfWork.GetRepository<Warehouse>().GetTable().Where(x => (x.DeactivateOn > DateTime.Now || x.DeactivateOn == null) &&
                                x.CustomProperties.Any(cp => cp.Name.Equals("OpcoTerritory", StringComparison.CurrentCultureIgnoreCase) && cp.Value.Equals(mscBranch, StringComparison.CurrentCultureIgnoreCase))).ToList();

            foreach (var cartLine in result.CartLineResults)
            {
                var documents = unitOfWork.GetRepository<Insite.Data.Entities.Product>().GetTable()
                    .Where(x => x.Id == cartLine.ProductDto.Id)
                    .Join(unitOfWork.GetRepository<Document>().GetTable(),
                        product => product.Id,
                        document => document.ParentId,
                        (product, document) => document).ToList();

                foreach (var prop in cartLine.ProductDto.Properties)
                {
                    cartLine.Properties[prop.Key] = prop.Value;
                }


                foreach (var document in documents)
                {
                    cartLine.Properties[document.DocumentType] = JsonConvert.SerializeObject(document);
                }

                if (cartLine.Properties.ContainsKey("availability"))
                {
                    var availability = JObject.Parse(cartLine.Properties["availability"]);
                    var stockList = (JArray)availability["StockList"];

                    if (stockList.Count > 0)
                    {
                        var branchList = new Dictionary<string, object>();

                        foreach (var shipVia in shipVias)
                        {
                            if (warehouses.Where(x => x.ShipSite == shipVia.ErpShipCode).Count() > 0)
                            {
                                validShipVias.Add(shipVia);
                            }
                            foreach (var branch in stockList)
                            {

                                if ((string)branch["Branch"] == shipVia.ErpShipCode)
                                {
                                    branchList.Add(shipVia.Id.ToString(), (string)branch["Stock_Qty"]);
                                }
                            }
                        }
                        cartLine.Properties["Branches"] = JsonConvert.SerializeObject(branchList);
                    }
                }
            }

            var carriers = unitOfWork.GetRepository<Carrier>().GetTable()
                .Where(x => x.Enable)
                .OrderBy(x => x.Name).ToList();

            var willCallCarrierId = Guid.Parse(ConfigurationManager.AppSettings["WillCallCarrierId"]);
            result.Properties["willCallCarrierId"] = willCallCarrierId.ToString();
            result.Properties["altWarehouse"] = string.Empty;

            if (result.Properties.ContainsKey("shipmethod")
                && result.Properties["shipmethod"].ToLower() == willCallCarrierId.ToString().ToLower()
                && result.Cart.ShipVia != null)
            {

                var warehouse =
                    unitOfWork.GetRepository<Warehouse>()
                        .GetTable()
                        .FirstOrDefault(x => x.ShipSite == result.Cart.ShipVia.ErpShipCode && (x.DeactivateOn > DateTime.Now || x.DeactivateOn == null));
                if (warehouse != null)
                {
                    result.Properties["willCallPickUpLocation-Name"] = warehouse.Description;
                    result.Properties["willCallPickUpLocation-Address1"] = warehouse.Address1;
                    result.Properties["willCallPickUpLocation-Address2"] = warehouse.Address2;
                    result.Properties["willCallPickUpLocation-City"] = warehouse.City;
                    result.Properties["willCallPickUpLocation-State"] = warehouse.State;
                    result.Properties["willCallPickUpLocation-Zip"] = warehouse.PostalCode;
                    result.Properties["willCallPickUpLocation-Tel"] = warehouse.Phone;
                    result.Properties["willCallPickUpLocation-Fax"] = "NO FAX in DB";
                }
                else
                {
                    result.Properties["willCallPickUpLocation-Name"] = string.Empty;
                    result.Properties["willCallPickUpLocation-Address1"] = string.Empty;
                    result.Properties["willCallPickUpLocation-Address2"] = string.Empty;
                    result.Properties["willCallPickUpLocation-City"] = string.Empty;
                    result.Properties["willCallPickUpLocation-State"] = string.Empty;
                    result.Properties["willCallPickUpLocation-Zip"] = string.Empty;
                    result.Properties["willCallPickUpLocation-Tel"] = string.Empty;
                    result.Properties["willCallPickUpLocation-Fax"] = string.Empty;
                }
            }

            if (SiteContext.Current.BillTo?.DefaultWarehouse != null)
            {
                var cart = result.Cart;
                var defaultWarehouses = new List<string>();

                parameter.GetShippingOptions = true;
                PopulateShippingOptions(parameter, result, cart);
                foreach (var carrier in carriers)
                {
                    var wh = carrier.ShipVias.FirstOrDefault(x => x.ErpShipCode == SiteContext.Current.BillTo.DefaultWarehouse.ShipSite);

                    if (wh != null)
                    {
                        defaultWarehouses.Add(wh.Id.ToString());
                        if (result.Cart.ShipVia == null && carrier.Id != willCallCarrierId)
                        {
                            result.Cart.ShipVia = wh;
                        }
                    }

                    var altWhShipCode =
                        unitOfWork.GetTypedRepository<IApplicationSettingRepository>()
                            .GetOrCreateByName<string>("MSC_AlternateDeliveryWarehouse");

                    var altWh = carrier.ShipVias.FirstOrDefault(x => x.ErpShipCode == altWhShipCode && x.CarrierId == carrier.Id);

                    if (altWh != null && carrier.Id == willCallCarrierId)
                    {
                        result.Properties["altWarehouse"] = altWh.Id.ToString();
                    }
                }   

                var warehouseList = string.Empty;
                foreach (var warehouse in defaultWarehouses)
                {
                    if (string.IsNullOrEmpty(warehouseList))
                    {
                        warehouseList = warehouse;
                    }
                    else
                    {
                        warehouseList += "," + warehouse;
                    }
                }

                result.Properties["defaultWarehouse"] = warehouseList;
            }

            //Load the payment options because the native load just loads 2 random ones. Our payment options work differently than Insite intends.
            if (result.PaymentOptions != null)
            {
                var termsCode = SiteContext.Current.ShipTo.TermsCode;
                var paymentOptions = unitOfWork.GetRepository<PaymentMethod>().GetTable().OrderBy(x => x.Name);
                result.PaymentOptions.PaymentMethods.Clear();
                foreach (var pMethod in paymentOptions)
                {
                    if (termsCode == "COD" && pMethod.Name == "Billme")
                    {
                        continue;
                    }
                    var pmd = new PaymentMethodDto
                    {
                        Name = pMethod.Name,
                        Description = pMethod.Description,
                        IsCreditCard = pMethod.IsCreditCard
                };
                    result.PaymentOptions.PaymentMethods.Add(pmd);
                }
            }
			else
			{
                var termsCode = (result.Cart.ShipTo == null) ? "" : result.Cart.ShipTo.TermsCode;
                result.PaymentMethod = new PaymentMethodDto() { Name = termsCode, IsCreditCard = false, Description = "xxxdescription" };
			}
            
            if (Boolean.Parse(WebConfigurationManager.AppSettings["Morsco.Ponderosa.Disabled"]))
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
                }
                else
                {
                    whDictionary.Add(wh.ShipSite, branch);
                }
			}
			var sortedWh = whDictionary.ToList().OrderBy(x => x.Value.BranchName);
			var jsonSerialiser = new JavaScriptSerializer();
			var jsonWarehouses = jsonSerialiser.Serialize(sortedWh);
			result.Properties["warehouses"] = jsonWarehouses;

            var jobProperty = new CustomProperty();
            if (result.Cart.ShipTo != null)
            {
                jobProperty = result.Cart.ShipTo.CustomProperties.FirstOrDefault(x => x.Name == "CanChangeAddress");
            }
			
			if (result.Cart?.ShipTo?.CustomProperties != null && jobProperty != null)
			{
				if (jobProperty.Value.EqualsIgnoreCase("true"))
				{
					result.Properties["CanChangeAddress"] = "True";
				}
			}
            var shipViasToInclude = new List<ShipViaDto>();
            foreach (var carrierCart in result.Carriers)
            {
                carrierCart.ShipVias = carrierCart.ShipVias.OrderBy(x => x.Description).ToList();
                foreach (var sv in carrierCart.ShipVias)
                {
                    if (validShipVias.Where(x => x.Id == sv.Id).Count() > 0)
                    {
                        shipViasToInclude.Add(sv);
                    }
                    var tempShipVia = shipVias.FirstOrDefault(x => x.Id == sv.Id);
                    var tempWarehouse = warehouses.FirstOrDefault(x => x.ShipSite == tempShipVia?.ErpShipCode);
                    if (tempWarehouse != null)
                    {
                        sv.Description = $"{CultureInfo.CurrentCulture.TextInfo.ToTitleCase(sv.Description)}; {CultureInfo.CurrentCulture.TextInfo.ToTitleCase(tempWarehouse.Address1.ToLower())}";
                    }
                }
            }

            result.Properties["IncludedBranches"] = JsonConvert.SerializeObject(shipViasToInclude);

            IWebsiteConfigurationRepository typedRepository = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>();
			var shipMethod = result.Properties.FirstOrDefault(x => x.Key.EqualsIgnoreCase("shipmethod"));
			if ( !shipMethod.Equals(default(KeyValuePair<string,string>))
				&& shipMethod.Value.EqualsIgnoreCase(willCallCarrierId.ToString())
				&& result.Cart.ShipVia != null)
			{
				result.Properties["checkoutPickupCutoffMessaging"] = typedRepository.GetOrCreateByName<string>("MSC_Checkout_Pickup_Cutoff_Messaging", SiteContext.Current.Website.Id);
				var checkoutRequestedPickupTimes = typedRepository.GetOrCreateByName<string>("MSC_Checkout_Requested_Pickup_Time", SiteContext.Current.Website.Id);
				if (!checkoutRequestedPickupTimes.IsBlank())
				{
					var timesArray = checkoutRequestedPickupTimes.Split(',');
					var doDictionary = new List<RequestedTime>();

					foreach (var ta in timesArray)
					{
						var pickupTime = new RequestedTime();
						pickupTime.Default = (ta.Contains("[default]"));
						pickupTime.Time = ta.ReplaceIgnoreCase("[default]", "").Trim();

						doDictionary.Add(pickupTime);
					}

					result.Properties["checkoutRequestedPickupTimes"] = jsonSerialiser.Serialize(doDictionary);
					result.Properties["deliveryMethod"] = "Pickup";
				}
			}
			else
			{
				result.Properties["checkoutDeliveryCutoffMessaging"] = typedRepository.GetOrCreateByName<string>("MSC_Checkout_Delivery_Cutoff_Messaging", SiteContext.Current.Website.Id);
				var checkoutRequestedDeliveryTimes = typedRepository.GetOrCreateByName<string>("MSC_Checkout_Requested_Delivery_Time", SiteContext.Current.Website.Id);
				if (!checkoutRequestedDeliveryTimes.IsBlank())
				{
					var timesArray = checkoutRequestedDeliveryTimes.Split(',');
					var doDictionary = new List<RequestedTime>();

					foreach (var ta in timesArray)
					{
						var deliveryTime = new RequestedTime();
						deliveryTime.Default = (ta.Contains("[default]"));
						deliveryTime.Time = ta.ReplaceIgnoreCase("[default]", "").Trim();

						doDictionary.Add(deliveryTime);
					}

					result.Properties["checkoutRequestedDeliveryTimes"] = jsonSerialiser.Serialize(doDictionary);
					result.Properties["deliveryMethod"] = "Delivery";
				}
			}





			return NextHandler.Execute(unitOfWork, parameter, result);
        }

        public override int Order => 600;
    }
}

