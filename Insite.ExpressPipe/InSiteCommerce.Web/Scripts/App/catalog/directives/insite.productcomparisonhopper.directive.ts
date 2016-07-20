module insite.catalog {
    
    angular.module("insite")
        .directive("iscProductComparisonHopper", ["coreService", (coreService: core.ICoreService) => {
            var directive = {
                controller: "ProductComparisonHopperController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/Catalog/ProductComparisonHopper"),
                bindToController: true
            }
            return directive;
        }]);
}