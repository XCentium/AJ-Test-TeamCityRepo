module insite.order {

    angular.module("insite")
        .directive("iscPurchasedProductsView", ["coreService", function (coreService: core.ICoreService) {
            var directive: ng.IDirective = {
                controller: "PurchasedProductsController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/History/PurchasedProductsView")
            }
            return directive;
        }]);
}