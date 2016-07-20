(function (angular) {
    "use strict";
    angular
        .module("insite")
        .directive("iscMessages", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Dashboard/Messages"),
                controller: "MessageController",
                controllerAs: "vm",
                scope: { }
            };
        }]);
}(angular)); 