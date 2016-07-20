(function (angular) {
    "use strict";

    angular
        .module("insite")
        .directive("iscRequestRmaView", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Rma/RequestRmaView"),
                controller: "RmaController",
                controllerAs: "vm"
            };
        }]);

} (angular));