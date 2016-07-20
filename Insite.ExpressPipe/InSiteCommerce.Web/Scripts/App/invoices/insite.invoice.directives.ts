module insite.invoice {
    angular.module("insite")
        .directive("iscInvoiceListView", ["coreService", function (coreService: core.ICoreService) {
            var directive = {
                controller: "InvoiceListController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/History/InvoiceListView")
            }
            return directive;
        }])
        .directive("iscInvoiceDetailView", ["coreService", function (coreService: core.ICoreService) {
            var directive = {
                controller: "InvoiceDetailController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/History/InvoiceDetailView")
            }
            return directive;
        }]);

}