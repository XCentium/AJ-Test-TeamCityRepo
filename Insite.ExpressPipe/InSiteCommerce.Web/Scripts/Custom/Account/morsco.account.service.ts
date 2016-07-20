//import AccountModel = Insite.Account.WebApi.V1.ApiModels.AccountModel;
//import AccountSettingsModel = Insite.Account.WebApi.V1.ApiModels.AccountSettingsModel;
//import AccountCollectionModel = Insite.Account.WebApi.V1.ApiModels.AccountCollectionModel;

module insite.account {
    "use strict";

    export interface IMorscoAccountInfo {
        accountModel: AccountModel;
        // Morsco specific data
        accountNumber: string;
        companyName: string;
        phoneNumber: string;
        address1: string;
        address2: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        branch: string;
        salesman: string;
        existingAccount: boolean;
        termsAccepted: boolean;
    }

    export interface IMorscoRegistrationResponse {
        customerNumber: string;
        customerSequence: string;
        companyName: string;
        address1: string;
        address2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }

    export interface IMorscoWarehouses {
        warehouseId: string;
        shipSite: string;
        name: string;
        description: string;
    }

    export interface IMorscoAccountService {
        getAccountInfo(): ng.IPromise<IMorscoAccountInfo>;
        setAccountInfo(value): ng.IPromise<IMorscoAccountInfo>;
        removeAccountInfo(): ng.IPromise<IMorscoAccountInfo>;
        getCustomer(customerNumber: string): ng.IHttpPromise<IMorscoRegistrationResponse>;
        getWarehouses(): ng.IHttpPromise<IMorscoWarehouses>;
    } 

    export class MorscoAccountService {

        accountInfo: IMorscoAccountInfo;
        serviceUri = this.coreService.getApiUri("/api/morsco/registration");

        static $inject  = ["$http", "$q", "coreService", "$localStorage"];
        constructor(protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService,
            protected $localStorage: core.IWindowStorage) {
        }

        getAccountInfo() {
            var registrationInfo = this.$localStorage.get("registrationInfo");
            if (registrationInfo) {
                this.accountInfo = JSON.parse(registrationInfo);
            }
            var result = this.accountInfo;
            var deferred = this.$q.defer();
            deferred.resolve(result);
            return deferred.promise;
        }

        setAccountInfo(value) {
            this.$localStorage.set("registrationInfo", JSON.stringify(value));
            this.accountInfo = value;
            var result = this.accountInfo;
            var deferred = this.$q.defer();
            deferred.resolve(result);
            return deferred.promise;
        }

        removeAccountInfo(value) {
            this.$localStorage.remove("registrationInfo");
            this.accountInfo = value;
            var result = this.accountInfo;
            var deferred = this.$q.defer();
            deferred.resolve(result);
            return deferred.promise;
        }

        getCustomer(customerNumber: string) {
            var uri = this.serviceUri + "/searchcustomer?customernumber=" + customerNumber;
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        getWarehouses() {
            var uri = this.serviceUri + "/getwarehouses";
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }
    }

    angular
        .module("insite")
        .service("morscoAccountService", MorscoAccountService);
}