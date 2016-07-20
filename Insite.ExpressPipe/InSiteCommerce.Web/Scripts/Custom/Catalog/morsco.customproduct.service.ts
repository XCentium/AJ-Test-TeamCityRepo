/// <reference path="../../../Scripts/App/_typelite/insite.models.d.ts" />
/// <reference path="../../../Scripts/App/core/insite.core.service.ts"/>

module insite.catalog {
    "use strict";

    export interface ISearchFilter {
        customerSequence: string;
        sort: string;
    }

    export interface ICustomProductService {
        setAvailability(warehouses: {}, availability: string, product: ProductDto);
        getAvailability(): ng.IPromise<IProductAvailability>;
        getRecommendedProductZone(listType: string, customerNumber: string, customerSequence: string): ng.IHttpPromise<string>;
    }

    export interface IProductAvailability {
        warehouses: {};
        availability: string;
        product: ProductDto;
    }

    export class CustomProductService implements ICustomProductService {
        
        productAvailability: IProductAvailability;

        serviceUri = this.coreService.getApiUri("/api/morsco/productlist");
        constructor(protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {

        }

        setAvailability(warehouses: {}, availability: string, product: ProductDto) {
            this.productAvailability = { "warehouses": warehouses, "availability": (availability) ? JSON.parse(availability) : "", "product": product };
            this.$rootScope.$broadcast('availabilityLocationsPopupClicked', {})
        }

        getAvailability(): ng.IPromise<IProductAvailability>  {
            var result = this.productAvailability;
            var deferred = this.$q.defer();
            deferred.resolve(result);
            return deferred.promise;
        }

        getRecommendedProductZone(zoneType: string, customerNumber: string, customerSequence: string): ng.IHttpPromise<string> {
            var uri = this.serviceUri;

            var listType = (zoneType == "topProducts") ? "AllCust24Mo" : (customerSequence) ? "ShipToCust24Mo" : "BillToCust24Mo";

            var params = "";

            if (customerNumber) {
                params += "&customernumber=" + customerNumber;
            }
            if (customerSequence) {
                params += "&customersequence=" + customerSequence;
            }

            uri += "?listtype=" + listType;
            uri += "&maxrows=16";
            uri += params;
            uri = uri.replace(/&$/, "");
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        getInvoice(invoiceId: string, expand: string): ng.IHttpPromise<InvoiceModel> {
            var uri = this.serviceUri + "/" + invoiceId;
            if (expand) {
                uri += "?expand=" + expand;
            }
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }
    }

    function factory($rootScope: ng.IRootScopeService, $http: ng.IHttpService, $q: ng.IQService, coreService: core.ICoreService): CustomProductService {
        return new CustomProductService($rootScope, $http, $q, coreService);
    }
    factory.$inject = ["$rootScope", "$http", "$q", "coreService"];

    angular
        .module("insite")
        .factory("customProductService", factory);
}
 