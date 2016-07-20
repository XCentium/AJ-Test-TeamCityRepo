module insite.useradministration {

    angular.module("insite")
        .directive("iscUserListView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "UserListController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/UserAdministration/UserListView")
        }
        return directive;
    }])
        .directive("iscUserSetupView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "UserDetailController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/UserAdministration/UserSetupView")
        }
        return directive;
    }])
        .directive("iscUserSetupShipToView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "UserShipToController",
            controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/UserAdministration/UserSetupShipToView")
        }
        return directive;
    }]);
}