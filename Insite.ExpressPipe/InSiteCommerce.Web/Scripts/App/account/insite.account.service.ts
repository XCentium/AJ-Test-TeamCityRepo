import AccountModel = Insite.Account.WebApi.V1.ApiModels.AccountModel;
import AccountSettingsModel = Insite.Account.WebApi.V1.ApiModels.AccountSettingsModel;
import AccountCollectionModel = Insite.Account.WebApi.V1.ApiModels.AccountCollectionModel;
import ExternalProviderLinkCollectionModel = Insite.IdentityServer.Models.ExternalProviderLinkCollectionModel;
import ExternalProviderLinkModel = Insite.IdentityServer.Models.ExternalProviderLinkModel;

module insite.account {
    "use strict";

    export interface IAccountService {
        expand: string;
        getAccountSettings(): ng.IHttpPromise<AccountSettingsModel>;
        getAccounts(searchText?: string, pagination?: PaginationModel, sort?: string): ng.IHttpPromise<AccountCollectionModel>;
        getAccount(accountId?: System.Guid): ng.IHttpPromise<AccountModel>;
        getExternalProviders(): ng.IHttpPromise<ExternalProviderLinkCollectionModel>;
        createAccount(account: AccountModel): ng.IHttpPromise<AccountModel>;
        updateAccount(account: AccountModel, accountId?: System.Guid): ng.IHttpPromise<AccountModel>;
    } 

    export class AccountService {

        serviceUri = this.coreService.getApiUri("/api/v1/accounts");
        settingsUri = this.coreService.getApiUri("/api/v1/settings/account");
        expand = "";

        static $inject  = ["$http", "coreService", "$window"];
        constructor(protected $http: ng.IHttpService,
            protected coreService: core.ICoreService,
            protected $window: ng.IWindowService) {
        }

        getAccountSettings(): ng.IHttpPromise<AccountSettingsModel> {
            return this.$http.get(this.settingsUri);
        }
            
        getAccounts(searchText?: string, pagination?: PaginationModel, sort?: string): ng.IHttpPromise<AccountCollectionModel> {
            var params = <any>{
                SearchText: searchText,
                Sort: sort
            };

            if (this.expand) {
                params.expand = this.expand;
            }

            if (pagination) {
                params.StartPage = pagination.currentPage;
                params.PageSize = pagination.pageSize;
            }

            return this.$http({
                url: this.serviceUri,
                method: "GET",
                params: params
            });
        }

        getAccount(accountId?: System.Guid): ng.IHttpPromise<AccountModel> {
            var params = <any>{};
            if (this.expand) {
                params.expand = this.expand;
            }

            return this.$http({
                url: this.serviceUri + "/" + (!accountId ? "current" : accountId),
                method: "GET",
                params: params
            });
        }
            
        getExternalProviders(): ng.IHttpPromise<ExternalProviderLinkCollectionModel> {
            return this.$http.get("/identity/externalproviders" + this.$window.location.search);
        }

        createAccount(account: AccountModel): ng.IHttpPromise<AccountModel> {
            return this.$http.post(this.serviceUri, account, { bypassErrorInterceptor: true });
        }

        updateAccount(account: AccountModel, accountId?: System.Guid): ng.IHttpPromise<AccountModel> {
            return this.$http({
                method: "PATCH",
                url: this.serviceUri + "/" + (!accountId ? "current" : accountId),
                data: account,
                bypassErrorInterceptor: true
            });
        }
    }

    angular
        .module("insite")
        .service("accountService", AccountService);
}