
import AccountShipToCollectionModel = Insite.Account.WebApi.V1.ApiModels.AccountShipToCollectionModel;
import AccountShipToModel = Insite.Account.WebApi.V1.ApiModels.AccountShipToModel;

module insite.useradministration {
    "use strict";

    export interface IUserService {
        getUserShipToCollection(userProfileId: System.Guid, pagination: PaginationModel, sort: string): ng.IHttpPromise<AccountShipToCollectionModel>;
        applyUserShipToCollection(userProfileId: System.Guid, shipToCollection: AccountShipToModel[]): ng.IHttpPromise<AccountShipToCollectionModel>;
    }

    export class UserService implements IUserService {

        serviceUri = this.coreService.getApiUri("/api/v1/accounts");

        static $inject = ["$http", "coreService"];

        constructor(
            protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {
        }

        getUserShipToCollection(userProfileId: System.Guid, pagination: PaginationModel, sort: string): ng.IHttpPromise<AccountShipToCollectionModel> {
            var params = <any>{
                Sort: sort
            };
            if (pagination) {
                params.StartPage = pagination.currentPage;
                params.PageSize = pagination.pageSize;
            }

            return this.$http({
                url: this.coreService.getApiUri(this.serviceUri + "/" + userProfileId + "/shiptos"),
                method: "GET",
                params: params
            });
        }

        applyUserShipToCollection(userProfileId: System.Guid, shipToCollection: AccountShipToModel[]): ng.IHttpPromise<AccountShipToCollectionModel> {
            return this.$http({
                url: this.coreService.getApiUri(this.serviceUri + "/" + userProfileId + "/shiptos"),
                method: "PATCH",
                data: {
                    UserShipToCollection: shipToCollection
                }
            });
        }
    }

    angular
        .module("insite")
        .service("userService", UserService);
}