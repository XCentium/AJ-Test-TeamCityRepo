module insite.quickorder {

    angular.module("insite")
        .directive("morscoOrderUploadSuccessPopup", ["coreService", function (coreService) {
        return {
            controller: "MorscoOrderUploadSuccessPopupController",
            controllerAs: "vm",
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/OrderUploadSuccessPopup"),
            scope: {
                itemsCount: "@"
            }
        }
    }]);
}