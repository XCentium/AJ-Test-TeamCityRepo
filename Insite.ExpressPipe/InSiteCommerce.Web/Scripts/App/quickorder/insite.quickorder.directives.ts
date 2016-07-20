module insite.quickorder {

    angular.module("insite")
        .directive("iscQuickOrder", ["coreService", function (coreService: core.ICoreService) {
        var widgetDirective: ng.IDirective = {
            controller: "QuickOrderController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {},
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/QuickOrder")
        }
        return widgetDirective;
    }])
        .directive("iscQuickOrderView", ["coreService", function (coreService: core.ICoreService) {
        var pageDirective: ng.IDirective = {
            controller: "QuickOrderPageController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {},
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/QuickOrderView")
        }
        return pageDirective;
    }])
        .directive("iscOrderUploadView", ["coreService", function (coreService: core.ICoreService) {
        var widgetDirective: ng.IDirective = {
            controller: "OrderUploadController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {},
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/OrderUploadView"),
            link: () => {
                $('#buttonFileUpload').click(function (event) {
                    $('#hiddenFileUpload').val(null).click();
                });
            }
        }
        return widgetDirective;
    }])
        .directive("iscOrderUploadingPopup", ["coreService", function (coreService: core.ICoreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/OrderUploadingPopup")
        }
    }])
        .directive("iscOrderUploadSuccessPopup", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/OrderUploadSuccessPopup"),
            scope: {
                itemsCount: "@"
            }
        }
    }])
        .directive("iscOrderUploadingIssuesPopup", ["coreService", function (coreService: core.ICoreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/QuickOrder/OrderUploadingIssuesPopup")
        }
    }]);
}