using System;
using System.Net.Http;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Insite.Core.WebApi.Extensions;
using Insite.Core.WebApi.Interfaces;
using Insite.Data.Entities;
using Insite.Invoice.Services.Parameters;
using Insite.Invoice.Services.Results;
using Insite.Invoice.WebApi.V1.ApiModels;
using Insite.Invoice.WebApi.V1.Mappers;
using Insite.Invoice.WebApi.V1.Mappers.Interfaces;

namespace Morsco.Customizations.Lib.Invoice
{
    public class GetInvoiceCollectionMapper_Morsco : GetInvoiceCollectionMapper, IGetInvoiceCollectionMapper, IWebApiMapper<InvoiceCollectionParameter, GetInvoiceCollectionParameter, GetInvoiceCollectionResult, InvoiceCollectionModel>, ISingletonLifetime, IDependency
    {
        public GetInvoiceCollectionMapper_Morsco(IGetInvoiceMapper getInvoiceMapper, IObjectToObjectMapper objectToObjectMapper, IUrlHelper urlHelper)
            : base(getInvoiceMapper, objectToObjectMapper, urlHelper)
        {
            
        }

        private string GetLink(GetInvoiceCollectionResult serviceResult, HttpRequestMessage request, int page)
        {
            return UrlHelper.Link("InvoicesV1", new { status = request.GetQueryString("status"),
                                                           customersequence = request.GetQueryString("customersequence"),
                                                           fromdate = request.GetQueryString("fromdate"),
                                                           todate = request.GetQueryString("todate"),
                                                           fromduedate = request.GetQueryString("fromduedate"),
                                                           toduedate = request.GetQueryString("toduedate"),
                                                           originalAmountFrom = request.GetQueryString("originalAmountFrom"),
                                                           originalAmountTo = request.GetQueryString("originalAmountTo"),
                                                           openBalanceFrom = request.GetQueryString("openBalanceFrom"),
                                                           openBalanceTo = request.GetQueryString("openBalanceTo"),
                                                           type = request.GetQueryString("type"),
                                                           jobName = request.GetQueryString("jobName"),
                                                           ordertotaloperator = request.GetQueryString("ordertotaloperator"),
                                                           ordertotal = request.GetQueryString("ordertotal"),
                                                           sort = request.GetQueryString("sort"),
                                                           pagesize = serviceResult.PageSize,
                                                           page = page
            }, request);
        }

        public override GetInvoiceCollectionParameter MapParameter(InvoiceCollectionParameter apiParameter, HttpRequestMessage request)
        {
            GetInvoiceCollectionParameter destination = new GetInvoiceCollectionParameter();
            if (apiParameter != null)
            {
                ObjectToObjectMapper.Map<InvoiceCollectionParameter, GetInvoiceCollectionParameter>(apiParameter, destination);
                if (!string.IsNullOrEmpty(request.GetQueryString("fromduedate")))
                {
                    destination.Properties["fromDueDate"] = request.GetQueryString("fromduedate");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("toduedate")))
                {
                    destination.Properties["toDueDate"] = request.GetQueryString("toduedate");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("status")))
                {
                    destination.Properties["status"] = request.GetQueryString("status");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("jobName")))
                {
                    destination.Properties["jobName"] = request.GetQueryString("jobName");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("originalAmountFrom")))
                {
                    destination.Properties["originalAmountFrom"] = request.GetQueryString("originalAmountFrom");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("originalAmountTo")))
                {
                    destination.Properties["originalAmountTo"] = request.GetQueryString("originalAmountTo");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("openBalanceFrom")))
                {
                    destination.Properties["openBalanceFrom"] = request.GetQueryString("openBalanceFrom");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("openBalanceTo")))
                {
                    destination.Properties["openBalanceTo"] = request.GetQueryString("openBalanceTo");
                }
                if (!string.IsNullOrEmpty(request.GetQueryString("type")))
                {
                    destination.Properties["type"] = request.GetQueryString("type");
                }
            }
            return destination;
        }

        public override InvoiceCollectionModel MapResult(GetInvoiceCollectionResult serviceResult, HttpRequestMessage request)
        {
            if (serviceResult == null)
            {
                throw new ArgumentNullException("serviceResult");
            }
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }
            InvoiceCollectionModel model = new InvoiceCollectionModel
            {
                Uri = GetLink(serviceResult, request, serviceResult.CurrentPage),
                Pagination = new PaginationModel(serviceResult),
                ShowErpOrderNumber = serviceResult.ShowErpOrderNumber
            };
            if (serviceResult.CurrentPage > 1)
            {
                model.Pagination.PrevPageUri = GetLink(serviceResult, request, serviceResult.CurrentPage - 1);
            }
            if (serviceResult.CurrentPage < serviceResult.TotalPages)
            {
                model.Pagination.NextPageUri = GetLink(serviceResult, request, serviceResult.CurrentPage + 1);
            }
            foreach (InvoiceHistory history in serviceResult.InvoiceHistoryCollection)
            {
                GetInvoiceResult result = new GetInvoiceResult
                {
                    InvoiceHistory = history
                };

                var x = GetInvoiceMapper.MapResult(result, request);


                if (history.CustomProperties != null)
                {
                    foreach (var prop in history.CustomProperties)
                    {
                        x.Properties.Add(prop.Name, prop.Value);
                    }
                }

                model.Invoices.Add(x);
            }
            return model;
        }
    }
}

