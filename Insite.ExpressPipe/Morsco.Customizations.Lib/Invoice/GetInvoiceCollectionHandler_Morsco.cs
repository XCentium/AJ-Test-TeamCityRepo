using System;
using System.Configuration;
using System.Linq;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Invoice.Services.Handlers;
using Insite.Invoice.Services.Parameters;
using Insite.Invoice.Services.Results;
using Morsco.Customizations.Lib.Extensions;

namespace Morsco.Customizations.Lib.Invoice
{
    [DependencyName("GetInvoiceCollectionHandler_Morsco")]
    public class GetInvoiceCollectionHandler_Morsco : GetStoredInvoiceCollectionHandler
    {

        public override GetInvoiceCollectionResult Execute(IUnitOfWork unitOfWork, GetInvoiceCollectionParameter parameter, GetInvoiceCollectionResult result)
        {
            if (!result.IsRealTime)
            {
                var customerSequence = parameter.CustomerSequence;
                parameter.CustomerSequence = SiteContext.Current.ShipTo.CustomerSequence == "" ? "-1" : SiteContext.Current.ShipTo.CustomerSequence;
                var invoiceNumber = parameter.InvoiceNumber;
                parameter.InvoiceNumber = null;
                var customerPo = parameter.CustomerPO;
                parameter.CustomerPO = null;
                //One or 2 of the sort fields are not doable by the stock GetStoredInvoiceCollection
                var sort = parameter.Sort;
                parameter.Sort = null;
                DateTimeOffset? fromDate = null;
                DateTimeOffset? toDate = null;
                if (parameter.FromDate != null)
                {
                    fromDate = new DateTimeOffset(parameter.FromDate.Value.DateTime.Date, TimeSpan.Zero);
                }

                if (parameter.ToDate != null)
                {
                    toDate = new DateTimeOffset(parameter.ToDate.Value.DateTime.Date.AddDays(1).AddMinutes(-1), TimeSpan.Zero);
                }

                parameter.FromDate = null;
                parameter.ToDate = null;

                result.ShowErpOrderNumber = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>()
                    .GetOrCreateByName<bool>("OrderHistory_ShowErpOrderNumber", SiteContext.Current.Website.Id);

                IQueryable<InvoiceHistory> query = GetStoredInvoiceCollection(unitOfWork, SiteContext.Current.BillTo, parameter);
                if (parameter.Properties.ContainsKey("jobName"))
                {
                    var jobName = parameter.Properties["jobName"];
                    // Pre-4.2 had had jobname contains value,  But we're using a dropdown, so seems like it should be equals.
                    query = query.Where(x => x.CustomProperties.Any(cp => cp.Name.Equals("JobName", StringComparison.CurrentCultureIgnoreCase)
                                                                          && cp.Value.Equals(jobName, StringComparison.CurrentCultureIgnoreCase)));
                }

                if (!customerSequence.IsBlank() && customerSequence != "-1")
                {
                    query = query.Where(x => x.CustomerSequence.Contains(customerSequence));
                }

                if (!invoiceNumber.IsBlank())
                {
                    query = query.Where(x => x.InvoiceNumber.Contains(invoiceNumber));
                }

                if (!customerPo.IsBlank())
                {
                    query = query.Where(x => x.CustomerPO.Contains(customerPo));
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(x => x.InvoiceDate >= fromDate);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(x => x.InvoiceDate <= toDate);
                }
                
                if (parameter.Properties.ContainsKey("fromDueDate"))
                {
                    var fromDueDate = DateTimeOffset.Parse(parameter.Properties["fromDueDate"]);
                    fromDueDate = new DateTimeOffset(fromDueDate.Date, TimeSpan.Zero);
                    query = query.Where(x => x.DueDate >= fromDueDate);
                }

                if (parameter.Properties.ContainsKey("toDueDate"))
                {
                    var toDueDate = DateTimeOffset.Parse(parameter.Properties["toDueDate"]);
                    toDueDate = new DateTimeOffset(toDueDate.Date.AddDays(1).AddMinutes(-1), TimeSpan.Zero);
                    query = query.Where(x => x.DueDate <= toDueDate);
                }

                if (parameter.Properties.ContainsKey("originalAmountFrom"))
                {
                    var ogAmountFrom = decimal.Parse(parameter.Properties["originalAmountFrom"]);
                    query = query.Where(x => x.InvoiceTotal >= ogAmountFrom);
                }

                if (parameter.Properties.ContainsKey("originalAmountTo"))
                {
                    var ogAmountTo = decimal.Parse(parameter.Properties["originalAmountTo"]);
                    query = query.Where(x => x.InvoiceTotal <= ogAmountTo);
                }

                if (parameter.Properties.ContainsKey("openBalanceFrom"))
                {
                    var openBalanceFrom = decimal.Parse(parameter.Properties["openBalanceFrom"]);
                    query = query.Where(x => x.CurrentBalance >= openBalanceFrom);
                }

                if (parameter.Properties.ContainsKey("openBalanceTo"))
                {
                    var openBalanceTo = decimal.Parse(parameter.Properties["openBalanceTo"]);
                    query = query.Where(x => x.CurrentBalance <= openBalanceTo);
                }

                if (parameter.Properties.ContainsKey("type"))
                {
                    query = query.Where(x => x.Status.ToLower() == parameter.Properties["type"].ToLower());
                }

                if (parameter.Properties.ContainsKey("status"))
                {
                    if (parameter.Properties["status"].ToLower() != "all")
                    {
                        var isOpen = (parameter.Properties["status"] == "open");
                        query = query.Where(x => x.IsOpen == isOpen);
                    }
                }

                // Sort normal properties
                parameter.Sort = sort;
                var sortTokens = parameter.Sort.Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries);
                if (!(new[] {"stcompanyname", "aging"}.Contains(sortTokens[0].ToLower())))
                {
                    query = query.OrderByList(parameter.Sort, "InvoiceDate DESC");
                }
                // Sort special cases
                else if (sortTokens[0].Equals("stcompanyname"))
                {
                    var propertyName = "JobName";
                    query = sortTokens.Length > 1 && sortTokens[1].EqualsIgnoreCase("Desc")
                        ? query.OrderByDescending(q => q.CustomProperties
                            .FirstOrDefault(cp => cp.Name.Equals(propertyName, StringComparison.CurrentCultureIgnoreCase)).Value)
                        : query.OrderBy(q => q.CustomProperties
                            .FirstOrDefault(cp => cp.Name.Equals(propertyName, StringComparison.CurrentCultureIgnoreCase)).Value);
                }
                //aging is by whether open or not and then by duedate the opposite of normal sorting
                else
                {
                    query = sortTokens.Length > 1 && sortTokens[1].EqualsIgnoreCase("Desc")
                        ? query.OrderByDescending(q => q.IsOpen ? 1 : 0).ThenBy(q => q.DueDate)
                        : query.OrderBy(q => q.IsOpen ? 1 : 0).ThenByDescending(q => q.DueDate);
                }

                result.InvoiceHistoryCollection = ApplyPaging(unitOfWork, parameter, result, query).ToList();

                var earliestBilltrustInvoices = ConfigurationManager.AppSettings["EarliestBilltrustInvoices"];

                if (!string.IsNullOrEmpty(earliestBilltrustInvoices))
                {
                    result.Properties["EarliestBilltrustInvoices"] = earliestBilltrustInvoices;
                }
            }

            return result;
        }

        public override int Order => 80;
    }
}

