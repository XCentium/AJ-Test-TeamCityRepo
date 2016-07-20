using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Insite.Catalog.Services.Handlers.Helpers;
using Insite.Catalog.Services.Parameters;
using Insite.Catalog.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Search;
using Insite.Core.Services.Handlers;
using Morsco.Customizations.Lib.Common;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.Repositories;
using Insite.Core.Interfaces.Localization;

namespace Morsco.Customizations.Lib.Products
{
    [DependencyName("GetProductCollectionForPreviouslyPurchasedItemsHandler")]
    public class GetProductCollectionForPreviouslyPurchasedItemsHandler : HandlerBase<GetProductCollectionParameter, GetProductCollectionResult>
    {
        protected readonly Lazy<IGetProductHandlerHelper> GetProductHandlerHelper;
        protected readonly IProductHistoryRepository ProductHistoryRepository;
        protected readonly Lazy<IProductSearchProvider> ProductSearchProvider;
        protected readonly Lazy<ITranslationLocalizer> TranslationLocalizer;

        public GetProductCollectionForPreviouslyPurchasedItemsHandler(Lazy<IGetProductHandlerHelper> getProductHandlerHelper, 
            IProductHistoryRepository productHistoryRepository)
        {
            GetProductHandlerHelper = getProductHandlerHelper;
            ProductHistoryRepository = productHistoryRepository;
    }
       
        public override GetProductCollectionResult Execute(
             IUnitOfWork unitOfWork,
             GetProductCollectionParameter parameter,
             GetProductCollectionResult result)
        {
            if (Helpers.GetShowOnlyPreviousPurchasedItems() && SiteContext.Current.BillTo != null 
                && (parameter.AllowedProductIds == null || parameter.AllowedProductIds.Count == 0))
            {
                parameter.AllowedProductIds = new List<Guid>();

                //Search allows up to 500 predefined products to search
                var products = ProductHistoryRepository.SelectPurchasedProducts(1, 500, String.Empty);

                foreach (DataRow row in products.Rows)
                {
                    Guid productId;

                    if (Guid.TryParse(row[0].ToString(), out productId))
                    {
                        parameter.AllowedProductIds.Add(productId);
                    }
                }
            }
           
            return NextHandler.Execute(unitOfWork, parameter, result);
        }


        protected virtual IProductSearchResult DoProductSearch(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, int pageSize, int startPage)
        {
            string str = this.GetProductHandlerHelper.Value.CheckForReplacement(unitOfWork, parameter.Query);
            ProductSearchParameter parameter1 = new ProductSearchParameter
            {
                SearchCriteria = str,
                CategoryId = parameter.CategoryId,
                AttributeValueIds = (parameter.AttributeValueIds == null) ? null : parameter.AttributeValueIds.ToList<string>(),
                AllowedProductIds = (parameter.AllowedProductIds == null) ? null : parameter.AllowedProductIds.ToList<Guid>(),
                StartRow = pageSize * (startPage - 1),
                PageSize = pageSize,
                SortBy = parameter.Sort,
                MinimumPrice = parameter.MinimumPrice,
                MaximumPrice = parameter.MaximumPrice,
                PriceFilters = (parameter.PriceFilters == null) ? null : parameter.PriceFilters.ToList<int>(),
                DoFacetedSearches = parameter.DoFacetedSearches.GetValueOrDefault(),
                IncludeSuggestions = parameter.IncludeSuggestions,
                SearchWithin = parameter.SearchWithin
            };
            IProductSearchResult searchResults = this.ProductSearchProvider.Value.GetSearchResults(parameter1);

            if (searchResults.AutoCorrectSuggestion != null)
            {
                string suggestion = searchResults.AutoCorrectSuggestion.Suggestion;
                ProductSearchParameter parameter2 = new ProductSearchParameter
                {
                    SearchCriteria = suggestion,
                    CategoryId = parameter.CategoryId,
                    AttributeValueIds = (parameter.AttributeValueIds == null) ? null : parameter.AttributeValueIds.ToList<string>(),
                    AllowedProductIds = (parameter.AllowedProductIds == null) ? null : parameter.AllowedProductIds.ToList<Guid>(),
                    StartRow = pageSize * (startPage - 1),
                    PageSize = pageSize,
                    SortBy = parameter.Sort,
                    MinimumPrice = parameter.MinimumPrice,
                    MaximumPrice = parameter.MaximumPrice,
                    PriceFilters = (parameter.PriceFilters == null) ? null : parameter.PriceFilters.ToList<int>(),
                    DoFacetedSearches = parameter.DoFacetedSearches.GetValueOrDefault(),
                    IncludeSuggestions = false
                };

                IProductSearchResult result2 = this.ProductSearchProvider.Value.GetSearchResults(parameter2);
                if (result2.Products.Count > 0)
                {
                    searchResults = result2;
                    searchResults.CorrectedQuery = suggestion;
                }
            }
            searchResults.OriginalQuery = str;
            return searchResults;
        }

        public override int Order
        {
            get
            {
                return 100;
            }
        }

    }
}