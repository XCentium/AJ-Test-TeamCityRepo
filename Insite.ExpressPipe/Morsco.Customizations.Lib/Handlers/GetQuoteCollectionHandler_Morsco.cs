using System;
using System.Collections.Generic;
using System.Linq;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Plugins.EntityUtilities;
using Insite.Rfq.Services.Handlers;
using Insite.Rfq.Services.Parameters;
using Insite.Rfq.Services.Results;
using System.Data.Entity;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("GetQuoteCollectionHandler_Morsco")]
    public class GetQuoteCollectionHandler_Morsco : GetQuoteCollectionHandler
    {
        private readonly CustomerOrderUtilities _customerOrderUtilities;
        private readonly ITranslationLocalizer _translationLocalizer;

        public override int Order => 100;

        public GetQuoteCollectionHandler_Morsco(IPricingServiceFactory pricingServiceFactory, CustomerOrderUtilities customerOrderUtilities,
            ITranslationLocalizer translationLocalizer)
            : base(pricingServiceFactory)
        {
            _customerOrderUtilities = customerOrderUtilities;
            _translationLocalizer = translationLocalizer;
        }

        public override GetQuoteCollectionResult Execute(IUnitOfWork unitOfWork, GetQuoteCollectionParameter parameter, GetQuoteCollectionResult result)
        {
            if ((parameter.Types == null) || (parameter.Types.Count == 0))
            {
                parameter.Types = new List<string> { 
                    "Job",
                    "Quote"
                };
            }
            var a = unitOfWork.GetRepository<CustomerOrder>().GetTable()
                .Where(x => x.CustomerNumber == SiteContext.Current.ShipTo.CustomerNumber
                            && parameter.Types.Contains(x.Type));

            if (!string.IsNullOrEmpty(SiteContext.Current.ShipTo.CustomerSequence))
            {
                a = a.Where(x => x.CustomerSequence == SiteContext.Current.ShipTo.CustomerSequence
                        || x.CustomProperties.Any(cop => cop.Name == "CustomerSequence" && cop.Value == SiteContext.Current.ShipTo.CustomerSequence));
            }

            if (parameter.Statuses != null && parameter.Statuses.Contains("All"))
            {
                parameter.Statuses.Remove("All");
            }

            if (parameter.Statuses == null || parameter.Statuses.Count == 0)
            {
                parameter.Statuses = new List<string>
                {
                    "QuoteRequested",
                    "QuoteProposed",
                    "QuoteSubmitted"
                };
            }

            if (parameter.Statuses.Contains("Active") || parameter.Statuses.Contains("Expired"))
            {
                if (parameter.Statuses.Contains("Expired"))
                {
                    a = a.Where(x => x.Status == "QuoteProposed" && DbFunctions.TruncateTime(x.QuoteExpirationDate.Value) < DateTimeOffset.Now);
                }
                if (parameter.Statuses.Contains("Active"))
                {
					a = a.Where(x => x.Status == "QuoteProposed" && DbFunctions.TruncateTime(x.QuoteExpirationDate.Value) >= DateTimeOffset.Now);
                }
            }
            else
            {
                a = a.Where(x => parameter.Statuses.Contains(x.Status));
            }
            

            if (!string.IsNullOrEmpty(parameter.QuoteNumber))
            {
                a = a.Where(x => x.OrderNumber.ToLower().Contains(parameter.QuoteNumber.ToLower()) ||
                    x.CustomerPO.ToLower().Contains(parameter.QuoteNumber.ToLower()) ||
                    x.CreatedBy.ToLower().Contains(parameter.QuoteNumber.ToLower()));
            }
            else if (parameter.Statuses.Contains("QuoteProposed"))
            {
                var date30DaysAgo = DateTime.Today.AddDays(-30);
                a = a.Where(x => (x.Status == "QuoteProposed" && x.QuoteExpirationDate > date30DaysAgo) || x.Status != "QuoteProposed");
            }

            var sortField = parameter.Sort;
            var sortDesc = false;
            if (!string.IsNullOrEmpty(sortField))
            {
                var sortArray = parameter.Sort.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                sortField = sortArray[0];
                if (sortArray.Length > 1 && sortArray[1].ToUpper() == "DESC")
                {
                    sortDesc = true;
                }
                parameter.Sort = "";

				if (sortField.EqualsIgnoreCase("ordernumber"))
				{
					result.Quotes = sortDesc
						? a.OrderByDescending(x => x.OrderNumber).ToList().AsReadOnly()
						: a.OrderBy(x => x.OrderNumber).ToList().AsReadOnly();
				}
				else if (sortField.EqualsIgnoreCase("status"))
				{
					var sortList = sortDesc
						? a.ToList().OrderByDescending(x => x.Status != "QuoteProposed"
															? _translationLocalizer.TranslateLabel(x.Status)
															: x.QuoteExpirationDate?.Date < DateTime.Now.Date ? "Expired" : "Active")
						: a.ToList().OrderBy(x => x.Status != "QuoteProposed"
												  ? _translationLocalizer.TranslateLabel(x.Status)
												  : (x.QuoteExpirationDate?.Date < DateTime.Now.Date ? "Expired" : "Active"));

					result.Quotes = sortList.Select(x => x).ToList().AsReadOnly();
				}
				else if (sortField.EqualsIgnoreCase("customersequence"))
				{
					result.Quotes = sortDesc
						? a.OrderByDescending(x => x.CustomProperties.Any(y => y.Name.Equals("CustomerSequence", StringComparison.CurrentCultureIgnoreCase)) ?
																		x.CustomProperties.FirstOrDefault(y => y.Name.Equals("CustomerSequence", StringComparison.CurrentCultureIgnoreCase)).Value
																		: x.CustomerSequence).ToList().AsReadOnly()
						: a.OrderBy(x => x.CustomProperties.Any(y => y.Name.Equals("CustomerSequence", StringComparison.CurrentCultureIgnoreCase)) ?
																		x.CustomProperties.FirstOrDefault(y => y.Name.Equals("CustomerSequence", StringComparison.CurrentCultureIgnoreCase)).Value
																		: x.CustomerSequence).ToList().AsReadOnly();
				}
                else if (sortField.EqualsIgnoreCase("companyname"))
                {
                    var c = a.ToList().Select(co => new { co, CompanyName = co.GetProperty("CompanyName", string.Empty)});
                    var b = sortDesc
                        ? c.OrderByDescending(x => x.CompanyName)
                        : c.OrderBy(x => x.CompanyName);
                    result.Quotes = b.Select(x => x.co).ToList().AsReadOnly();
                }
                else if (sortField.EqualsIgnoreCase("ponumber"))
                {
                    result.Quotes = sortDesc
                        ? a.OrderByDescending(x => x.CustomerPO).ToList().AsReadOnly()
                        : a.OrderBy(x => x.CustomerPO).ToList().AsReadOnly();
                }
                else if (sortField.EqualsIgnoreCase("orderdate"))
                {
                    result.Quotes = sortDesc
                        ? a.OrderByDescending(x => x.OrderDate).ToList().AsReadOnly()
                        : a.OrderBy(x => x.OrderDate).ToList().AsReadOnly();
                }
                else if (sortField.EqualsIgnoreCase("requestedby"))
                {
                    result.Quotes = sortDesc
                        ? a.OrderByDescending(x => x.PlacedByUserName).ToList().AsReadOnly()
                        : a.OrderBy(x => x.PlacedByUserName).ToList().AsReadOnly();
                }
                else if (sortField.EqualsIgnoreCase("modifiedon"))
                {
                    result.Quotes = sortDesc
                        ? a.OrderByDescending(x => x.ModifiedOn).ToList().AsReadOnly()
                        : a.OrderBy(x => x.ModifiedOn).ToList().AsReadOnly();

                }
                else if (sortField.EqualsIgnoreCase("expirationdate"))
                {
                    result.Quotes = sortDesc
                        ? a.OrderByDescending(x => x.QuoteExpirationDate).ToList().AsReadOnly()
                        : a.OrderBy(x => x.QuoteExpirationDate).ToList().AsReadOnly();
                }
                else if (sortField.EqualsIgnoreCase("quotetotal"))
                { 
                    result.Quotes = sortDesc
                        ? a.ToList().OrderByDescending(x => _customerOrderUtilities.GetOrderGrandTotal(x)).ToList().AsReadOnly()
                        : a.ToList().OrderBy(x => _customerOrderUtilities.GetOrderGrandTotal(x)).ToList().AsReadOnly();
                }
            }
            else
            {
				result.Quotes = a.ToList().AsReadOnly();
			}

			result.DefaultPageSize = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<int>("Web_DefaultPageSize");
            result.PageSize = !parameter.PageSize.HasValue || parameter.PageSize.Value <= 0 ? result.DefaultPageSize : parameter.PageSize.Value;
            result.CurrentPage = parameter.StartPage ?? 1;
            result.TotalCount = result.Quotes.Count;
            result.Quotes = result.Quotes.Skip((result.CurrentPage - 1) * result.PageSize).Take(result.PageSize).ToList().AsReadOnly();
            
            return result;
        }
    }
}
