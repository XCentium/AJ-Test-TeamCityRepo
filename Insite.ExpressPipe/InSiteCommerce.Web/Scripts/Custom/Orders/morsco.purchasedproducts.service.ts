/// <reference path="../../../Scripts/App/_typelite/insite.models.d.ts" />
/// <reference path="../../../Scripts/App/core/insite.core.service.ts"/>

module insite.order {
    "use strict";

    export interface IPurchasedProductsService {
        getPurchasedProducts(page: number, perPage: number, searchTerm: string): ng.IPromise<ProductCollectionModel>;
    }

    export class PurchasedProductsService implements IPurchasedProductsService {

        serviceUri = this.coreService.getApiUri("/api/morsco/producthistory/");
        constructor(protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getPurchasedProducts(page: number, perPage: number, searchTerm: string): ng.IPromise<ProductCollectionModel> {
            var uri = this.serviceUri;

            uri += "getPurchasedProducts?page=" + page;
            uri += "&perPage=" + perPage;
            if (searchTerm) {
                uri += "&searchTerm=" + searchTerm;
            }

            uri = uri.replace(/&$/, "");
            var deferred = this.$q.defer();
            this.$http.get(uri, { timeout: deferred.promise })
                .success((result: ProductCollectionModel) => deferred.resolve(result))
                .error((data, status) => {
                var error = { data: data, status: status };
                deferred.reject(error);
                });
            return deferred.promise;

            //return this.$http.get(uri, { bypassErrorInterceptor: true });
        }
    }

    function factory($rootScope: ng.IRootScopeService, $http: ng.IHttpService, $q: ng.IQService, coreService: core.ICoreService): PurchasedProductsService {
        return new PurchasedProductsService($rootScope, $http, $q, coreService);
    }
    factory.$inject = ["$rootScope", "$http", "$q", "coreService"];

    angular
        .module("insite")
        .factory("purchasedProductsService", factory);
}
 