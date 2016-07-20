using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using Insite.Common.DynamicLinq;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Order.Services.Parameters;
using Insite.Order.Services.Results;
using System.Data.Entity;
using Morsco.Customizations.Lib.Extensions;

namespace Morsco.Customizations.Lib.OrderHistory
{
    [DependencyName("GetStoredOrderCollectionHandler")]
    public class GetStoredOrderCollectionHandler : Insite.Order.Services.Handlers.GetStoredOrderCollectionHandler
    {
		public override GetOrderCollectionResult Execute(IUnitOfWork unitOfWork, GetOrderCollectionParameter parameter, GetOrderCollectionResult result)
		{
			if (!result.IsRealTime)
			{
				var query = GetStoredOrderCollection(unitOfWork, SiteContext.Current.BillTo, parameter);
				result.OrderHistoryCollection = ApplyPaging(unitOfWork, parameter, result, query).ToList();

				var earliestBilltrustInvoices = ConfigurationManager.AppSettings["EarliestBilltrustInvoices"];

				if (!string.IsNullOrEmpty(earliestBilltrustInvoices))
				{
					result.Properties["EarliestBilltrustInvoices"] = earliestBilltrustInvoices;
				}

				result.ShowErpOrderNumber = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>()
                    .GetOrCreateByName<bool>("OrderHistory_ShowErpOrderNumber", SiteContext.Current.Website.Id);
			}
			return NextHandler.Execute(unitOfWork, parameter, result);
		}

        protected override IQueryable<Insite.Data.Entities.OrderHistory> GetStoredOrderCollection(IUnitOfWork unitOfWork, Customer customer,
            GetOrderCollectionParameter parameter)
        {
            //  Workaround - Temporarily filter for status.  (Insite b ug)
            var status = new List<string>();
            if (parameter.StatusCollection != null && parameter.StatusCollection.Count > 0)
            {
                status = parameter.StatusCollection.FirstOrDefault()?.Split(',').ToList();
                if (status != null)
                {
                    var index = status.IndexOf("All");
                    if (index > -1)
                    {
                        status.RemoveAt(index);
                    }
                }
                parameter.StatusCollection.Clear();
            }

            // Using OrderNumber as a general search criteria, so grab value prevent the base class from using
            var orderNumber = parameter.OrderNumber;
            parameter.OrderNumber = null;


            // Insite-generated list of orders
            var source = GetStoredOrderCollectionOriginal(unitOfWork, customer, parameter);

            // "Master" orders have a GenerationCount property.  Limit our query to those, but don't retain the values.
            source = source.Where(x => x.CustomProperties.Any(y => y.Name.Equals("GenerationCount", StringComparison.CurrentCultureIgnoreCase)));

            // Filter based on the temporary status list
            source = source.Where(x => status.Count == 0 || status.Contains(x.Status));

            //Filter based on "search" textbox value (orderNumber)
            if (!string.IsNullOrEmpty(orderNumber))
            {
                source = source.Where(x => x.CustomerPO.ToLower().Contains(orderNumber.ToLower()) ||
                                           x.ErpOrderNumber.ToLower().Contains(orderNumber.ToLower()) ||
                                           x.CustomProperties.Any(y => y.Name.Equals("CompanyName", StringComparison.CurrentCultureIgnoreCase)
                                                                       && y.Value.Equals(orderNumber, StringComparison.CurrentCultureIgnoreCase)) ||
                                           x.CustomProperties.Any(y => y.Name.Equals("OrderedBy", StringComparison.CurrentCultureIgnoreCase)
                                                                       && y.Value.Equals(orderNumber, StringComparison.CurrentCultureIgnoreCase)));
            }

            // Sort normal properties
            if (!parameter.Sort.ContainsCaseInsensitive("CompanyName") &&
                !parameter.Sort.ContainsCaseInsensitive("OrderedBy") &&
                !parameter.Sort.ContainsCaseInsensitive("LastShipDate"))
            {
                source = source.OrderByList(parameter.Sort, "OrderDate DESC");
            }
            // Sort special cases
            else
            {
                var sortTokens = parameter.Sort.Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries);
                var propertyName = sortTokens[0];

                source = sortTokens.Length > 1 && sortTokens[1].EqualsIgnoreCase("Desc")
                    ? source.OrderByDescending(q => q.CustomProperties
                        .FirstOrDefault(cp => cp.Name.Equals(propertyName, StringComparison.CurrentCultureIgnoreCase)).Value)
                    : source.OrderBy(q => q.CustomProperties
                        .FirstOrDefault(cp => cp.Name.Equals(propertyName, StringComparison.CurrentCultureIgnoreCase)).Value);
            }
            return source;

        }

        /// <summary>
        /// Original Insite "GetStoredOrderCollection" method modified to search "CustomerSequence" property for the ShipTo, 
        /// so we get orders by their original sequence when there is a new address (thus a new customersequence)
        /// </summary>
        /// <param name="unitOfWork"></param>
        /// <param name="customer"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>
        protected virtual IQueryable<Insite.Data.Entities.OrderHistory> GetStoredOrderCollectionOriginal(IUnitOfWork unitOfWork, Customer customer, GetOrderCollectionParameter parameter)
        {
            var erpLookBackDays = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<int>("ERP_LookBackDays");

            var source1 = unitOfWork.GetRepository<Insite.Data.Entities.OrderHistory>().GetTable()
                .Where(x => x.CustomerNumber.Equals(customer.CustomerNumber, StringComparison.CurrentCultureIgnoreCase));

            if (parameter.StatusCollection != null && parameter.StatusCollection.Any())
            {
                source1 = source1.Where(o => parameter.StatusCollection.Contains(o.Status));
            }

            if (!parameter.OrderNumber.IsBlank())
            {
                source1 = source1.Where(o => o.ErpOrderNumber.Equals(parameter.OrderNumber, StringComparison.CurrentCultureIgnoreCase)
                                             || o.WebOrderNumber.Equals(parameter.OrderNumber, StringComparison.CurrentCultureIgnoreCase));
            }

            if (!parameter.CustomerPO.IsBlank())
            {
                source1 = source1.Where(o => o.CustomerPO.Equals(parameter.CustomerPO, StringComparison.CurrentCultureIgnoreCase));
            }

            //This is what we had to customize to get orderhistory->OrderProperty
            if (parameter.CustomerSequence != "-1")
            {
                var customerSequence = (parameter.CustomerSequence ?? string.Empty);
                source1 = source1.Where(o => o.CustomerSequence == customerSequence ||
                                             o.CustomProperties.Any(x => x.Name == "CustomerSequence" && x.Value == customerSequence));
            }

            
            if (parameter.ToDate.HasValue)
            {
                var tDate = new DateTimeOffset(parameter.ToDate.Value.DateTime.Date, TimeSpan.Zero);
                source1 = source1.Where(o => o.OrderDate < DbFunctions.AddDays(tDate, 1));
            }

            var fDate = (parameter.FromDate.HasValue)
                ? new DateTimeOffset(parameter.FromDate.Value.DateTime.Date, TimeSpan.Zero)
                : DateTimeOffset.Now;

            
            var queryable = (!parameter.FromDate.HasValue)
                ? source1.Where(o => o.OrderDate > DbFunctions.AddDays(DateTimeOffset.Now, -erpLookBackDays))
                : source1.Where(o => o.OrderDate >= fDate);

            var source2 = queryable;
            if (!parameter.OrderTotalOperator.IsBlank())
            {
                source2 = parameter.OrderTotalOperator.Equals("Less Than", StringComparison.CurrentCultureIgnoreCase) ? source2.Where(o => o.OrderTotal <= parameter.OrderTotal)
                    : parameter.OrderTotalOperator.Equals("Greater Than", StringComparison.CurrentCultureIgnoreCase) ? source2.Where(o => o.OrderTotal >= parameter.OrderTotal)
                    : parameter.OrderTotalOperator.Equals("Equal To", StringComparison.CurrentCultureIgnoreCase) ? source2.Where(o => o.OrderTotal == parameter.OrderTotal)
                    : source2;
            }

            return source2;
        }
        public override int Order => 100;
    }
}