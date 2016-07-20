using System;
using System.Collections.Generic;

namespace Morsco.Customizations.Lib.Products.Search
{
    public class ProductSearchParameterMorsco : IProductSearchParameterMorsco
    {
        public bool IncludeSuggestions { get; set; } = true;

        public string SearchCriteria { get; set; }

        public Guid? CategoryId { get; set; }

        public List<string> CategoryIds { get; set; }

        public List<string> AttributeValueIds { get; set; }

        public int StartRow { get; set; }

        public int PageSize { get; set; }

        public string SortBy { get; set; }

        public Decimal? MinimumPrice { get; set; }

        public Decimal? MaximumPrice { get; set; }

        public List<int> PriceFilters { get; set; }

        public Guid? WebSiteId { get; set; }

        public bool DoFacetedSearches { get; set; }

        public List<Guid> AllowedProductIds { get; set; }

        public int? MaxHits { get; set; }

        public string SearchWithin { get; set; }
    }
}
