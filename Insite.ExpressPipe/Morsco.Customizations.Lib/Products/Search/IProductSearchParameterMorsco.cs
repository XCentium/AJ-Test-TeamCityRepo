using System;
using System.Collections.Generic;

namespace Morsco.Customizations.Lib.Products.Search
{
    public interface IProductSearchParameterMorsco
    {
        string SearchCriteria { get; set; }

        Guid? CategoryId { get; set; }

        List<string> CategoryIds { get; set; }

        List<string> AttributeValueIds { get; set; }

        int StartRow { get; set; }

        int PageSize { get; set; }

        string SortBy { get; set; }

        Decimal? MinimumPrice { get; set; }

        Decimal? MaximumPrice { get; set; }

        List<int> PriceFilters { get; set; }

        Guid? WebSiteId { get; set; }

        bool DoFacetedSearches { get; set; }

        List<Guid> AllowedProductIds { get; set; }

        int? MaxHits { get; set; }

        bool IncludeSuggestions { get; set; }

        string SearchWithin { get; set; }
    }
}
