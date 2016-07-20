module insite.orderapproval {

    angular.module("insite")
        .directive("iscOrderApprovalListView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "OrderApprovalListController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/OrderApproval/OrderApprovalListView")
        }
        return directive;
    }])
        .directive("iscOrderApprovalDetailView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "OrderApprovalDetailController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/OrderApproval/OrderApprovalDetailView")
        }
        return directive;
    }]);
} 