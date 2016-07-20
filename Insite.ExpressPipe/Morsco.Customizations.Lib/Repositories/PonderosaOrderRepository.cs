using Insite.Catalog.Services;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using Insite.Common.Logging;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Entities;
using Insite.Data.Extensions;
using Morsco.Customizations.Lib.Ponderosa.Models;
using Morsco.PonderosaService.Common;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Services;
using WebGrease.Css.Extensions;

namespace Morsco.Customizations.Lib.Repositories
{
    public class PonderosaOrderRepository : BaseRepository, IPonderosaOrderRepository, IInterceptable
    {

        public PonderosaOrderRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService)
            : base(unitOfWorkFactory, customerService, productService)
        { }

        public List<Dictionary<string, object>>  GetOrder(string eclipseOrderNumber)
        {
            List<Dictionary<string, object>> result;
            try
            {
                using (var svc = new OrderServices())
                {
                    var order = svc.GetHeaderDetailResultByOrderNo(eclipseOrderNumber);
                    var handler = new OrderToDictionaryHandler();
                    handler.StoreResult(order);
                    result = handler.Result;
                }
            }
            catch (Exception ex)
            {
                LogHelper.For(this).Error("Get Order Change execution failed: " + ex.Message);
                throw;
            }
            return result;
        }

        public List<Dictionary<string, object>> UpdateQuote(UpdateQuoteRequest request)
        {
            List<Dictionary<string, object>> result;
            try
            {
                using (var svc = new OrderServices())
                {
                    var order = svc.LockOrder(request.EclipseOrderNumber, "TestSessionId");

                    var orderUpdate = new UpdateOrderDto(order.OrderNo, order.Generation)
                    {
                        BidExpireDate = request.QuoteExpiresDate,
                        QuoteStatus = request.QuoteStatus,
                        Freight = request.Shipping,
                        Handling = request.Handling
                    };

                    var detailsUpdate = new List<UpdateOrderItemDto>();

                    foreach (var line in order.OrderDetail.Where(x => x is OrderItem))
                    {
                        var detail = line as OrderItem;
                        
                        var detailUpdate = new UpdateOrderItemDto(detail.LineItemId, detail.ItemCode, detail.ProductId);
                        var mustUpdateLine = false;

                        if (!detail.UnitPrice.HasValue || detail.UnitPrice == 0.0m)
                        {
                            detailUpdate.UnitPrice = request.QuotePriceForNonCatalogItems;
                            mustUpdateLine = true;
                        }
                        //"1" is the current SOP product
                        if (!detail.ProductId.HasValue || detail.ProductId == 1)
                        {
                            detailUpdate.ProductId = request.EclipseProductForSop;
                            mustUpdateLine = true;
                        }
                        if (mustUpdateLine)
                        {
                            detailsUpdate.Add(detailUpdate);
                        }
                    }

                    svc.UpdateOrder(orderUpdate, detailsUpdate, "TestSessionId");
                    result = GetOrder(order.OrderNo);
                }
            }
            catch (Exception ex)
            {
                LogHelper.For(this).Error("Get Order Change execution failed: " + ex.Message);
                throw;
            }
            return result;
        }
    }
}
