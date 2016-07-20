module insite.dealers {
    "use strict";

    angular.module("insite")
        .directive("iscDealerLocatorView", ["coreService", (coreService: core.ICoreService) => {
            var directive: ng.IDirective = {
                replace: true,
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/Dealers/DealerLocatorView"),
                controller: "DealerCollectionController",
                controllerAs: "vm"
            }
            return directive;
        }])
        .directive("iscDealerDirectionsView", ["coreService", (coreService: core.ICoreService) => {
            var directive: ng.IDirective = {
                replace: true,
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/Dealers/DealerDirectionsView"),
                controller: "DealerDirectionsController", 
                controllerAs: "vm"
            }
            return directive;
        }])
        .directive("iscDealerView", ["coreService", (coreService: core.ICoreService) => {
            var directive: ng.IDirective = {
                replace: true,
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/Dealers/DealerView"),
                controller: "DealerController",
                controllerAs: "vm"
            }
            return directive;
        }]);
}