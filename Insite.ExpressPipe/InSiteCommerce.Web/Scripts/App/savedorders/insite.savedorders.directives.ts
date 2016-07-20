module insite.savedorders {
    "use strict";
    angular.module("insite")
        .directive("iscSavedOrdersListView", ["coreService", function (coreService: core.ICoreService) {
            var directive: ng.IDirective = {
                replace: true,
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/SavedOrders/SavedOrdersListView"),
                controller: "SavedOrderListController",
                controllerAs: "vm"
            }
            return directive;
        }])
        .directive("iscSavedOrderDetailView", ["coreService", function (coreService: core.ICoreService) {
            var directive: ng.IDirective = {
                replace: true,
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/SavedOrders/SavedOrderDetailView"),
                controller: "SavedOrderDetailController",
                controllerAs: "vm"
            }
            return directive;
        }]);
} 