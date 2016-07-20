module insite.catalog {
    "use strict";

    angular
        .module("insite")
        .directive("iscProductComparisonView", [
            "coreService", (coreService: core.ICoreService) => {
                return {
                    controller: "CompareProductsController",
                    controllerAs: "vm",
                    restrict: "E",
                    replace: true,
                    scope: {

                    },
                    templateUrl: coreService.getApiUri("/Directives/Catalog/ProductComparisonView")
                };
            }
        ]);
}