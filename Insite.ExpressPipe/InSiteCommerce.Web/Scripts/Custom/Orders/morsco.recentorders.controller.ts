module insite.order {
    "use strict";

    export class MorscoRecentOrdersController extends RecentOrdersController {
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

            super($scope, orderService, cartService, coreService, paginationService, promotionService);
        }

        fixErpOrderNumber(erpOrderNumber: string, status: string) {
            return (status != 'Invoiced' && erpOrderNumber.indexOf('.') > 0)
                ? erpOrderNumber.substring(0, erpOrderNumber.indexOf('.'))
                : erpOrderNumber;
        }
    }

    angular
        .module("insite")
        .controller("RecentOrdersController", MorscoRecentOrdersController);
}