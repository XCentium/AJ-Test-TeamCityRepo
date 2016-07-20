using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Insite.Common.Extensions;
using Insite.Core.Context;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Insite.Core.WebApi.Extensions;
using Insite.Core.WebApi.Interfaces;
using Insite.Order.Services.Parameters;
using Insite.Order.Services.Results;
using Insite.Order.WebApi.V1.ApiModels;
using Insite.Order.WebApi.V1.Mappers;
using Insite.Order.WebApi.V1.Mappers.Interfaces;
using Morsco.Customizations.Lib.BillTrust.Helpers;

namespace Morsco.Customizations.Lib.OrderHistory
{
    public class GetOrderCollectionMapper_Morsco : GetOrderCollectionMapper, IWebApiMapper<OrderCollectionParameter, GetOrderCollectionParameter, GetOrderCollectionResult, OrderCollectionModel>, ISingletonLifetime
	{

        public GetOrderCollectionMapper_Morsco(IGetOrderMapper getOrderMapper, IObjectToObjectMapper objectToObjectMapper, IUrlHelper urlHelper)
			: base(getOrderMapper, objectToObjectMapper, urlHelper)
		{
		}

        public override GetOrderCollectionParameter MapParameter(OrderCollectionParameter apiParameter, HttpRequestMessage request)
        {
            // Standard destination
            var destination = base.MapParameter(apiParameter, request);

            // Add customer sequence -- which we need to do bill-to level/ship-to-level in order history display
            // Customer Sequence is filtered in the base handler, and -1 means don't filter
            destination.CustomerSequence = (SiteContext.Current.ShipTo != null 
                                            && !string.IsNullOrWhiteSpace(SiteContext.Current.ShipTo.CustomerSequence))
                ? SiteContext.Current.ShipTo.CustomerSequence
                : "-1";
			
			if (!string.IsNullOrEmpty(request.GetQueryString("orderedBy")))
			{
				destination.Properties["orderedBy"] = request.GetQueryString("orderedBy");
			}

			return destination;
        }

        public override OrderCollectionModel MapResult(GetOrderCollectionResult serviceResult, HttpRequestMessage request)
        {
            OrderCollectionModel orderCollectionModel1 = new OrderCollectionModel
            {
                Uri = GetLink(serviceResult, request, serviceResult.CurrentPage),
                Pagination = new PaginationModel(serviceResult),
                ShowErpOrderNumber = serviceResult.ShowErpOrderNumber
            };

            OrderCollectionModel orderCollectionModel2 = orderCollectionModel1;

            if (serviceResult.CurrentPage > 1)
                orderCollectionModel2.Pagination.PrevPageUri = GetLink(serviceResult, request, serviceResult.CurrentPage - 1);

            if (serviceResult.CurrentPage < serviceResult.TotalPages)
                orderCollectionModel2.Pagination.NextPageUri = GetLink(serviceResult, request, serviceResult.CurrentPage + 1);

            var earliestInvoiceDate = GetEarliestInvoiceDate(serviceResult);

            foreach (Insite.Data.Entities.OrderHistory orderHistory in serviceResult.OrderHistoryCollection)
            {
                GetOrderResult result = new GetOrderResult
                {
                    OrderHistory = orderHistory,
                    Properties = new Dictionary<string, string>()
                };
                orderHistory.CustomProperties.Each(x => result.Properties.Add(x.Name, x.Value));

                if (orderHistory.Status.EqualsIgnoreCase("Invoiced")
                    && orderHistory.CustomProperties.Any(x => x.Name.EqualsIgnoreCase("invoiceDate")))
                {
                    var dateString = orderHistory.CustomProperties.First(x => x.Name.EqualsIgnoreCase("invoiceDate")).Value;
                    var invoiceDate = GetDateFromString(dateString);
					
					//Hide invoice list from users with Role Buyer2
					var hasRole = SiteContext.Current.IsUserInRole("Buyer2");
                    if (!hasRole && invoiceDate >= earliestInvoiceDate)
                    {
                        result.Properties["invoiceUrl"]
                            = BillTrustHelper.GetInvoices(SiteContext.Current.BillTo.CustomerNumber, new List<string>() {result.OrderHistory.ErpOrderNumber});
                    }
                }
                orderCollectionModel2.Orders.Add(GetOrderMapper.MapResult(result, request));
            }
            return orderCollectionModel2;
        }

        DateTimeOffset GetEarliestInvoiceDate(GetOrderCollectionResult serviceResult)
        {
            return GetDateFromString(serviceResult.Properties["EarliestBilltrustInvoices"]);
        }

        DateTimeOffset GetDateFromString(string dateString)
        {
            DateTimeOffset date;
            if (!DateTimeOffset.TryParse(dateString, out date))
            {
                throw new Exception($"Could not parse date from {dateString})");
            }
            return date;
        }
	}
}