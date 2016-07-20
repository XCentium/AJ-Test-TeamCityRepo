/// <reference path="../../../Scripts/App/_typelite/insite.models.d.ts" />
/// <reference path="../../../Scripts/App/core/insite.core.service.ts"/>

module insite.cart {
    "use strict";

    export interface IAddCardRequest {
        //firstname: string;
       // lastname: string;
        //middlename: string;
		cardholdername: string;
        billingaddress: string;
        city: string;
        state: string;
        zip: string;
    }

    export interface ICreditCardService {

        getCardList(): ng.IHttpPromise<string>;
        addNewCard(parameters: IAddCardRequest): ng.IHttpPromise<string>;
        finalizeNewCard(setupResult: string): ng.IHttpPromise<string>;
        deleteCard(elementAccountId: string): ng.IHttpPromise<string>;
        selectCard(elementAccountId: string): ng.IHttpPromise<string>;
    }
    
    export class CreditCardService implements ICreditCardService {

        serviceUri = this.coreService.getApiUri("/api/morsco/creditcard");
        constructor(protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {

        }

        getCardList(): ng.IHttpPromise<string> {
            var uri = this.serviceUri;

            uri += "/getcards";
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        addNewCard(parameters: IAddCardRequest): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + this.coreService.parseParameters(parameters);
            uri += "/initiatenewcard";
            uri += query;
            uri = uri.replace(/&$/, "");
            return this.$http.post(uri, { bypassErrorInterceptor: true });
        }

        finalizeNewCard(setupResult: any): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            uri += "/finalizenewcard";
            return this.$http.post(uri, setupResult);
        }

        deleteCard(elementAccountId: string): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'elementAccountId=' + elementAccountId;
            uri += "/deletecard";
            uri += query;
            return this.$http.delete(uri, { bypassErrorInterceptor: true });
        }

        selectCard(elementAccountId: string): ng.IHttpPromise<string> {
            var uri = this.serviceUri;
            var query = "?" + 'elementAccountId=' + elementAccountId;
            uri += "/selectcard";
            uri += query;
            return this.$http.post(uri, { bypassErrorInterceptor: true });
        }
    }

    function factory($rootScope: ng.IRootScopeService, $http: ng.IHttpService, $q: ng.IQService, coreService: core.ICoreService): CreditCardService {
        return new CreditCardService($rootScope, $http, $q, coreService);
    }
    factory.$inject = ["$rootScope", "$http", "$q", "coreService"];

    angular
        .module("insite")
        .factory("creditCardService", factory);
}
 