using System.Linq;
using Insite.Catalog.Services;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using System.Collections.Generic;
using System.Net.Http;
using Morsco.Customizations.Lib.SpecialOrder.Models;
using Insite.Cart.Services.Dtos;
using Insite.Cart.Services;
using Insite.Cart.Services.Parameters;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Services.Handlers;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using System;

namespace Morsco.Customizations.Lib.Repositories
{
    public class SpecialOrderRepository : BaseRepository, ISpecialOrderRepository, IInterceptable
    {
        private readonly IHandlerFactory _handlerFactory;
        private readonly IApplicationSettingRepository _applicationSettingRepository;

        public SpecialOrderRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService,
            IProductService productService,IHandlerFactory handlerFactory, IApplicationSettingRepository applicationSettingRepository)
            : base(unitOfWorkFactory, customerService, productService)
        {
            _handlerFactory = handlerFactory;
            _applicationSettingRepository = applicationSettingRepository;
        }

        public SpecialOrderResult CreateSpecialOrder(SpecialOrderRequest sopRequest, HttpRequestMessage httpRequest)
        {
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            var specialOrderErpNumber = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_SpecialOrderProduct_ERPNumber");

            var product = unitOfWork.GetRepository<Insite.Data.Entities.Product>().GetTable().FirstOrDefault(x => x.ErpNumber == specialOrderErpNumber);

            var cartline = new CartLineDto
            {
                ProductId = product?.Id,
                QtyOrdered = sopRequest.Quantity,
                UnitOfMeasure = product?.UnitOfMeasure
            };

            var svc = new CartService(UnitOfWorkFactory, _handlerFactory);
			var getCartParameter = new GetCartParameter();
			getCartParameter.CreateIfNotFound = true;
            var cartId = svc.GetCart(getCartParameter).Cart.Id;

			//Nick: TODO:  Did you mean to add the cartline twice?
			//This was necessary to properly add SOP to cart. 
			var param = new AddCartLineParameter(cartline);
            param.Properties.Add("SOPDescription", sopRequest.Description);
            svc.AddCartLine(param);

            param.CartId = cartId;
            param.CartLineDto.ProductId = product?.Id;
            svc.AddCartLine(param);

            var result = new SpecialOrderResult {Success = true};
            return result;
        }

        public SpecialOrderResult CreateMultipleSpecialOrder(List<SpecialOrderRequest> sopRequest, HttpRequestMessage httpRequest)
        {
            if (sopRequest.Count < 1)
            {
                return new SpecialOrderResult {Success = true};
            }
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            
            var specialOrderErpNumber = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_SpecialOrderProduct_ERPNumber");

            var product = unitOfWork.GetRepository<Insite.Data.Entities.Product>().GetTable().FirstOrDefault(x => x.ErpNumber == specialOrderErpNumber);

            var svc = new CartService(UnitOfWorkFactory, _handlerFactory);

            var newRequest = new SpecialOrderRequest
            {
                Quantity = 1,
                Description = "new"
            };

            sopRequest.Add(newRequest);
            foreach (var request in sopRequest)
            {
                var cartline = new CartLineDto
                {
                    ProductId = product?.Id,
                    QtyOrdered = request.Quantity,
                    UnitOfMeasure = product?.UnitOfMeasure
                };

                var param = new AddCartLineParameter(cartline);
                param.Properties.Add("SOPDescription", request.Description);
                svc.AddCartLine(param);
            }

            var result = new SpecialOrderResult {Success = true};
            return result;
        }

        public bool DeleteQuote(string quoteId, HttpRequestMessage httpRequest)
        {
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            var order = unitOfWork.GetRepository<CustomerOrder>().GetTable().FirstOrDefault(x => x.Id.ToString() == quoteId);
            if (order != null)
            {
                order.Status = CustomerOrder.StatusType.QuoteRejected;
                unitOfWork.Save();
            }
            
            return true;
        }

        public bool UpdateQuote(UpdateQuoteRequest request, HttpRequestMessage httpRequest)
        {
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();

            var order = unitOfWork.GetRepository<CustomerOrder>().GetTable().FirstOrDefault(x => x.Id.ToString() == request.QuoteId);
            if (order != null)
            {
                if (! string.IsNullOrEmpty(request.PoNumber))
                {
                    order.CustomerPO = request.PoNumber;
                }

                if (!string.IsNullOrEmpty(request.Status) && request.Status == CustomerOrder.StatusType.QuoteRejected) 
                {
                    order.Status = CustomerOrder.StatusType.QuoteRejected;
                }

                if (!string.IsNullOrEmpty(request.CarrierId) &&
                    !string.IsNullOrEmpty(request.ShipViaId))
                {
                    foreach (var carrier in order.Customer.Carriers)
                    {
                        if (carrier.Id.ToString() == request.CarrierId)
                        {
                            foreach (var shipVia in carrier.ShipVias)
                            {
                                if (request.ShipViaId == shipVia.Id.ToString())
                                {
                                    order.ShipVia = shipVia;
                                    var orderPropList = new List<CustomProperty>();
                                    var orderProp1 = new CustomProperty();
                                    var orderProp2 = new CustomProperty();
                                    orderProp1.Name = "Shipmethod";
                                    orderProp1.Value = carrier.Id.ToString();
                                    orderPropList.Add(orderProp1);

                                    orderProp2.Name = "Shipvia";
                                    orderProp2.Value = shipVia.Id.ToString();
                                    orderPropList.Add(orderProp2);

                                    foreach (var orderProp in orderPropList)
                                    {
                                        order.SetProperty(orderProp.Name, orderProp.Value);
                                    }

                                    var warehouse = unitOfWork.GetRepository<Warehouse>().GetTable().
                                        FirstOrDefault(x => x.ShipSite == order.ShipVia.ErpShipCode && (x.DeactivateOn > DateTime.Now || x.DeactivateOn == null));
                                    if (warehouse != null)
                                    {
                                        order.SetProperty("willCallPickUpLocation-Name", warehouse.Description);
                                        order.SetProperty("willCallPickUpLocation-Address1", warehouse.Address1);
                                        order.SetProperty("willCallPickUpLocation-Address2", warehouse.Address2);
                                        order.SetProperty("willCallPickUpLocation-City", warehouse.City);
                                        order.SetProperty("willCallPickUpLocation-State", warehouse.State);
                                        order.SetProperty("willCallPickUpLocation-Zip", warehouse.PostalCode);
                                        order.SetProperty("willCallPickUpLocation-Tel", warehouse.Phone);
                                        order.SetProperty("willCallPickUpLocation-Fax", "NO FAX in DB");
                                    }
                                    else
                                    {
                                        order.SetProperty("willCallPickUpLocation-Name", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-Address1", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-Address2", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-City", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-State", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-Zip", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-Tel", string.Empty);
                                        order.SetProperty("willCallPickUpLocation-Fax", string.Empty);
                                    }
                                }
                            }
                        }
                    }
                    
                }
                unitOfWork.Save();
            }

            return true;
        }
        
		public bool RemoveQuoteLine(string quoteLineId, HttpRequestMessage httpRequest)
		{
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            var quoteLine = unitOfWork.GetRepository<OrderLine>().GetTable().FirstOrDefault(x => x.Id.ToString() == quoteLineId);
			if (quoteLine != null)
			{
				unitOfWork.GetRepository<OrderLine>().Delete(quoteLine);
				unitOfWork.Save();

				// We may want to save the line numbers just in case, hence this code is commented out for the time being.
				//var quoteLines = unitOfWork.GetRepository<OrderLine>().GetTable().Where(x => x.CustomerOrder.Id == orderId).OrderBy(x => x.Line);
				//var counter = 1;
				//foreach (var line in quoteLines)
				//{
				//	line.Line = counter;
				//	counter++;
				//}
				//unitOfWork.Save();
			}

			return true;
		}

    }
}
