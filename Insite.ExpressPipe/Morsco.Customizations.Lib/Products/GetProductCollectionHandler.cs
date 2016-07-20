using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Expressions;
using Insite.Catalog.Services.Dtos;
using Insite.Catalog.Services.Handlers.Helpers;
using Insite.Catalog.Services.Parameters;
using Insite.Catalog.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.EnumTypes;
using Insite.Core.Interfaces.Localization;
using Insite.Core.Plugins.Search;
using Insite.Core.Plugins.Search.Dtos;
using Insite.Core.Providers;
using Insite.Core.Services;
using Insite.Core.Services.Handlers;
using Insite.Data;
using Insite.Data.Entities;
using Insite.Data.Extensions;
using Insite.Data.Repositories.Interfaces;
using LinqKit;
using Morsco.Customizations.Lib.Products.Search;

namespace Morsco.Customizations.Lib.Products
{
    [DependencyName("GetProductCollectionHandler")]
    public class GetProductCollectionHandler_Morsco : HandlerBase<GetProductCollectionParameter, GetProductCollectionResult>
    {
        protected readonly Lazy<IGetProductHandlerHelper> GetProductHandlerHelper;
        protected readonly Lazy<IProductSearchProviderMorsco> ProductSearchProvider;
        protected readonly Lazy<ITranslationLocalizer> TranslationLocalizer;
        public override int Order
        {
            get
            {
                return 500;
            }
        }

        public GetProductCollectionHandler_Morsco(Lazy<IProductSearchProviderMorsco> productSearchProvider, Lazy<ITranslationLocalizer> translationLocalizer, Lazy<IGetProductHandlerHelper> getProductHandlerHelper)
        {
            this.GetProductHandlerHelper = getProductHandlerHelper;
            this.ProductSearchProvider = productSearchProvider;
            this.TranslationLocalizer = translationLocalizer;
        }


        public override GetProductCollectionResult Execute(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, GetProductCollectionResult result)
        {
            var configuration = unitOfWork.DataProvider.GetConfiguration();
            unitOfWork.DataProvider.SetConfiguration(new DataProviderConfiguration(configuration) { ChangeTrackingEnabled = false });

            try
            {
                if (!GetProductHandlerHelper.Value.CurrentWebSiteCanSeeProducts(unitOfWork))
                    return CreateErrorServiceResult(result, SubCode.Forbidden, MessageProvider.Current.Forbidden);

                var num = parameter.ProductIds != null && parameter.ProductIds.Count != 0
                          || parameter.Names != null && parameter.Names.Count != 0
                          || parameter.ErpNumbers != null && parameter.ErpNumbers.Count != 0
                    ? 0
                    : (parameter.ExtendedNames == null
                        ? 1
                        : (parameter.ExtendedNames.Count == 0 ? 1 : 0));
                result.ResultCode = ResultCode.Success;

                if (num != 0)
                    FindProductsWithSearch(unitOfWork, parameter, result);

                else if (!FindProductsWithLookup(unitOfWork, parameter, result))
                    return result;
                return NextHandler.Execute(unitOfWork, parameter, result);
            }
            finally
            {
                unitOfWork.DataProvider.DetectChanges();
                unitOfWork.DataProvider.SetConfiguration(configuration);
            }
        }

        protected IQueryable<Product> ApplyExpands(IQueryable<Product> query, GetProductCollectionParameter parameter)
        {
            query = query.Expand(p => p.ProductUnitOfMeasures).Expand(p => p.CustomProperties);
            //if (parameter.GetPrices)
            //    query = query.Expand(p => p.ProductWarehouses);
            if (parameter.GetDocuments)
                query = query.Expand(p => p.Documents);
            if (parameter.GetSpecifications)
                query = query.Expand(p => p.Specifications);
            if (parameter.GetAttributeValues)
                query = query.Expand(p => p.AttributeValues.Select(av => av.AttributeType));
            return query;
        }

        protected virtual bool FindProductsWithLookup(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, GetProductCollectionResult result)
        {
            var productRepository = unitOfWork.GetTypedRepository<IProductRepository>();
            var typedRepository = unitOfWork.GetTypedRepository<ICategoryRepository>();
            var list1 = new List<Product>();
            var flag1 = parameter.ProductIds != null;
            var flag2 = parameter.Names != null;
            var flag3 = parameter.ErpNumbers != null;
            if (flag1 | flag2 | flag3)
            {
                var table = productRepository.GetTable();
                IQueryable<Product> query;
                if (flag1)
                    query = table.Where(p => parameter.ProductIds.Contains(p.Id));
                else if (flag2)
                    query = table.Where(p => parameter.Names.Contains(p.Name));
                else
                    query = table.Where(p => parameter.ErpNumbers.Contains(p.ErpNumber));
                var queryable = ApplyExpands(query, parameter);
                list1.AddRange(queryable);
            }
            else if (parameter.ExtendedNames != null)
            {
                if (parameter.ExtendedNames.Count == 1)
                {
                    var str = GetProductHandlerHelper.Value.CheckForReplacement(unitOfWork, parameter.ExtendedNames.First());
                    parameter.ExtendedNames = new List<string>
                    {
                        str
                    };
                }
                var collection =
                    parameter.ExtendedNames.Where(x => x != null)
                        .Select(x => GetProductByAllNameFields(unitOfWork, x, parameter))
                        .Where(product => product != null);
                list1.AddRange(collection);
            }
            if (list1.Count == 0)
            {
                CreateErrorServiceResult(result, SubCode.NotFound, MessageProvider.Current.Not_Found);
                return false;
            }
            result.NotAllProductsFound = flag1 && list1.Count < parameter.ProductIds.Count || flag2 && list1.Count < parameter.Names.Count ||
                                         flag3 && list1.Count < parameter.ErpNumbers.Count;
            if (parameter.ReplaceProducts)
                list1 = list1.Select(p => GetProductHandlerHelper.Value.ValidateAndReplaceProduct(productRepository, p, 0)).ToList();
            if (parameter.EnforceRestrictions)
            {
                var count = list1.Count;
                list1 = GetProductHandlerHelper.Value.GetVisibleProducts(productRepository, list1);
                if (list1.Count == 0)
                {
                    CreateErrorServiceResult(result, SubCode.NotFound, MessageProvider.Current.Multiple_Not_Allowed);
                    return false;
                }
                result.NotAllProductsAllowed = count > list1.Count;
            }
            var category = GetProductHandlerHelper.Value.GetCategory(unitOfWork, parameter.CategoryId);
            var list2 = new List<ProductDto>();
            var billTo = SiteContext.Current.BillTo;
            foreach (var product1 in list1)
            {
                var product = product1;
                List<GetProductPriceParameter> list3;
                if (parameter.PriceParameters == null || parameter.PriceParameters.Count <= 0)
                {
                    list3 = new List<GetProductPriceParameter>();
                    list3.Add(null);
                }
                else
                    list3 = parameter.PriceParameters.Where(p => p.ProductId == product.Id).ToList();
                var list4 = list3;
                if (list4.Count == 0)
                    list4 = new List<GetProductPriceParameter>
                    {
                        null
                    };
                foreach (var productPriceParameter in list4)
                {
                    var priceParameter = productPriceParameter;
                    var productDto = new ProductDto();
                    GetProductHandlerHelper.Value.PopulateProductDto(unitOfWork, typedRepository, productRepository, product, productDto, category, billTo,
                        parameter.IgnoreIsConfigured, parameter.GetHtmlContent);
                    GetProductHandlerHelper.Value.PopulateConditionalProductData(unitOfWork, billTo, product, productDto, parameter, priceParameter,
                        SiteContext.Current.Currency, category);
                    if (priceParameter != null && productDto.ProductUnitOfMeasures.Any(x => x.UnitOfMeasure == priceParameter.UnitOfMeasure))
                    {
                        productDto.UnitOfMeasure = priceParameter.UnitOfMeasure;
                        productDto.UnitOfMeasureDisplay = TranslationLocalizer.Value.Translate(TranslationDictionarySource.UnitOfMeasure,
                            priceParameter.UnitOfMeasure);
                    }
                    list2.Add(productDto);
                }
            }
            result.ProductDtos = list2.AsReadOnly();
            return true;
        }

        protected virtual void FindProductsWithSearch(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, GetProductCollectionResult result)
        {
            SetResultPagination(unitOfWork, parameter, result);

            var searchResults = DoProductSearch(unitOfWork, parameter, result.PageSize, result.CurrentPage);

            if (searchResults != null)
            {
                var currency = SiteContext.Current.Currency;
                var productDtos1 = ConvertSearchResultsToProductDtos(unitOfWork, parameter, searchResults, currency);
                var productDtos2 = SortAndPageProductsByActualPrice(unitOfWork, productDtos1, result.CurrentPage, result.PageSize, parameter.Sort,
                    searchResults.SortOptions);
                if (!GetProductHandlerHelper.Value.CanShowPriceFilters(unitOfWork) || !currency.IsDefault)
                {
                    searchResults.PriceRangeDto = null;
                    parameter.PriceFilters = null;
                }
                var flag = IsExactMatch(parameter, productDtos2);
                TranslateAttributes(parameter, searchResults);
                SetSelectedPriceRanges(parameter, searchResults);
                result.ResultCode = ResultCode.Success;
                result.ProductDtos = productDtos2.AsReadOnly();
                var collectionResult1 = result;
                var categoryDtos = searchResults.CategoryDtos;
                var readOnlyCollection1 = (categoryDtos != null ? categoryDtos.AsReadOnly() : null) ?? new List<CategoryFacetDto>().AsReadOnly();
                collectionResult1.CategoryDtos = readOnlyCollection1;
                var collectionResult2 = result;
                var attributeTypeDtos = searchResults.AttributeTypeDtos;
                var readOnlyCollection2 = attributeTypeDtos != null ? attributeTypeDtos.AsReadOnly() : null;
                collectionResult2.AttributeTypeDtos = readOnlyCollection2;
                result.PriceRangeDto = searchResults.PriceRangeDto;
                var collectionResult3 = result;
                var sortOptions = searchResults.SortOptions;
                ReadOnlyCollection<SortOrderDto> readOnlyCollection3;
                if (sortOptions == null)
                {
                    readOnlyCollection3 = null;
                }
                else
                {
                    Func<SortOrderDto, SortOrderDto> selector = so =>
                    {
                        var sortOrderDto = new SortOrderDto();
                        sortOrderDto.DisplayName = TranslationLocalizer.Value.Translate(SiteContext.Current.Language.Id, TranslationDictionarySource.Label,
                            so.DisplayName);
                        var num = so.SearchOnly ? 1 : 0;
                        sortOrderDto.SearchOnly = num != 0;
                        var sortType = so.SortType;
                        sortOrderDto.SortType = sortType;
                        return sortOrderDto;
                    };
                    readOnlyCollection3 = sortOptions.Select(selector).ToList().AsReadOnly();
                }
                collectionResult3.SortOptions = readOnlyCollection3;
                result.SortOrder = searchResults.SortOrder;
                result.ExactMatch = flag;
                result.TotalPages = (searchResults.Count - 1) / result.PageSize + 1;
                result.TotalCount = searchResults.Count;
                result.ProductDtos = productDtos2.AsReadOnly();
                result.DidYouMeanSuggestions = searchResults.DidYouMeanSuggestions;
                result.CorrectedQuery = searchResults.CorrectedQuery;
                result.OriginalQuery = searchResults.OriginalQuery;
            }
            else
                result.ProductDtos = new List<ProductDto>().AsReadOnly();
        }

        protected virtual void SetResultPagination(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, GetProductCollectionResult result)
        {
            result.DefaultPageSize = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<int>("Web_DefaultPageSize");
            if (result.DefaultPageSize == 0)
                result.DefaultPageSize = 8;
            result.PageSize = !parameter.PageSize.HasValue || parameter.PageSize.Value <= 0 ? result.DefaultPageSize : parameter.PageSize.Value;
            result.CurrentPage = parameter.StartPage ?? 0;
            var collectionResult = result;
            var num = collectionResult.CurrentPage <= 0 ? 1 : result.CurrentPage;
            collectionResult.CurrentPage = num;
        }

        protected virtual List<ProductDto> ConvertSearchResultsToProductDtos(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter,
            IProductSearchResult searchResults, Currency currency)
        {
            var list = GetProductHandlerHelper.Value.MapSearchResultsToProductDtos(unitOfWork, searchResults);
            var category = GetProductHandlerHelper.Value.GetCategory(unitOfWork, parameter.CategoryId);
            var billTo = SiteContext.Current.BillTo;
            var typedRepository1 = unitOfWork.GetTypedRepository<IProductRepository>();
            var typedRepository2 = unitOfWork.GetTypedRepository<ICategoryRepository>();
            var source = typedRepository1.GetTableAsNoTracking().AsExpandable();
            var expression = PredicateBuilder.False<Product>();
            foreach (var productDto1 in list)
            {
                var productDto = productDto1;
                expression = expression.Or(o => o.Id == productDto.Id);
            }
            foreach (var product1 in ApplyExpands(source.Where(expression), parameter).ToList())
            {
                var product = product1;
                var productDto = list.First(o => o.Id == product.Id);
                if (parameter.ReplaceProducts)
                    product = GetProductHandlerHelper.Value.ValidateAndReplaceProduct(typedRepository1, product, 0);
                GetProductHandlerHelper.Value.PopulateProductDto(unitOfWork, typedRepository2, typedRepository1, product, productDto, category, billTo, false,
                    parameter.GetHtmlContent);

                if (parameter.GetAttributeValues)
                    GetProductHandlerHelper.Value.PopulateProductAttributeValues(product, productDto, null);
            }
            return list;
        }

        protected virtual IProductSearchResult DoProductSearch(IUnitOfWork unitOfWork, GetProductCollectionParameter parameter, int pageSize, int startPage)
        {
            string str = this.GetProductHandlerHelper.Value.CheckForReplacement(unitOfWork, parameter.Query);
            var categoryIds = new List<string>();
            if (parameter.Properties.ContainsKey("filterCategoryIds"))
            {
                categoryIds = parameter.Properties["filterCategoryIds"].Split(',').ToList();
            }
                
            ProductSearchParameterMorsco parameter1 = new ProductSearchParameterMorsco
            {
                SearchCriteria = str,
                CategoryId = parameter.CategoryId,
                CategoryIds = categoryIds,
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
                ProductSearchParameterMorsco parameter2 = new ProductSearchParameterMorsco
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
        protected virtual void SetSelectedPriceRanges(GetProductCollectionParameter parameter, IProductSearchResult searchResults)
        {
            var priceRangeDto = searchResults.PriceRangeDto;
            if ((priceRangeDto != null ? priceRangeDto.PriceFacets : null) == null || parameter.PriceFilters == null)
                return;
            foreach (var priceFacetDto in searchResults.PriceRangeDto.PriceFacets)
                priceFacetDto.Selected = parameter.PriceFilters.Contains(priceFacetDto.MinimumPrice);
        }

        protected virtual void TranslateAttributes(GetProductCollectionParameter parameter, IProductSearchResult searchResults)
        {
            if (searchResults.AttributeTypeDtos == null)
                return;
            foreach (var attributeTypeFacetDto in searchResults.AttributeTypeDtos)
            {
                attributeTypeFacetDto.NameDisplay = TranslationLocalizer.Value.Translate(TranslationDictionarySource.Attribute, attributeTypeFacetDto.Name);
                foreach (var attributeValueFacetDto in attributeTypeFacetDto.AttributeValueFacets)
                {
                    attributeValueFacetDto.ValueDisplay = TranslationLocalizer.Value.Translate(TranslationDictionarySource.AttributeValue,
                        attributeValueFacetDto.Value);
                    if (parameter.AttributeValueIds != null)
                        attributeValueFacetDto.Selected = parameter.AttributeValueIds.Contains(attributeValueFacetDto.AttributeValueId.ToString());
                }
            }
        }

        protected virtual bool IsExactMatch(GetProductCollectionParameter parameter, List<ProductDto> productDtos)
        {
            if (productDtos != null && productDtos.Count == 1 && !parameter.Query.IsBlank())
            {
                var startPage = parameter.StartPage;
                var num = 1;
                if ((startPage.GetValueOrDefault() == num ? (startPage.HasValue ? 1 : 0) : 0) != 0 && parameter.SearchWithin.IsBlank() &&
                    (productDtos.Count == 1 || productDtos.Any(p =>
                    {
                        if (!p.Name.EqualsIgnoreCase(parameter.Query) && !p.ERPNumber.EqualsIgnoreCase(parameter.Query))
                            return p.ManufacturerItem.EqualsIgnoreCase(parameter.Query);
                        return true;
                    })) &&
                    (!parameter.CategoryId.HasValue && (parameter.AttributeValueIds == null || parameter.AttributeValueIds.Count == 0) &&
                     (parameter.PriceFilters == null || parameter.PriceFilters.Count == 0)))
                {
                    var nullable = parameter.MinimumPrice;
                    if (!nullable.HasValue)
                    {
                        nullable = parameter.MaximumPrice;
                        return !nullable.HasValue;
                    }
                }
            }
            return false;
        }

        protected virtual List<ProductDto> SortAndPageProductsByActualPrice(IUnitOfWork unitOfWork, List<ProductDto> productDtos, int page, int pageSize,
            string sortBy, List<SortOrderDto> sortOptions)
        {
            if (unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<bool>("UseBasicPricing") ||
                sortOptions != null && !sortOptions.Any(so => so.SortType == sortBy))
                return productDtos;
            if (sortBy == "4")
                return productDtos.OrderBy(sp =>
                {
                    if (sp.CanShowPrice && sp.Pricing != null)
                        return sp.Pricing.ActualPrice;
                    return new Decimal(1000000);
                }).Skip((page - 1) * pageSize).Take(pageSize).ToList();
            if (sortBy == "5")
                return productDtos.OrderByDescending(sp =>
                {
                    if (sp.CanShowPrice && sp.Pricing != null)
                        return sp.Pricing.ActualPrice;
                    return Decimal.Zero;
                }).Skip((page - 1) * pageSize).Take(pageSize).ToList();
            return productDtos;
        }

        protected virtual Product GetProductByAllNameFields(IUnitOfWork unitOfWork, string searchTerm, GetProductCollectionParameter parameter)
        {
            var billTo = SiteContext.Current.BillTo;
            Guid id;
            string str1;
            if (billTo == null)
            {
                str1 = null;
            }
            else
            {
                id = billTo.Id;
                str1 = id.ToString();
            }
            var str2 = str1;
            string str3;
            if (SiteContext.Current.ShipTo == null)
            {
                str3 = null;
            }
            else
            {
                id = SiteContext.Current.ShipTo.Id;
                str3 = id.ToString();
            }
            var str4 = str3;
            var str5 = string.Empty;
            if (str2 != null)
                str5 = str5 +
                       "select p.*,1 as precidence from product p inner join customerproduct cp on cp.ProductId=p.Id \r\n\t                where cp.CustomerId='" +
                       str2 + "' and cp.Name=@p0 union ";
            if (str4 != null)
                str5 = str5 +
                       "select p.*,2 as precidence from product p inner join customerproduct cp on cp.ProductId=p.Id \r\n\t                where cp.CustomerId='" +
                       str4 + "' and cp.Name=@p0 union ";
            var query = str5 +
                        "select *,3 as precidence from product p where p.ERPNumber=@p0 union\r\n                select *,4 as precidence from product p where p.Name=@p0 union\r\n                select *,5 as precidence from product p where p.ManufacturerItem=@p0 union\r\n                select *,6 as precidence from product p where p.Sku=@p0 union\r\n                select *,7 as precidence from product p where p.UPCCode=@p0 union\r\n                select *,8 as precidence from product p where p.Unspsc=@p0\r\n                order by precidence";
            int recordCount;
            var list = unitOfWork.GetRepository<Product>().GetList(query, out recordCount, new Collection<IDbDataParameter>
            {
                new SqlParameter("p0", searchTerm.Trim())
            });
            var product = list != null ? list.FirstOrDefault() : null;
            if (product == null)
                return null;
            return ApplyExpands(unitOfWork.GetRepository<Product>().GetTable().Where(o => o.Id.Equals(product.Id)), parameter).FirstOrDefault();
        }
    }
}
