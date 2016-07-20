module insite.order {

    angular.module("insite")
        .directive("iscOrderListView", ["coreService", function (coreService: core.ICoreService) {
            var directive: ng.IDirective = {
                controller: "OrderListController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/History/OrderListView")
            }
            return directive;
        }])
        .directive("iscRecentOrders", ["coreService", function (coreService: core.ICoreService) {
            var directive: ng.IDirective = {
                controller: "RecentOrdersController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/History/RecentOrders")
            }
            return directive;
        }])
        .directive("iscOrderDetailView", ["coreService", function (coreService: core.ICoreService) {
            var directive: ng.IDirective = {
                controller: "OrderDetailController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/History/OrderDetailView")
            }
            return directive;
        }]);
}