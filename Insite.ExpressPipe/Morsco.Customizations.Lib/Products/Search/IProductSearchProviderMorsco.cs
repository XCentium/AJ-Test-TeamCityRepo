using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Search.Dtos;
using System;
using System.Collections.Generic;
using Insite.Core.Plugins.Search;

namespace Morsco.Customizations.Lib.Products.Search
{
    public interface IProductSearchProviderMorsco : IDependency
    {
        List<SortOrderDto> SortOptions { get; }

        IProductSearchResult GetSearchResults(IProductSearchParameterMorsco parameter);

        IProductSearchResult GetAutocompleteSearchResults(string searchCriteria, int maximumNumber);

        List<CategoryFacetDto> GetAllCategoryFacets(Guid? webSiteId = null);

        List<string> GetAllAllowedCategoryIds(Guid? webSiteId = null);

        List<string> GetAllCategoryIds(Guid? webSiteId = null);

        bool IsProductVisible(string erpNumber, Guid? webSiteId = null);

        List<string> GetVisibleProducts(List<string> erpNumbers, Guid? webSiteId = null);
    }
}

