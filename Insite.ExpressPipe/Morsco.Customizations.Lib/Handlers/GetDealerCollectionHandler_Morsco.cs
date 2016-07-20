using System;
using System.Globalization;
using System.Linq;
using Insite.Core.Services;
using Insite.Dealers.Services.Handlers;
using Insite.Dealers.Services.Handlers.Helpers;
using Insite.Dealers.Services.Handlers.Interfaces;
using Insite.Dealers.Services.Parameters;
using Insite.Dealers.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Repositories.Interfaces;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("GetDealerCollectionHandler_Morsco")]
    public class GetDealerCollectionHandler_Morsco : GetDealerCollectionHandler
    {
        public GetDealerCollectionHandler_Morsco(IDealerProvider dealerProvider)
            : base(dealerProvider)
        {

        }

        public override GetDealerCollectionResult Execute(IUnitOfWork unitOfWork, GetDealerCollectionParameter parameter, GetDealerCollectionResult result)
        {
            if (result == null)
            {
                return CreateErrorServiceResult<GetDealerCollectionResult>(new GetDealerCollectionResult(), SubCode.GeneralFailure, null);
            }
            if (parameter == null)
            {
                return CreateErrorServiceResult<GetDealerCollectionResult>(result, SubCode.GeneralFailure, null);
            }
            IWebsiteConfigurationRepository typedRepository = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>();
            result.Radius = (parameter.Radius == 0) ? typedRepository.GetOrCreateByName<int>("DealerLocator_SearchRadius", SiteContext.Current.Website.Id) : parameter.Radius;
            result.Latitude = ((parameter.Latitude == 0.0) || parameter.UseDefaultLocation) ? double.Parse(typedRepository.GetOrCreateByName<string>("DealerLocator_DefaultLatitude", SiteContext.Current.Website.Id), CultureInfo.InvariantCulture) : parameter.Latitude;
            result.Longitude = ((parameter.Longitude == 0.0) || parameter.UseDefaultLocation) ? double.Parse(typedRepository.GetOrCreateByName<string>("DealerLocator_DefaultLongitude", SiteContext.Current.Website.Id), CultureInfo.InvariantCulture) : parameter.Longitude;
            int? pageSize = parameter.PageSize;
            int num = pageSize.HasValue ? pageSize.GetValueOrDefault() : typedRepository.GetOrCreateByName<int>("DealerLocator_PageSize", SiteContext.Current.Website.Id);
            int page = (!parameter.StartPage.HasValue || (parameter.StartPage.Value <= 0)) ? 1 : parameter.StartPage.Value;
            FindDealersResult result2 = new FindDealersResult();
            var category = parameter.Properties.FirstOrDefault(x => x.Key == "category");
            if (category.Value != null)
            {
                //This allows for a maximum of 200 dealers, add more/less if needed
                result2 = DealerProvider.FindDealers(SiteContext.Current.Website.Id, result.Latitude, result.Longitude, result.Radius, parameter.Name, 0, 500);
                result2 = FilterByCategory(unitOfWork, parameter, result2);
                var start = (page == 0) ? page : ((page - 1) * num);
                result2.Dealers = result2.Dealers.Skip(start).Take(num).ToList();
            }
            else
            {
                result2 = DealerProvider.FindDealers(SiteContext.Current.Website.Id, result.Latitude, result.Longitude, result.Radius, parameter.Name, page, num);
            }
            result.Dealers = result2.Dealers;
            result.DistanceUnitOfMeasure = FindDistanceUnitOfMeasure(result2.Dealers, unitOfWork);
            result.PageSize = num;
            result.DefaultPageSize = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<int>("Web_DefaultPageSize");
            result.CurrentPage = page;
            result.TotalPages = ((result2.Count - 1) / num) + 1;
            result.TotalCount = result2.Count;
            return result;
        }

        public FindDealersResult FilterByCategory(IUnitOfWork unitOfWork, GetDealerCollectionParameter parameter, FindDealersResult dealers)
        {
            var category = parameter.Properties.FirstOrDefault(x => x.Key == "category");
            if (category.Value != null)
            {
                var dealerList = dealers.Dealers.Select(x => x.Id).ToList();
                var validProperties = unitOfWork.GetRepository<CustomProperty>().GetTable()
                    .Where(x => dealerList.Contains(x.ParentId)
                        && x.Name.Equals("productCategories", StringComparison.CurrentCultureIgnoreCase))
                        .Select(x => new
                        {
                            ValueList = x.Value,
                            DealerId = x.ParentId
                        }).ToList();
                var validIds = validProperties.Where(x => x.ValueList.Replace(" ", "").Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries)
                    .Contains(category.Value)).ToList()
                    .Select(x => x.DealerId).ToList();
                dealers.Dealers = dealers.Dealers.Where(x => validIds.Contains(x.Id)).ToList();
                dealers.Count = dealers.Dealers.Count;
            }

            return dealers;

        }
        public override int Order
        {
            get
            {
                return 200;
            }
        }
    }
}

