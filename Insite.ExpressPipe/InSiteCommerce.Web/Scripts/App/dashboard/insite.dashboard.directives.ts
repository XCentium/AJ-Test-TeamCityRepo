module insite.dashboard {
    "use strict";

    angular
        .module("insite")
        .directive("iscMakeDashboardHomepage", ["coreService", coreService => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Dashboard/HomepageOption"),
                scope: {
                },
                controller: "DashboardOptionsController",
                controllerAs: "vm"
            };
        }])
        .directive("iscDashboardView", ["coreService", coreService => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Dashboard/DashboardView"),
                scope: {
                },
                controller: "DashboardViewController",
                controllerAs: "vm"
            };
        }])
        .directive("iscQuickLinks", ["coreService", coreService => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Dashboard/QuickLinks"),
                scope: {
                },
                controller: "DashboardQuickLinksController",
                controllerAs: "vm"
            };
        }])
        .directive("iscMyLists", ["coreService", coreService => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Dashboard/MyLists"),
                scope: {
                },
                controller: "DashboardMyListsController",
                controllerAs: "vm"
            };
        }])
        .directive("iscDashboardLinks", ["coreService", coreService => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Dashboard/DashboardLinks"),
                scope: {
                    orderKey: "@",
                    requisitionKey: "@",
                    quoteKey: "@"
                },
                controller: "DashboardLinksController",
                controllerAs: "vm",
                bindToController: true
            };
        }]);
}