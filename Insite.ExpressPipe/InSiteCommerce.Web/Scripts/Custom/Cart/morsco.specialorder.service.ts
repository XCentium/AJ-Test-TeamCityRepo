/// <reference path="../../../Scripts/App/_typelite/insite.models.d.ts" />
/// <reference path="../../../Scripts/App/core/insite.core.service.ts"/>

module insite.cart {
    "use strict";

    export interface ISpecialOrderRequest {
		specialOrder : string;
    }

    export interface ISpecialOrderService {
        createSpecialOrder(quantity: string, description: string): ng.IHttpPromise<string>;
        createMultipleSpecialOrder(products: any[]): ng.IHttpPromise<string>;
        reQuote(quoteId: string): ng.IHttpPromise<string>;
        deleteQuote(quoteId: string): ng.IHttpPromise<string>;
		removeQuoteLine(quoteLine: QuoteLineModel): ng.IHttpPromise<string>;
        updateQuote(params: any): ng.IHttpPromise<string>;
    }
    
    export class SpecialOrderService implements ISpecialOrderService {

        serviceUri = this.coreService.getApiUri("/api/morsco/specialorder");
        constructor(protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        createSpecialOrder(quantity: string, description: string): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'quantity=' + quantity + '&description=' + description;
            uri += "/createSpecialOrder";
            uri += query;
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        createMultipleSpecialOrder(products: any[]): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            uri += "/createMultipleSpecialOrder";
            var param = [];
            products.forEach((product) => {
                var item = {
                    Quantity: product.Qty,
                    Description: product.Description
                };
                param.push(item);
            });
            return this.$http.post(uri, param);
        }

        reQuote(quoteId: string): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'quoteId=' + quoteId;
            uri += "/reSubmitQuote";
            uri += query;
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        deleteQuote(quoteId: string): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'quoteId=' + quoteId;
            uri += "/deleteQuote";
            uri += query;
            return this.$http.post(uri, { bypassErrorInterceptor: true });
        }

		removeQuoteLine(quoteLine: QuoteLineModel): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'quoteLineId=' + quoteLine.id;
            uri += "/removeQuoteLine";
            uri += query;
            return this.$http.post(uri, { bypassErrorInterceptor: true });
        }

        updateQuote(params: any): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'quoteId=' + params.quoteId;
            if (params.poNumber) {
                query += "&" + 'poNumber=' + params.poNumber;
            }
            if (params.status) {
                query += "&" + 'status=' + params.status;
            }

            if (params.carrierId) {
                query += "&" + 'carrierid=' + params.carrierId;
            }
            if (params.shipViaId) {
                query += "&" + 'shipviaid=' + params.shipViaId;
            }

            uri += "/updateQuote";
            uri += query;
            return this.$http.post(uri, { bypassErrorInterceptor: true });
        }

    }

    function factory($rootScope: ng.IRootScopeService, $http: ng.IHttpService, $q: ng.IQService, coreService: core.ICoreService): SpecialOrderService {
        return new SpecialOrderService($rootScope, $http, $q, coreService);
    }
    factory.$inject = ["$rootScope", "$http", "$q", "coreService"];

    angular
        .module("insite")
        .factory("specialOrderService", factory);
}
 