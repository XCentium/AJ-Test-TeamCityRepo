module insite.order {
    "use strict";

    export class RecentOrdersController extends OrderDetailController {
        orderHistory: OrderCollectionModel;

        static $inject = [
            "$scope",
            "orderService",
            "cartService",
            "coreService",
            "paginationService",
            "promotionService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected orderService: order.IOrderService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService,
            protected promotionService: promotions.IPromotionService) {

            super($scope, orderService, cartService, coreService, promotionService);
        }

        init() {
            this.$scope.$on("sessionLoaded", (event: ng.IAngularEvent, session: SessionModel) => {
                if (!session.userRoles || session.userRoles.indexOf("Requisitioner") === -1) {
                    this.getRecentOrders();
                }
            });
        }

        getRecentOrders() {
            var filter = new OrderSearchFilter();
            filter.sort = "OrderDate DESC";
            filter.customerSequence = "-1";

            var pagination = new RecentOrdersPaginationModel();

            this.orderService.getOrders(filter, pagination).success(data => {
                this.orderHistory = data;
            });
        }
    }

    class RecentOrdersPaginationModel implements PaginationModel {
        currentPage: number;
        pageSize: number;
        defaultPageSize: number;
        totalItemCount: number;
        numberOfPages: number;
        pageSizeOptions: number[];
        sortOptions: Insite.Core.WebApi.SortOptionModel[];
        sortType: string;
        nextPageUri: string;
        prevPageUri: string;

        constructor() {
            this.numberOfPages = 1;
            this.pageSize = 5;
            this.currentPage = 1;
        }
    }

    angular
        .module("insite")
        .controller("RecentOrdersController", RecentOrdersController);
}