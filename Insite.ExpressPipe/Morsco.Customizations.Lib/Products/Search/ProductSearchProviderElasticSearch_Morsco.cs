using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;
using Insite.Common.Extensions;
using Insite.Common.Logging;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Caching;
using Insite.Core.Interfaces.Plugins.Catalog;
using Insite.Core.Plugins.Application;
using Insite.Core.Plugins.Search;
using Insite.Core.Plugins.Search.Dtos;
using Insite.Core.Plugins.Search.Enums;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Search.Elasticsearch;
using Insite.Search.Elasticsearch.DocumentTypes.Product;
using Insite.Search.Elasticsearch.DocumentTypes.Product.Query;
using Nest;

namespace Morsco.Customizations.Lib.Products.Search
{
    [DependencyApplicationSetting("ProductSearchProvider", "Elasticsearch")]
    public class ProductSearchProviderElasticsearch_Morsco : IProductSearchProviderMorsco, IDependency
    {
        protected const string PhraseSuggestDidYouMeanKey = "didyoumean";
        protected const string PhraseSuggestAutoCorrectionKey = "correction";
        protected const string AllCategoryFacetsSessionKey = "AllCategoryFacets";
        protected const string AllCategoryTreeFacetsSessionKey = "AllCategoryTreeFacets";
        protected const string AllCategoriesByWebsiteKey = "CategorySearchAllCategoriesByWebsite";
        protected readonly IBoostHelper BoostHelper;
        protected readonly ICacheManager CacheManager;
        protected readonly ICatalogCacheKeyProvider CatalogCacheKeyProvider;
        protected readonly IProductSearchFacetProcessor FacetProcessor;
        protected readonly IPerRequestCacheManager PerRequestCacheManager;
        protected readonly IPhraseSuggestConfiguration PhraseSuggestConfiguration;
        protected readonly IElasticsearchQueryBuilder QueryBuilder;
        protected readonly IUnitOfWork UnitOfWork;
        protected IApplicationSettingProvider ApplicationSettingProvider;
        protected IElasticsearchIndex Index;

        public virtual List<SortOrderDto> SortOptions { get; set; } = new List<SortOrderDto>
        {
            new SortOrderDto{DisplayName = "Best Match",SortType = "1"},
            new SortOrderDto{DisplayName = "Product: A to Z",SortType = "2"},
            new SortOrderDto{DisplayName = "Product: Z to A",SortType = "3"},
            new SortOrderDto{DisplayName = "Price: Low to High",SortType = "4"},
            new SortOrderDto{DisplayName = "Price: High to Low",SortType = "5"}
        };

        protected int MaximumFacets => ApplicationSettingProvider.GetOrCreateByName<int>("Search_MaximumFacets");

        protected bool EnableProductBoost => ApplicationSettingProvider.GetOrCreateByName<bool>("Search_EnableProductBoost");

        protected virtual bool FilterFacetsOnSearch => ApplicationSettingProvider.GetOrCreateByName<bool>("Search_FilterOnSearch");

        protected virtual int ActualPriceSortMaximum => ApplicationSettingProvider.GetOrCreateByName<int>("Search_PriceSortMaximum");

        protected virtual bool EnablePriceFaceting
        {
            get
            {
                if (ApplicationSettingProvider.GetOrCreateByName<bool>("UseBasicPricing"))
                    return UnitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>()
                        .GetOrCreateByName<bool>("ShowPriceFilter", SiteContext.Current.Website.Id);
                return false;
            }
        }

        protected virtual bool EnableWebsiteSpecificFilters => ApplicationSettingProvider.GetOrCreateByName<bool>("Search_WebsiteSpecificAttributes");

        protected virtual bool EnableAttributeFilters => ApplicationSettingProvider.GetOrCreateByName<bool>("Search_EnableAttributeFilters");

        protected List<RestrictionGroup> RestrictionGroups
        {
            get
            {
                return CacheManager.Get(CatalogCacheKeyProvider.BuildKey("RestrictionGroup_SearchList"),
                    () => UnitOfWork.GetRepository<RestrictionGroup>().GetTable().ToList(), TimeSpan.FromMinutes(5.0));
            }
        }

        private bool EnableSearchLogging { get; set; } = false;

        public ProductSearchProviderElasticsearch_Morsco(IElasticsearchIndex index, ICacheManager cacheManager, ICatalogCacheKeyProvider catalogCacheKeyProvider,
            IPerRequestCacheManager perRequestCacheManager, IUnitOfWorkFactory unitOfWorkFactory, IProductSearchFacetProcessor facetProcessor,
            IElasticsearchQueryBuilder queryBuilder, IPhraseSuggestConfiguration phraseSuggestConfiguration, IBoostHelper boostHelper,
            IApplicationSettingProvider applicationSettingProvider)
        {
            Index = index;
            FacetProcessor = facetProcessor;
            PhraseSuggestConfiguration = phraseSuggestConfiguration;
            PerRequestCacheManager = perRequestCacheManager;
            QueryBuilder = queryBuilder;
            CacheManager = cacheManager;
            CatalogCacheKeyProvider = catalogCacheKeyProvider;
            BoostHelper = boostHelper;
            UnitOfWork = unitOfWorkFactory.GetUnitOfWork();
            ApplicationSettingProvider = applicationSettingProvider;
            EnableSearchLogging = ApplicationSettingProvider.GetOrCreateByName<bool>("Search_EnableDebugLogging");
        }

        public virtual IProductSearchResult GetSearchResults(IProductSearchParameterMorsco parameter)
        {
            return RunQuery(parameter);
        }

        public virtual IProductSearchResult GetSearchResults(IProductSearchParameter parameter)
        {
            throw new NotImplementedException();
        }

        public IProductSearchResult GetAutocompleteSearchResults(string searchCriteria, int maximumNumber)
        {
            var productSearchParameter = new ProductSearchParameterMorsco
            {
                SearchCriteria = searchCriteria,
                PageSize = maximumNumber,
                SortBy = "1"
            };
            const int num = 1;
            return RunQuery(productSearchParameter, num != 0);
        }

        public bool IsProductVisible(string erpNumber, Guid? webSiteId = null)
        {
            //TODO: Decompilation issues!  Looking at method RunQuery as a possible example
            var productSearchParameter = new ProductSearchParameterMorsco { WebSiteId = webSiteId };
            FilterContainer filterNoCategory;
            FilterContainer filterNoPriceFilter;
            //End of decompilation issues

            var filter = GenerateFilters(productSearchParameter, out filterNoCategory, out filterNoPriceFilter);
            var searchDescriptor = new SearchDescriptor<ElasticsearchProduct>().Filter(filter);
            return
                Index.Client.Search<ElasticsearchProduct>(searchDescriptor
                    .Query(QueryBuilder.MakeFieldQuery("ErpNumber".ToCamelCase(), erpNumber.ToLower(), FieldMatch.All, false, new float?()))).Hits.Any();
        }

        public List<string> GetVisibleProducts(List<string> erpNumbers, Guid? webSiteId = null)
        {
            //TODO: Decompilation issues!  Looking at method RunQuery as a possible example
            var productSearchParameter = new ProductSearchParameterMorsco { WebSiteId = webSiteId };
            FilterContainer filterNoCategory;
            FilterContainer filterNoPriceFilter;
            //End of decompilation issues

            var filter = GenerateFilters(productSearchParameter, out filterNoCategory, out filterNoPriceFilter);
            var searchDescriptor = new SearchDescriptor<ElasticsearchProduct>().Filter(filter);

            return
                Index.Client.Search<ElasticsearchProduct>(searchDescriptor
                    .Query(
                        QueryBuilder.MakeBooleanQuery(
                            erpNumbers.Select(x => QueryBuilder.MakeFieldQuery("ErpNumber".ToCamelCase(), x.ToLower(), FieldMatch.All, false, new float?()))
                                .ToList(), Operation.Or))
                    .Size(erpNumbers.Count)).Hits.Select(x => x.Source.ErpNumber).ToList();
        }

        public List<CategoryFacetDto> GetAllCategoryFacets(Guid? webSiteId = null)
        {
            var cacheKeyProvider = CatalogCacheKeyProvider;

            //TODO: Decompilation issues -- guessed based on context
            var str = "AllCategoryFacets"
                + webSiteId
                + (SiteContext.Current.ShipTo?.Id ?? new Guid());
            var key = cacheKeyProvider.BuildKey(str);
            var list1 = CacheManager.Get<List<CategoryFacetDto>>(key);
            if (list1 != null)
                return list1;

            //TODO: Decompilation issues!  Looking at method RunQuery as a possible example
            var productSearchParameter = new ProductSearchParameterMorsco { WebSiteId = webSiteId };
            FilterContainer filterNoCategory;
            FilterContainer filterNoPriceFilter;
            //End of decompilation issues

            var hits =
                RunFacetedQuery(GenerateFilters(productSearchParameter, out filterNoCategory, out filterNoPriceFilter),
                    "Categories".ToCamelCase());
            var list2 = hits == null ? new List<CategoryFacetDto>() : FacetProcessor.ProcessCategoryFacets(hits, Guid.Empty);
            CacheManager.Add(key, list2, TimeSpan.FromMinutes(15.0));
            return list2;
        }

        public List<string> GetAllAllowedCategoryIds(Guid? webSiteId = null)
        {
            var cacheKeyProvider = CatalogCacheKeyProvider;

            //TODO: Decompilation issues -- guessed based on context
            var str = "AllCategoryTreeFacets"
                + webSiteId
                + (SiteContext.Current.ShipTo?.Id ?? new Guid());
            //End of decompilation issues

            var key = cacheKeyProvider.BuildKey(str);
            var list1 = CacheManager.Get<List<string>>(key);
            if (list1 != null)
                return list1;

            //TODO: Decompilation issues!  Looking at method RunQuery as a possible example
            var productSearchParameter = new ProductSearchParameterMorsco { WebSiteId = webSiteId };
            FilterContainer filterNoCategory;
            FilterContainer filterNoPriceFilter;
            //End of decompilation issues

            var list2 =
                (RunFacetedQuery(GenerateFilters(productSearchParameter, out filterNoCategory, out filterNoPriceFilter),
                    "CategoryTree".ToCamelCase()) ?? new List<Tuple<string, long>>()).Select(x => x.Item1).ToList();
            CacheManager.Add(key, list2, TimeSpan.FromMinutes(15.0));
            return list2;
        }

        public List<string> GetAllCategoryIds(Guid? webSiteId = null)
        {
            var key = CatalogCacheKeyProvider.BuildKey("CategorySearchAllCategoriesByWebsite" + webSiteId);
            var list1 = CacheManager.Get<List<string>>(key);
            if (list1 != null)
                return list1;
            var filterContainer1 = MakeWebsiteClause(webSiteId);
            var filterContainer2 = MakeLanguageClause();
            var elasticsearchQueryBuilder = QueryBuilder;
            var queries = new List<FilterContainer> { filterContainer1, filterContainer2 };
            var num = 0;
            var list2 =
                (RunFacetedQuery(elasticsearchQueryBuilder.MakeBooleanFilter(queries, (Operation)num), "CategoryTree".ToCamelCase()) ??
                 new List<Tuple<string, long>>()).Select(x => x.Item1).ToList();
            CacheManager.Add(key, list2, TimeSpan.FromMinutes(15.0));
            return list2;
        }

        protected virtual IProductSearchResult RunQuery(IProductSearchParameterMorsco parameter, bool isAutoComplete = false)
        {
            var startdate = DateTime.Now;
            var paramJson = (new JavaScriptSerializer()).Serialize(parameter).Replace(",", ",\n");
            if (EnableSearchLogging)
            {
                LogHelper.For(this).Debug($"Query Parameters:\n{paramJson}");
            }

            var searchCriteria = parameter.SearchCriteria;
            var orCreateByName = ApplicationSettingProvider.GetOrCreateByName<bool>("UseBasicPricing");
            var filterWebsiteId = EnableWebsiteSpecificFilters ? SiteContext.Current.Website.Id.ToString().ToUpper() : string.Empty;
            var query = GenerateQueries(parameter.SearchCriteria, parameter.SearchWithin, isAutoComplete);
            FilterContainer filterNoCategory;
            FilterContainer filterNoPriceFilter;
            var filter = GenerateFilters(parameter, out filterNoCategory, out filterNoPriceFilter);
            var searchDescriptor1 = new SearchDescriptor<ElasticsearchProduct>().Filter(filter);
            if (query != null)
            {
                searchDescriptor1 = !EnableProductBoost
                    ? searchDescriptor1.Query(query)
                    : searchDescriptor1.Query(
                        aa =>
                            aa.FunctionScore(
                                fs =>
                                    fs.Query(q => query)
                                        .Functions(

                                                f => f.FieldValueFactor(fv => fv.Field(p => (object)p.Boost)))
                                        .BoostMode(FunctionBoostMode.Multiply)));
                if (PhraseSuggestConfiguration.Enabled && parameter.IncludeSuggestions)
                {
                    var didYouMeanThreshold =
                        Math.Max(
                            Math.Min(
                                UnitOfWork.GetTypedRepository<IApplicationSettingRepository>()
                                    .GetOrCreateByName<Decimal>("Search_Suggestions_DidYouMean_Threshold"), new Decimal(5)), Decimal.Zero);
                    var autoCorrectThreshold =
                        Math.Max(
                            Math.Min(
                                UnitOfWork.GetTypedRepository<IApplicationSettingRepository>()
                                    .GetOrCreateByName<Decimal>("Search_Suggestions_AutoCorrect_Threshold"), new Decimal(5)), Decimal.Zero);
                    searchDescriptor1 =
                        searchDescriptor1.SuggestPhrase("didyoumean",
                            o => PhraseSuggestConfiguration.Configure(parameter.SearchCriteria, didYouMeanThreshold, o))
                            .SuggestPhrase("correction", o => PhraseSuggestConfiguration.Configure(parameter.SearchCriteria, autoCorrectThreshold, o));
                }
            }
            var sortBy = parameter.SortBy;
            bool priceSort;
            bool manualSort;
            var sortOrder = GetSortOrder(ref sortBy, parameter, out priceSort, out manualSort);
            if (parameter.DoFacetedSearches)
                searchDescriptor1 = AddAggregations(searchDescriptor1, !parameter.SearchCriteria.IsBlank(), query, filterNoCategory, filterNoPriceFilter, filter);
            if (priceSort && !orCreateByName)
            {
                parameter.SortBy = "1";
                sortOrder = GetSortOrder(ref sortBy, parameter, out priceSort, out manualSort);
                parameter.PageSize = ActualPriceSortMaximum;
                parameter.StartRow = 0;
            }
            var searchDescriptor2 =
                AddSortOrder(searchDescriptor1, sortOrder).From(parameter.StartRow).Size(parameter.PageSize);
            var list1 = new List<ProductSearchResultDto>();
            long num1 = 0;
            ISearchResponse<ElasticsearchProduct> result;
            long num2;
            try
            {
                var flag = parameter.DoFacetedSearches &&
                            (parameter.CategoryId.HasValue || parameter.PriceFilters.Any() || parameter.AttributeValueIds.Any() ||
                             !parameter.SearchWithin.IsBlank());
                if (!isAutoComplete && !flag && (sortBy == "1" && !parameter.SearchCriteria.IsBlank()) &&
                    ApplicationSettingProvider.GetOrCreateByName<bool>("Search_SponsoredSearch_Enabled"))
                {
                    var sponsoredResults = GetSponsoredResults(query, filter);
                    var sponsoredDocumentIds = sponsoredResults.Documents.Select(o => o.Id).ToList();
                    num1 += sponsoredDocumentIds.Count;

                    Func<FilterDescriptor<ElasticsearchProduct>, FilterContainer> closure2 = null;

                    //TODO:  Heavily modified to compile from decompiled code
                    searchDescriptor2 = searchDescriptor2.Filter(o => o.And(closure2 ?? (closure2 = p => filter), p => p.Not(q => q.Ids(sponsoredDocumentIds))));
                    if (parameter.StartRow == 0)
                    {
                        var list2 = ConvertSearchProducts(sponsoredResults.Hits);
                        list2.Each(o => o.IsSponsored = true);
                        list1.AddRange(list2);
                        searchDescriptor2 = searchDescriptor2.Size(parameter.PageSize - sponsoredDocumentIds.Count);
                    }
                }
                result = Index.Client.Search<ElasticsearchProduct>(searchDescriptor2);

                var rawQuery = Encoding.UTF8.GetString(result.RequestInformation.Request);
                if (EnableSearchLogging)
                {
                    LogHelper.For(this).Debug($"SearchQuery: {rawQuery}");
                }

                list1.AddRange(ConvertSearchProducts(result.Hits));
                num2 = num1 + result.Total;
            }
            catch (Exception ex)
            {
                AddApplicationLog("Elasticsearch search failed on: '" + searchCriteria + "'\r\n", ex);
                return new ProductSearchResult
                {
                    Products = new List<ProductSearchResultDto>()
                };
            }
            if (ApplicationSettingProvider.GetOrCreateByName<bool>("Search_LogQueries"))
                AddApplicationLog($"Elasticsearch product search ({result.Total} hits): {result.ConnectionStatus}");
            var results = new ProductSearchResult
            {
                Count = (int)num2,
                SortOptions = SortOptions,
                SortOrder = sortBy,
                Products = list1,
                AttributeTypeDtos = ConvertAggregationToAttributeTypeFacets(parameter.CategoryId, result.Aggs, filterWebsiteId),
                CategoryDtos = ConvertAggregationToCategoryFacets(result.Aggs, parameter.CategoryId),
                PriceRangeDto = ConvertAggregationToPriceRangeFacets(result.Aggs)
            };

            if (parameter.IncludeSuggestions && result.Suggest != null)
                SetSuggestions(parameter.SearchCriteria, result, results);
            SetResultSortOptions(results, orCreateByName, ref priceSort);
            if (EnableSearchLogging)
            {
                LogHelper.For(this).Debug($"Search Duration: {DateTime.Now.Subtract(startdate).TotalMilliseconds}ms");
            }

            return results;
        }

        protected List<ProductSearchResultDto> ConvertSearchProducts(IEnumerable<IHit<ElasticsearchProduct>> hits)
        {
            var list = new List<ProductSearchResultDto>();
            foreach (var hit in hits)
            {
                var productSearchResultDto = new ProductSearchResultDto
                {
                    Score = hit.Score,
                    Id = hit.Source.ProductId,
                    Name = hit.Source.Name,
                    ShortDescription = hit.Source.ShortDescription,
                    SmallImagePath = hit.Source.SmallImagePath,
                    MediumImagePath = hit.Source.MediumImagePath,
                    ManufacturerItemNumber = hit.Source.ManufacturerItem,
                    BasicListPrice = hit.Source.BasicListPrice,
                    BasicSalePrice = hit.Source.BasicSalePrice,
                    BasicSaleStartDate = hit.Source.BasicSaleStartDate,
                    BasicSaleEndDate = hit.Source.BasicSaleEndDate,
                    UnitOfMeasure = hit.Source.UnitOfMeasure,
                    ERPNumber = hit.Source.ErpNumber,
                    UrlSegment = hit.Source.ProductUrlSegment,
                    CategoryIds = hit.Source.Categories.Select(x => new Guid(x.Substring(0, 36))).ToList()
                };
                if (SiteContext.Current.BillTo != null)
                {
                    var str = hit.Source.CustomerNames.FirstOrDefault(o => o.StartsWith(SiteContext.Current.BillTo.Id.ToString()));
                    if (str != null)
                    {
                        productSearchResultDto.Name = str.Substring(36);
                        productSearchResultDto.IsNameCustomerOverride = true;
                    }
                }
                list.Add(productSearchResultDto);
            }
            return list;
        }

        protected virtual ISearchResponse<ElasticsearchProduct> GetSponsoredResults(QueryContainer query, FilterContainer filter)
        {
            var filterContainer = new FilterDescriptor<ElasticsearchProduct>().Term("IsSponsored".ToCamelCase(), true);
            var searchDescriptor1 = new SearchDescriptor<ElasticsearchProduct>();
            var elasticsearchQueryBuilder = QueryBuilder;
            var queries = new List<FilterContainer> { filter, filterContainer };
            var num = 0;
            var filterDescriptor = elasticsearchQueryBuilder.MakeBooleanFilter(queries, (Operation)num);
            var searchDescriptor2 = searchDescriptor1.Filter(filterDescriptor);
            var size = Math.Min(Math.Max(ApplicationSettingProvider.GetOrCreateByName<int>("Search_SponsoredSearch_Limit"), 1), 5);
            return Index.Client.Search<ElasticsearchProduct>(searchDescriptor2.Query(query).Size(size));
        }

        protected virtual void SetSuggestions(string searchCriteria, ISearchResponse<ElasticsearchProduct> result, IProductSearchResult productSearchResult)
        {
            Suggest[] suggestArray1;
            if (result.Suggest.TryGetValue("didyoumean", out suggestArray1) && suggestArray1.Length == 1)
                productSearchResult.DidYouMeanSuggestions = suggestArray1[0].Options.Select(o => new SuggestionDto
                {
                    Suggestion = o.Text,
                    HighlightedSuggestion = o.Text,
                    Score = o.Score
                }).Where(o => o.Suggestion != searchCriteria).ToList();
            Suggest[] suggestArray2;
            if (!result.Suggest.TryGetValue("correction", out suggestArray2) || suggestArray2.Length != 1)
                return;
            productSearchResult.AutoCorrectSuggestion = suggestArray2[0].Options.Select(o => new SuggestionDto
            {
                Suggestion = o.Text,
                HighlightedSuggestion = o.Text,
                Score = o.Score
            }).FirstOrDefault();
        }

        protected virtual PriceRangeDto ConvertAggregationToPriceRangeFacets(AggregationsHelper aggregations)
        {
            var aggregationHits = GetAggregationHits(aggregations, "prices");
            if (aggregationHits != null)
                return FacetProcessor.ProcessPriceRangeFacets(aggregationHits, int.MaxValue);
            return new PriceRangeDto();
        }

        protected virtual List<CategoryFacetDto> ConvertAggregationToCategoryFacets(AggregationsHelper aggregations, Guid? categoryId)
        {
            var aggregationHits = GetAggregationHits(aggregations, "categories");
            if (aggregationHits != null)
                return FacetProcessor.ProcessCategoryFacets(aggregationHits, categoryId);
            return new List<CategoryFacetDto>();
        }

        protected virtual List<AttributeTypeFacetDto> ConvertAggregationToAttributeTypeFacets(Guid? categoryId, AggregationsHelper aggregations,
            string filterWebsiteId)
        {
            var aggregationHits = GetAggregationHits(aggregations, "filters");
            if (aggregationHits != null)
                return FacetProcessor.ProcessAttributeTypeFacets(aggregationHits, categoryId);
            return new List<AttributeTypeFacetDto>();
        }

        protected virtual List<Tuple<string, long>> GetAggregationHits(AggregationsHelper aggregations, string key)
        {
            if (aggregations == null || !aggregations.Aggregations.ContainsKey(key))
                return null;
            var singleBucket = aggregations.Aggregations[key] as SingleBucket;
            if (singleBucket == null || !singleBucket.Aggregations.ContainsKey(key))
                return null;
            var bucket = singleBucket.Aggregations[key] as Bucket;
            return bucket?.Items.Select(b => b as KeyItem).Select(k => new Tuple<string, long>(k.Key, k.DocCount)).ToList();
        }

        protected virtual SearchDescriptor<ElasticsearchProduct> AddSortOrder(SearchDescriptor<ElasticsearchProduct> searchDescriptor,
            SortOrderField[] sortOrder)
        {
            foreach (var sortOrderField in sortOrder)
            {
                var sort = sortOrderField;
                searchDescriptor = sort.SearchField != "SCORE"
                    ? (!sort.Reverse
                        ? searchDescriptor.Sort(s => s.OnField(sort.SearchField))
                        : searchDescriptor.Sort(s => s.OnField(sort.SearchField).Descending()))
                    : searchDescriptor.Sort(s => s.OnField("_score"));
            }
            return searchDescriptor;
        }

        protected virtual SearchDescriptor<ElasticsearchProduct> AddAggregations(SearchDescriptor<ElasticsearchProduct> searchDescriptor, bool isSearch,
            QueryContainer queryContainer, FilterContainer filterNoCategory, FilterContainer filterNoPrice, FilterContainer filter)
        {
            var descriptor = new AggregationDescriptor<ElasticsearchProduct>();
            if (isSearch)
                descriptor = descriptor.Filter("categories",
                    f =>
                        f.Filter(fd => filterNoCategory)
                            .Aggregations(ad => ad.Terms("categories", tt => tt.Field("Categories".ToCamelCase()).Size(MaximumFacets))));
            if ((!isSearch || FilterFacetsOnSearch) && EnableAttributeFilters)
                descriptor = descriptor.Filter("filters",
                    f => f.Filter(fd => filter).Aggregations(ad => ad.Terms("filters", tt => tt.Field("Filters".ToCamelCase()).Size(MaximumFacets))));
            if (EnablePriceFaceting)
                descriptor = descriptor.Filter("prices",
                    f => f.Filter(fd => filterNoPrice).Aggregations(ad => ad.Terms("prices", tt => tt.Field("PriceFacet".ToCamelCase()).Size(MaximumFacets))));
            return searchDescriptor.Aggregations(x => descriptor);
        }

        protected List<Tuple<string, long>> RunFacetedQuery(FilterContainer filter, string facetField)
        {
            var key1 = facetField;
            var searchRequest1 = new SearchRequest();
            var dictionary1 = new Dictionary<string, IAggregationContainer>();
            var key2 = key1;
            var aggregationContainer = new AggregationContainer
            {
                Filter = new FilterAggregator
                {
                    Filter = filter
                }
            };
            var dictionary2 = new Dictionary<string, IAggregationContainer>();
            var key3 = key1;
            dictionary2.Add(key3, new AggregationContainer
            {
                Terms = new TermsAggregator
                {
                    Field = facetField,
                    Size = MaximumFacets
                }
            });
            aggregationContainer.Aggregations = dictionary2;
            dictionary1.Add(key2, aggregationContainer);
            searchRequest1.Aggregations = dictionary1;
            var searchRequest2 = searchRequest1;
            ISearchResponse<ElasticsearchProduct> searchResponse;
            try
            {
                searchResponse = Index.Client.Search<ElasticsearchProduct>(searchRequest2);
            }
            catch (WebException ex)
            {
                var str1 = "Elasticsearch server not found:";
                var innerException = ex.InnerException;
                var str2 = innerException?.Message;
                throw new Exception(str1 + str2);
            }
            return GetAggregationHits(searchResponse.Aggs, key1);
        }

        protected virtual void AddApplicationLog(string message, Exception ex = null)
        {
            if (ex == null)
                LogHelper.For(this).Info(message);
            else
                LogHelper.For(this).Error(message);
        }

        protected virtual void SetResultSortOptions(ProductSearchResult results, bool useBasicPricing, ref bool priceSort)
        {
            if (!useBasicPricing && results.Count > ActualPriceSortMaximum)
            {
                results.SortOptions = SortOptions.Where(so =>
                {
                    if (so.SortType != "4")
                        return so.SortType != "5";
                    return false;
                }).ToList();
                if (!priceSort)
                    return;
                results.SortOrder = "1";
                priceSort = false;
            }
            else
                results.SortOptions = SortOptions;
        }

        protected virtual FilterContainer MakeCustomFilter(bool search)
        {
            return null;
        }

        protected virtual QueryContainer GenerateQueries(string searchCriteria, string searchWithinCriteria, bool autoComplete)
        {
            var billTo = SiteContext.Current.BillTo;
            var shipTo = SiteContext.Current.ShipTo;
            if (searchCriteria.IsBlank() && searchWithinCriteria.IsBlank())
                return null;
            QueryContainer queryContainer1 = null;
            QueryContainer queryContainer2 = null;
            if (!searchCriteria.IsBlank())
            {
                var num = ApplicationSettingProvider.GetOrCreateByName<bool>("Search_FuzzySearch_Enabled") ? 1 : 0;
                var queryContainer3 = QueryBuilder.MakeMultimatchQuery(searchCriteria, GetExactMatchFields());
                var queryContainer4 = autoComplete ? QueryBuilder.MakeMultimatchPrefixQuery(searchCriteria, GetPrefixMatchFields()) : null;
                var queryContainer5 = QueryBuilder.MakeMultiMatchPhraseQuery(searchCriteria, GetPhraseMatchFields());
                var queryContainer6 = num != 0 ? QueryBuilder.MakeMultiMatchFuzzyQuery(searchCriteria, GetFuzzyMatchFields()) : null;
                var queryContainer7 = MakeCustomerNameQuery(searchCriteria, billTo, shipTo);
                queryContainer1 = QueryBuilder.MakeBooleanQuery(new[]
                {
                    queryContainer3,
                    queryContainer5,
                    queryContainer6,
                    queryContainer4,
                    queryContainer7
                }.Where(q => q != null).ToList(), Operation.Or);
            }
            if (!searchWithinCriteria.IsBlank())
                queryContainer2 = QueryBuilder.MakeMultimatchQuery(searchWithinCriteria, GetExactMatchFields(), true, "Query_SearchWithin");
            if (queryContainer1 == null || queryContainer2 == null)
                return queryContainer1 ?? queryContainer2;
            var elasticsearchQueryBuilder = QueryBuilder;
            var queries = new List<QueryContainer> { queryContainer1, queryContainer2 };
            var num1 = 0;
            return elasticsearchQueryBuilder.MakeBooleanQuery(queries, (Operation)num1);
        }

        protected virtual FilterContainer GenerateFilters(IProductSearchParameterMorsco parameter, out FilterContainer filterNoCategory,
            out FilterContainer filterNoPriceFilter)
        {
            var billTo = SiteContext.Current.BillTo;
            var shipTo = SiteContext.Current.ShipTo;
            var search = !parameter.SearchCriteria.IsBlank();
            var filterContainer1 = MakeCustomerProductClause(billTo);
            var filterContainer2 = MakeRestrictionGroupClause(billTo, shipTo);

            if (parameter.CategoryId.HasValue)
            {
                if (parameter.CategoryIds == null)
                {
                    parameter.CategoryIds = new List<string> { parameter.CategoryId.ToString() };
                }
                else if (!parameter.CategoryIds.Contains(parameter.CategoryId.ToString()))
                {
                    parameter.CategoryIds.Add(parameter.CategoryId.ToString());
                }
            }
            var filterContainer3 = MakeCategoryClause(parameter.SearchCriteria, parameter.CategoryIds);

            FilterContainer filterContainer4 = null;
            if (parameter.AttributeValueIds != null && parameter.AttributeValueIds.Count > 0)
                filterContainer4 = MakeFilterQuery(parameter.AttributeValueIds);
            var filterContainer5 = MakeWebsiteClause(parameter.WebSiteId);
            var filterContainer6 = MakeLanguageClause();
            var filterContainer7 = MakeCustomFilter(search);
            var filterContainer8 = MakePriceRangeFilter(parameter.MinimumPrice, parameter.MaximumPrice, parameter.PriceFilters);
            FilterContainer filterContainer9 = null;
            if (parameter.AllowedProductIds != null)
                filterContainer9 = MakeProductClause(parameter.AllowedProductIds);
            var queries = new[]
            {
                filterContainer4,
                filterContainer5,
                filterContainer6,
                filterContainer7,
                filterContainer8,
                filterContainer2,
                filterContainer9,
                filterContainer1
            }.Where(q => q != null).ToList();
            filterNoCategory = QueryBuilder.MakeBooleanFilter(queries.Select(q => q).ToList(), Operation.And);
            if (filterContainer3 != null)
                queries.Add(filterContainer3);
            if (filterContainer8 != null)
            {
                filterNoPriceFilter = QueryBuilder.MakeBooleanFilter(queries.Select(q => q).ToList(), Operation.And);
                queries.Add(filterContainer8);
                return QueryBuilder.MakeBooleanFilter(queries, Operation.And);
            }
            filterNoPriceFilter = QueryBuilder.MakeBooleanFilter(queries, Operation.And);
            return filterNoPriceFilter;
        }

        protected virtual List<string> GetExactMatchFields()
        {
            return new List<string>
            {
                "Name".ToCamelCase(),
                "StyledChildren".ToCamelCase(),
                "ErpNumber".ToCamelCase(),
                "ShortDescription".ToCamelCase(),
                "CategoryNames".ToCamelCase(),
                "ManufacturerItem".ToCamelCase(),
                "FilterNames".ToCamelCase(),
                "SearchLookup".ToCamelCase(),
                "Content".ToCamelCase(),
                "Specifications".ToCamelCase()
            };
        }

        protected virtual List<string> GetPrefixMatchFields()
        {
            return new List<string>
            {
                "Name".ToCamelCase(),
                "StyledChildren".ToCamelCase(),
                "ErpNumber".ToCamelCase(),
                "ShortDescription".ToCamelCase(),
                "CategoryNames".ToCamelCase(),
                "ManufacturerItem".ToCamelCase(),
                "FilterNames".ToCamelCase(),
                "SearchLookup".ToCamelCase(),
                "Content".ToCamelCase(),
                "Specifications".ToCamelCase()
            };
        }

        protected virtual List<string> GetPhraseMatchFields()
        {
            return new List<string>
            {
                "StyledChildren".ToCamelCase(),
                "ShortDescription".ToCamelCase(),
                "CategoryNames".ToCamelCase(),
                "Content".ToCamelCase(),
                "Specifications".ToCamelCase()
            };
        }

        protected virtual List<string> GetFuzzyMatchFields()
        {
            return new List<string>
            {
                "ShortDescription".ToCamelCase(),
                "CategoryNames".ToCamelCase()
            };
        }

        protected void AddFieldBoostValues(List<PropertyPathMarker> fields)
        {
            foreach (var propertyPathMarker1 in fields)
            {
                var propertyPathMarker2 = propertyPathMarker1;
                var boostValue = BoostHelper.GetBoostValue("Field_" + propertyPathMarker1.Name);
                var nullable = boostValue.HasValue ? boostValue.GetValueOrDefault() : new double?();
                propertyPathMarker2.Boost = nullable;
            }
        }

        protected virtual QueryContainer MakeCustomerNameQuery(string search, Customer currentCustomer, Customer currentShipTo)
        {
            var queries = new List<QueryContainer>();
            var boostValue = BoostHelper.GetBoostValue("Query_CustomerName");
            Guid id;
            if (currentCustomer != null)
            {
                var list = queries;
                var elasticsearchQueryBuilder = QueryBuilder;
                var field = "CustomerNames".ToCamelCase();
                id = currentCustomer.Id;
                var str = id.ToString().ToLower() + search.ToLower();
                var num1 = 1;
                var num2 = 0;
                var boost = boostValue;
                var queryContainer = elasticsearchQueryBuilder.MakeFieldQuery(field, str, (FieldMatch)num1, num2 != 0, boost);
                list.Add(queryContainer);
            }
            if (currentShipTo != null)
            {
                var list = queries;
                var elasticsearchQueryBuilder = QueryBuilder;
                var field = "CustomerNames".ToCamelCase();
                id = currentShipTo.Id;
                var str = id.ToString().ToLower() + search.ToLower();
                var num1 = 1;
                var num2 = 0;
                var boost = boostValue;
                var queryContainer = elasticsearchQueryBuilder.MakeFieldQuery(field, str, (FieldMatch)num1, num2 != 0, boost);
                list.Add(queryContainer);
            }
            if (queries.Count == 0)
                return null;
            if (queries.Count == 1)
                return queries[0];
            return QueryBuilder.MakeBooleanQuery(queries, Operation.Or);
        }

        protected virtual FilterContainer MakeFilterQuery(List<string> attributeValueIds)
        {
            var str = EnableWebsiteSpecificFilters ? SiteContext.Current.Website.Id.ToString() : string.Empty;
            var list = new List<AttributeTypeFacetDto>();
            foreach (var id in attributeValueIds)
            {
                var attributeValue = UnitOfWork.GetRepository<AttributeValue>().Get(id);
                var attributeTypeFacetDto = list.FirstOrDefault(a =>
                {
                    if (attributeValue != null)
                        return a.AttributeTypeId == attributeValue.AttributeType.Id;
                    return false;
                });
                if (attributeTypeFacetDto == null)
                {
                    attributeTypeFacetDto = new AttributeTypeFacetDto
                    {
                        AttributeTypeId = attributeValue.AttributeType.Id,
                        Name = attributeValue.AttributeType.Name
                    };
                    list.Add(attributeTypeFacetDto);
                }
                attributeTypeFacetDto.AttributeValueFacets.Add(new AttributeValueFacetDto
                {
                    AttributeValueId = attributeValue.Id,
                    Value = attributeValue.Value
                });
            }
            var queries1 = new List<FilterContainer>();
            foreach (var attributeTypeFacetDto in list)
            {
                var queries2 = new List<FilterContainer>();
                foreach (var attributeValueFacetDto in attributeTypeFacetDto.AttributeValueFacets)
                    queries2.Add(QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("Filters".ToCamelCase() + str,
                        attributeValueFacetDto.AttributeValueId.ToString().ToUpper(), FieldMatch.Prefix));
                queries1.Add(QueryBuilder.MakeBooleanFilter(queries2, Operation.Or));
            }
            return QueryBuilder.MakeBooleanFilter(queries1, Operation.And);
        }

        protected virtual FilterContainer MakeCustomerProductClause(Customer currentCustomer)
        {
            var str1 =
                UnitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>()
                    .GetOrCreateByName<string>("CustomerProductsInclude", SiteContext.Current.Website.Id)
                    .ToLower();
            if (currentCustomer != null && str1 != "ignore")
            {
                var str2 = currentCustomer.Id.ToString();
                if (str1.Equals("true", StringComparison.OrdinalIgnoreCase))
                    return QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("Customers".ToCamelCase(), str2);
                if (str1.Equals("false", StringComparison.OrdinalIgnoreCase))
                    return QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("Customers".ToCamelCase(), str2, FieldMatch.All, true);
            }
            return null;
        }

        protected virtual FilterContainer MakeWebsiteClause(Guid? websiteId = null)
        {
            if (!websiteId.HasValue && SiteContext.Current.Website == null)
                return null;
            return QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("Websites".ToCamelCase(), (websiteId ?? SiteContext.Current.Website.Id).ToString());
        }

        protected virtual FilterContainer MakeLanguageClause()
        {
            var language = SiteContext.Current.Language;
            if (language == null)
                return null;
            return QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("LanguageCode".ToCamelCase(), language.LanguageCode.ToLower());
        }

        protected virtual FilterContainer MakeRestrictionGroupClause(Customer currentCustomer, Customer currentShipTo)
        {
            if (!UnitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>().GetOrCreateByName<bool>("RestrictionsByItem", SiteContext.Current.Website.Id))
                return null;
            FilterContainer filterContainer = null;
            var queries = MakeRestrictionGroupFilters(currentCustomer, currentShipTo);
            if (queries != null)
                filterContainer = QueryBuilder.MakeBooleanNotFilter(queries, Operation.Or);
            return filterContainer;
        }

        protected virtual List<FilterContainer> MakeRestrictionGroupFilters(Customer currentCustomer, Customer currentShipTo)
        {
            if (!UnitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>().GetOrCreateByName<bool>("RestrictionsByItem", SiteContext.Current.Website.Id))
                return null;
            if (RestrictionGroups == null || RestrictionGroups.Count == 0)
                return null;
            if (currentShipTo != null && currentShipTo.IgnoreProductRestrictions)
                return null;
            if (currentCustomer != null && currentCustomer.IgnoreProductRestrictions)
                return null;
            var list = new List<FilterContainer>();
            IQueryable<CustomerRestrictionGroup> source1 = null;
            IQueryable<CustomerRestrictionGroup> source2 = null;
            if (currentShipTo != null)
                source1 = UnitOfWork.GetRepository<CustomerRestrictionGroup>().GetTable().Where(x => x.CustomerId == currentShipTo.Id);
            if (currentCustomer != null)
                source2 = UnitOfWork.GetRepository<CustomerRestrictionGroup>().GetTable().Where(x => x.CustomerId == currentCustomer.Id);
            foreach (var restrictionGroup1 in RestrictionGroups.Where(r => r.DefaultCondition == "Include All"))
            {
                var allowGroup = restrictionGroup1;
                var filterContainer = QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("RestrictionGroupId".ToCamelCase(),
                    allowGroup.Id.ToString().ToLower());
                var restrictionGroup3 = source1?.FirstOrDefault(o => o.RestrictionGroupId.Equals(allowGroup.Id)) ??
                                        source2?.FirstOrDefault(o => o.RestrictionGroupId.Equals(allowGroup.Id));
                if (restrictionGroup3 != null)
                {
                    if (!restrictionGroup3.Products.Any())
                    {
                        list.Add(filterContainer);
                    }
                    else
                    {
                        foreach (var guid in restrictionGroup3.Products.Select(p => p.Id))
                            list.Add(QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("ProductId".ToCamelCase(), guid.ToString().ToLower()));
                    }
                }
            }
            foreach (var restrictionGroup1 in RestrictionGroups.Where(r => r.DefaultCondition != "Include All"))
            {
                var denyGroup = restrictionGroup1;
                var filterContainer1 = QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("RestrictionGroupId".ToCamelCase(),
                    denyGroup.Id.ToString().ToLower());
                var restrictionGroup3 = source1?.FirstOrDefault(o => o.RestrictionGroupId.Equals(denyGroup.Id)) ??
                                        source2?.FirstOrDefault(o => o.RestrictionGroupId.Equals(denyGroup.Id));
                if (restrictionGroup3 == null)
                    list.Add(filterContainer1);
                else if (restrictionGroup3.Products.Any())
                {
                    var queries1 = new List<FilterContainer>();
                    var queries2 = new List<FilterContainer>();
                    queries1.Add(filterContainer1);
                    foreach (var guid in restrictionGroup3.Products.Select(p => p.Id))
                        queries2.Add(QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("ProductId".ToCamelCase(), guid.ToString().ToLower()));
                    var filterContainer2 = QueryBuilder.MakeBooleanNotFilter(queries2, Operation.Or);
                    queries1.Add(filterContainer2);
                    list.Add(QueryBuilder.MakeBooleanFilter(queries1, Operation.And));
                }
            }
            if (list.Count == 0)
                return null;
            return list;
        }

        protected virtual FilterContainer MakeProductClause(List<Guid> allowedProductIds)
        {
            return
                QueryBuilder.MakeBooleanFilter(
                    allowedProductIds.Select(
                        guid => QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("ProductId".ToCamelCase(), guid.ToString().ToLower()))
                        .ToList(), Operation.Or);
        }

        protected virtual FilterContainer MakeCategoryClause(string searchCriteria, List<string> categoryIds)
        {
            FilterContainer filterContainer = null;
            if (categoryIds != null && categoryIds.Count > 0)
            {
                filterContainer = !searchCriteria.IsBlank()
                    ? QueryBuilder.MakeFieldMultivalueFilter<ElasticsearchProduct>("CategoryTree".ToCamelCase(), categoryIds)
                    : QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("Categories".ToCamelCase(), categoryIds[0], FieldMatch.Prefix, false);
            }
            return filterContainer;
        }

        protected virtual FilterContainer MakePriceRangeFilter(Decimal? minPrice, Decimal? maxPrice, List<int> priceFilters)
        {
            if (priceFilters != null && priceFilters.Count > 0)
                return
                    QueryBuilder.MakeBooleanFilter(
                        priceFilters.Select(
                            priceFilter =>
                                QueryBuilder.MakeFieldFilter<ElasticsearchProduct>("PriceFacet".ToCamelCase(),
                                    priceFilter.ToString(CultureInfo.InvariantCulture))).ToList(), Operation.Or);
            if (!minPrice.HasValue && !maxPrice.HasValue)
                return null;
            var nullable = minPrice;
            var num1 = nullable ?? Decimal.Zero;
            nullable = maxPrice;
            var num2 = nullable ?? new Decimal(1000000);
            return QueryBuilder.MakeNumericRangeFilter<ElasticsearchProduct>("Price".ToCamelCase(), num1, num2);
        }

        protected virtual SortOrderField[] MakeCustomSortOrder(string sortBy, IProductSearchParameterMorsco parameter, out bool manualSort)
        {
            manualSort = false;
            return null;
        }

        protected virtual SortOrderField[] GetSortOrder(ref string sortBy, IProductSearchParameterMorsco parameter, out bool priceSort, out bool manualSort)
        {
            priceSort = false;
            if (string.IsNullOrEmpty(sortBy))
                sortBy = "1";
            var sortOrderFieldArray1 = MakeCustomSortOrder(sortBy, parameter, out manualSort);
            SortOrderField[] sortOrderFieldArray2;
            if (sortOrderFieldArray1 != null)
            {
                sortOrderFieldArray2 = sortOrderFieldArray1;
            }
            else
            {
                var str = sortBy;
                if (str != "6")
                {
                    if (str != "7")
                    {
                        if (str != "4")
                        {
                            if (str != "5")
                            {
                                if (str != "2")
                                {
                                    if (str == "3")
                                        sortOrderFieldArray2 = new[]
                                        {
                                            new SortOrderField("ShortDescriptionSort".ToCamelCase(), false, true)
                                        };
                                    else if (!parameter.SearchCriteria.IsBlank() || !parameter.SearchWithin.IsBlank())
                                        sortOrderFieldArray2 = new[]
                                        {
                                            new SortOrderField("SCORE", true, true),
                                            new SortOrderField("ShortDescriptionSort".ToCamelCase())
                                        };
                                    else
                                        sortOrderFieldArray2 = new[]
                                        {
                                            new SortOrderField("SortOrder".ToCamelCase(), true, true),
                                            new SortOrderField("ShortDescriptionSort".ToCamelCase())
                                        };
                                }
                                else
                                    sortOrderFieldArray2 = new[]
                                    {
                                        new SortOrderField("ShortDescriptionSort".ToCamelCase())
                                    };
                            }
                            else
                            {
                                sortOrderFieldArray2 = new[]
                                {
                                    new SortOrderField("Price".ToCamelCase(), true, true),
                                    new SortOrderField("ShortDescriptionSort".ToCamelCase())
                                };
                                priceSort = true;
                            }
                        }
                        else
                        {
                            sortOrderFieldArray2 = new[]
                            {
                                new SortOrderField("Price".ToCamelCase(), true),
                                new SortOrderField("ShortDescriptionSort".ToCamelCase())
                            };
                            priceSort = true;
                        }
                    }
                    else
                        sortOrderFieldArray2 = new[]
                        {
                            new SortOrderField("Name".ToCamelCase(), false, true)
                        };
                }
                else
                    sortOrderFieldArray2 = new[]
                    {
                        new SortOrderField("Name".ToCamelCase())
                    };
            }
            return sortOrderFieldArray2;
        }
    }
}