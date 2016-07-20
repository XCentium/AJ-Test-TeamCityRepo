import OrderCollectionModel = Insite.Order.WebApi.V1.ApiModels.OrderCollectionModel;
import OrderModel = Insite.Order.WebApi.V1.ApiModels.OrderModel;
import OrderLineModel = Insite.Order.WebApi.V1.ApiModels.OrderLineModel;
import RmaModel = Insite.Order.WebApi.V1.ApiModels.RmaModel;
import RmaLineDto = Insite.Order.Services.Dtos.RmaLineDto;

module insite.order {
    "use strict";

    export interface ISearchFilter {
        customerSequence: string;
        sort: string;
        toDate: string;
        fromDate: string;
}

    export interface IOrderService {
        getOrders(filter: ISearchFilter, pagination: PaginationModel): ng.IHttpPromise<OrderCollectionModel>;
        getOrder(orderId: string, expand: string): ng.IHttpPromise<OrderModel>;
        updateOrder(orderId: string, orderModel: OrderModel): ng.IHttpPromise<OrderModel>;
        addRma(rmaModel: RmaModel): ng.IHttpPromise<RmaModel>;
    }

    export class OrderService implements IOrderService {

        serviceUri = this.coreService.getApiUri("/api/v1/orders");

        static $inject = ["$http", "coreService"];

        constructor(protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {
        }

        getOrders(filter: ISearchFilter, pagination: PaginationModel): ng.IHttpPromise<OrderCollectionModel> {
            var uri = this.serviceUri;
            if (filter) {
                uri += "?";
                for (var property in filter) {
                    if (filter[property]) {
                        uri += property + "=" + filter[property] + "&";
                    }
                }
            }
            if (pagination) {
                uri += "currentPage=" + pagination.currentPage + "&pageSize=" + pagination.pageSize;
            }
            uri = uri.replace(/&$/, "");
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        getOrder(orderId: string, expand: string): ng.IHttpPromise<OrderModel> {
            var uri = this.serviceUri + "/" + orderId;
            if (expand) {
                uri += "?expand=" + expand;
            }
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        updateOrder(orderId: string, orderModel: OrderModel): ng.IHttpPromise<OrderModel> {
            var uri = this.serviceUri + "/" + orderId;
            var jsUpdateInfo = angular.toJson(orderModel);

            return this.$http({ method: "PATCH", url: uri, data: jsUpdateInfo, bypassErrorInterceptor: true });
        }

        addRma(rmaModel: RmaModel): ng.IHttpPromise<RmaModel> {
            return this.$http.post(this.serviceUri + "/" + rmaModel.orderNumber + "/returns", rmaModel);
        }
    }

    angular
        .module("insite")
        .service("orderService", OrderService);
}
