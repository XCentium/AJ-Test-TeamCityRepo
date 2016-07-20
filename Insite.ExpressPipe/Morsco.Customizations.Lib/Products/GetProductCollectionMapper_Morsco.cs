using System.Linq;
using System.Net.Http;
using AutoMapper;
using Insite.Catalog.Services.Parameters;
using Insite.Catalog.Services.Results;
using Insite.Catalog.WebApi.V1.ApiModels;
using Insite.Catalog.WebApi.V1.Mappers;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi.Extensions;
using Insite.Core.WebApi.Interfaces;
using System.Collections.Generic;

namespace Morsco.Customizations.Lib.Products
{
    public class GetProductCollectionMapper_Morsco : GetProductCollectionMapper
    {
        public GetProductCollectionMapper_Morsco(IUrlHelper urlHelper, IObjectToObjectMapper objectToObjectMapper)
            : base(urlHelper, objectToObjectMapper)
        { }

        public override ProductCollectionModel MapResult(GetProductCollectionResult getProductCollectionResult, HttpRequestMessage request)
        {
            if (getProductCollectionResult.ProductDtos != null)
            {
                foreach (var dto in getProductCollectionResult.ProductDtos)
                {
                    foreach (var attr in dto.AttributeTypes)
                    {
                        //todo : Why is this null?  insite bug?
                        var collectionAttr = getProductCollectionResult.AttributeTypeDtos?.FirstOrDefault(x => x.Name == attr.Name);
                        if (collectionAttr != null)
                        {
                            attr.SortOrder = collectionAttr.Sort;
                        }
                    }
                    ClearPricesIfNotAllowed(dto, true);
                }
            }
            var productCollectionModel = new ProductCollectionModel
            {
                Uri = UrlHelper.Link("ProductsV1", null, request),
                Pagination = MakePaging(request, getProductCollectionResult),
                Products = getProductCollectionResult.ProductDtos,
                CategoryFacets = getProductCollectionResult.CategoryDtos,
                AttributeTypeFacets = getProductCollectionResult.AttributeTypeDtos,
                PriceRange = getProductCollectionResult.PriceRangeDto,
                ExactMatch = getProductCollectionResult.ExactMatch,
                NotAllProductsAllowed = getProductCollectionResult.NotAllProductsAllowed,
                NotAllProductsFound = getProductCollectionResult.NotAllProductsFound
            };
            return productCollectionModel;
        }

        public override GetProductCollectionParameter MapParameter(ProductCollectionParameter apiParameter, HttpRequestMessage request)
        {
            var destination = new GetProductCollectionParameter();
            Mapper.Map(apiParameter, destination);
            if (apiParameter != null)
            {
                var page = apiParameter.Page;
                destination.StartPage = page.HasValue ? page.GetValueOrDefault() : 1;
                if (!string.IsNullOrEmpty(request.GetQueryString("filterCategoryIds")))
                {

                    var filterCategoryIds = request.GetQueryNameValuePairs().Where(x => x.Key == "filterCategoryIds");
                    var filterCategoryIdString = string.Empty;
                    foreach(var filterCategory in filterCategoryIds)
                    {
                        filterCategoryIdString += (string.IsNullOrEmpty(filterCategoryIdString) ? "" : ",") + filterCategory.Value;
                    }
                    destination.Properties["filterCategoryIds"] = filterCategoryIdString;
                }
            }
            var source = MapExpandParameters(destination, request);
            destination.DoFacetedSearches = source.Contains("facets");
            string[] strArray = this.MapExpandParameters((GetProductsParameterBase)destination, request);
            var noPrices = new bool?(Enumerable.Contains<string>((IEnumerable<string>)strArray, "noprices"));
            destination.Properties.Add("noPrices", noPrices.ToString());
            destination.GetPrices = (bool)!noPrices;
            return destination;
        }
    }
}

