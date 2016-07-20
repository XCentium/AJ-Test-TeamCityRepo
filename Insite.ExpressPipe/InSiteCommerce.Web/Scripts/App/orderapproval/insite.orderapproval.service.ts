import OrderApprovalCollectionModel = Insite.OrderApproval.WebApi.V1.ApiModels.OrderApprovalCollectionModel;

module insite.orderapproval {

    "use strict";

    export interface IOrderApprovalService {
        getCarts(filter?: cart.IQueryStringFilter, pagination?: PaginationModel): ng.IHttpPromise<OrderApprovalCollectionModel>;
        getCart(cartId: string): ng.IPromise<CartModel>;
    }

    export class OrderApprovalService implements IOrderApprovalService {
        serviceUri = this.coreService.getApiUri("/api/v1/orderapprovals");

        static $inject = ["$http", "$rootScope", "$q", "coreService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $rootScope: ng.IRootScopeService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getCarts(filter?: cart.IQueryStringFilter, pagination?: PaginationModel): ng.IHttpPromise<OrderApprovalCollectionModel> {
            var params = {};
            if (filter)
            {
                for (var property in filter)
                {
                    if (filter.hasOwnProperty(property) && filter[property])
                    {
                        params[property] = filter[property];
                    }
                }
            }

            if (pagination) {
                params["page"] = pagination.currentPage;
                params["pageSize"] = pagination.pageSize;
            }

            return this.$http({
                url: this.serviceUri,
                method: "GET",
                params: params
            });
        }

        getCart(cartId: string): ng.IPromise<CartModel> {
            var uri = this.serviceUri + "/" + cartId;
            var deferred = this.$q.defer();
            this.$http.get(uri)
                .success((cart: CartModel) => {
                    deferred.resolve(cart);
                })
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("orderApprovalService", OrderApprovalService);

}
 