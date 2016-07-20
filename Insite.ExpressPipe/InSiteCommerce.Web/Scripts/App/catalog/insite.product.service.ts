/// <reference path="../_typelite/insite.models.d.ts" />
/// <reference path="../core/insite.core.service.ts"/>

import IProductService = insite.catalog.IProductService;
import ProductDto = Insite.Catalog.Services.Dtos.ProductDto;
import AttributeTypeDto = Insite.Catalog.Services.Dtos.AttributeTypeDto;
import ProductModel = Insite.Catalog.WebApi.V1.ApiModels.ProductModel;
import ProductCollectionModel = Insite.Catalog.WebApi.V1.ApiModels.ProductCollectionModel;
import CatalogPageModel = Insite.Catalog.WebApi.V1.ApiModels.CatalogPageModel;
import CategoryModel = Insite.Catalog.WebApi.V1.ApiModels.CategoryModel;
import CategoryCollectionModel = Insite.Catalog.WebApi.V1.ApiModels.CategoryCollectionModel;
import ProductPriceModel = Insite.Catalog.WebApi.V1.ApiModels.ProductPriceModel;
import CrossSellCollectionModel = Insite.Catalog.WebApi.V1.ApiModels.CrossSellCollectionModel;
import ProductSettingsModel = Insite.Catalog.WebApi.V1.ApiModels.ProductSettingsModel;
import ConfigSectionDto = Insite.Catalog.Services.Dtos.ConfigSectionDto;
import ConfigSectionOptionDto = Insite.Catalog.Services.Dtos.ConfigSectionOptionDto;
import StyleTraitDto = Insite.Catalog.Services.Dtos.StyleTraitDto;
import StyledProductDto = Insite.Catalog.Services.Dtos.StyledProductDto;
import StyleValueDto = Insite.Catalog.Services.Dtos.StyleValueDto;
import BreadCrumbModel = Insite.Catalog.WebApi.V1.ApiModels.BreadCrumbModel;

module insite.catalog {
    "use strict";

    // parameters accepted by get getProductCollection
    export interface IProductCollectionParameters {
        categoryId?: System.Guid;
        query?: string;
        page?: number;
        pageSize?: number;
        sort?: string;
        attributeValueIds?: string[];
        priceFilters?: string[];    
        productIds?: System.Guid[];
        names?: string[];
        erpNumbers?: string[];
        extendedNames?: string[];
        replaceProducts?: boolean;
        priceParameters?: IProductPriceParameter;
        includeSuggestions?: string; 
        searchWithin?: string;
    }

    export interface IProductPriceParameter {
        productId: string;
        unitOfMeasure?: string;
        qtyOrdered?: number;
        configuration?: string[];
    }

    export interface IProductService {
        changeUnitOfMeasure(product: ProductDto, refreshPrice?: boolean): ProductDto;
        getProductPrice(product: ProductDto, configuration?: string[]): ng.IPromise<ProductPriceModel>;        
        getCatalogPage(path: string): ng.IPromise<CatalogPageModel>;
        getCategoryTree(startCategoryId?: string, maxDepth?: number): ng.IHttpPromise<CategoryCollectionModel>;
        getCategory(categoryId?: string): ng.IHttpPromise<CategoryModel>;
        /*
         * Fetch one product by id
         * @param categoryId Id of the category the product is in
         * @param productId Id of the product         
         * @param expand Specifies which optional data to bring back. valid values are ["documents", "specifications", "styledproducts", "htmlcontent", "attributes", "crosssells", "pricing"]
         */
        getProductData(categoryId: string, productId: string, expand?: string[]): ng.IPromise<ProductModel>;
        /*
         * Fetch a group of products
         * @param parameters An IProductCollectionParameters specifying the products
         * @param expand Specifies which optional data to bring back. valid values are ["documents", "specifications", "styledproducts", "htmlcontent", "attributes", "crosssells", "pricing", "facets"]
         */
        getProductCollectionData(parameters: IProductCollectionParameters, expand?: string[]): ng.IPromise<ProductCollectionModel>;
        getProductSettings(): ng.IPromise<ProductSettingsModel>;
        getCrossSells(productId: string): ng.IPromise<CrossSellCollectionModel>;
    }    

    export class ProductService implements IProductService {
        productServiceUri = this.coreService.getApiUri("/api/v1/products/");
        categoryServiceUri = this.coreService.getApiUri("/api/v1/categories");
        catalogPageServiceUri = this.coreService.getApiUri("/api/v1/catalogpages");
        productPriceUri = this.coreService.getApiUri("/api/v1/products/{productId}/price");
        productCrossSellUri = this.coreService.getApiUri("/api/v1/products/{productId}/crosssells");
        webCrossSellUri = this.coreService.getApiUri("/api/v1/websites/current/crosssells");
        productSettingsUri = this.coreService.getApiUri("/api/v1/settings/products");

        constructor(
            protected $http: ng.IHttpService,            
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        changeUnitOfMeasure(product: ProductDto, refreshPrice = true): ProductDto {
            // update unit of measure
            product.unitOfMeasure = product.selectedUnitOfMeasure;
            var selectedUofMObject = this.coreService.getObjectByPropertyValue(product.productUnitOfMeasures, { unitOfMeasure: product.selectedUnitOfMeasure });             
            product.unitOfMeasureDisplay = selectedUofMObject.unitOfMeasureDisplay;
            // update price
            if (!product.quoteRequired && refreshPrice) {
                this.getProductPrice(product);
            }
            return product;
        }

        // updates the pricing on a product object based on the qtyOrdered, selectedUnitOfMeasure and array of configuration guids
        getProductPrice(product: ProductDto, configuration?: string[]): ng.IPromise<ProductPriceModel> {
            var parameters = {
                unitOfMeasure: product.selectedUnitOfMeasure,
                qtyOrdered: product.qtyOrdered
            };
            var query = "?" + this.coreService.parseParameters(parameters);
            if (configuration) {
                angular.forEach(configuration, function (value) {
                    query += "configuration=" + value + "&";
                });
            }
            var uri = this.productPriceUri.replace("{productId}", product.id.toString()) + query;
            var deferred = this.$q.defer();
            this.$http.get(uri)
                .success(function (result: ProductPriceModel) {
                    product.pricing = result; // pricing result is the same format
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getCatalogPage(path: string): ng.IPromise<CatalogPageModel> {
            // check for server side data
            if ((<any>insite.catalog).catalogPageGlobal) {
                var deferred = this.$q.defer();
                deferred.resolve((<any>insite.catalog).catalogPageGlobal);
                return deferred.promise;
            }

            var uri = this.catalogPageServiceUri + "?path=" + path;
            var deferred = this.$q.defer();
            this.$http.get(uri)
                .success(function (result) {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getCategoryTree(startCategoryId?: string, maxDepth?: number): ng.IHttpPromise<CategoryCollectionModel> {
            var uri = this.categoryServiceUri;
            if (startCategoryId || maxDepth) {
                uri += "?startCategoryId=" + startCategoryId + "&maxDepth=" + maxDepth;
            }
            return this.$http.get(uri);
        }

        getCategory(categoryId?: string): ng.IHttpPromise<CategoryModel> {
            var uri = this.categoryServiceUri + "/" + categoryId;            
            return this.$http.get(uri);
        }
        
        getProductData(categoryId: string, productId: string, expand?: string[]): ng.IPromise<ProductModel> {
            var query = "?";
            if (expand)
                query += ("expand=" + expand.join()) + "&";
            if (categoryId)
                query += "categoryid=" + categoryId + "&";
            var uri = this.productServiceUri + productId + query;
            var deferred = this.$q.defer(); 
            this.$http.get(uri, { bypassErrorInterceptor: true })
                .success(function (result) {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getProductCollectionData(parameters: IProductCollectionParameters, expand?: string[]): ng.IPromise<ProductCollectionModel> {
            var query = "?" + this.coreService.parseParameters(parameters);
            if (expand) query += ("expand=" + expand.join());
            var uri = this.productServiceUri + query;
            var deferred = this.$q.defer();
            this.$http.get(uri, { timeout: deferred.promise })
                .success((result: ProductCollectionModel) => deferred.resolve(result))
                .error((data, status) => {
                var error = { data: data, status: status };
                deferred.reject(error);
            });

            (<any>deferred.promise).cancel = () => {
                deferred.resolve("cancelled"); 
            };

            return deferred.promise;
        }

        getProductSettings(): ng.IPromise<ProductSettingsModel> {
            var deferred = this.$q.defer();
            this.$http.get(this.productSettingsUri)
                .success(function (result: ProductSettingsModel) {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        // get cross sells for a product or pass no parameter to get web cross sells
        getCrossSells(productId: string): ng.IPromise<CrossSellCollectionModel> {
            var uri: string;
            if (productId) {
                uri = this.productCrossSellUri.replace("{productId}", productId);
            } else {
                uri = this.webCrossSellUri;
            }

            var deferred = this.$q.defer();
            this.$http.get(uri)
                .success(function (result: CrossSellCollectionModel) {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    factory.$inject = ["$http", "$q", "coreService"];
    function factory(
        $http: ng.IHttpService,
        $q: ng.IQService,
        coreService: core.ICoreService): ProductService {
        return new ProductService($http, $q, coreService);
    }

    angular
        .module("insite")
        .factory("productService", factory);

}