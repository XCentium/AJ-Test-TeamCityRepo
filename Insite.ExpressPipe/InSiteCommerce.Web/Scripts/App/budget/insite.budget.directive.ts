(function(angular) {
    "use strict";
    angular
        .module("insite")
        .directive("iscSetupBudgetEnforcementLevels", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    replace: true,
                    templateUrl: coreService.getApiUri("/Directives/Budget/SetupBudgetEnforcementLevels"),
                };
            }
        ])
        .directive("iscSetupBudgetPeriods", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    replace: true,
                    templateUrl: coreService.getApiUri("/Directives/Budget/SetupBudgetPeriods"),
                };
            }
        ])
        .directive("iscSetupBudgetCostCodes", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    replace: true,
                    templateUrl: coreService.getApiUri("/Directives/Budget/SetupBudgetCostCodes"),
                };
            }
        ])
        .directive("iscBudgetReview", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    replace: true,
                    templateUrl: coreService.getApiUri("/Directives/Budget/BudgetReview"),
                    scope: {
                        currencySymbol: "=",
                        reviewInfo: "="
                    }
                };
            }
        ])
        .directive("iscTab", [
            "coreService", function(coreService) {
                return {
                    restrict: "A",
                    link: function(scope, elm, attrs) {
                        elm.on("click", function() {
                            $(".active[data-isc-tab]").removeClass("active");
                            $(this).addClass("active");
                            $("[data-isc-tab-body]").hide();
                            $("#" + $(this).data("isc-tab") + "Container").show();
                        });
                    }
                };
            }
        ])
        .directive("iscBudgetFilter", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    templateUrl: coreService.getApiUri("/Directives/Budget/BudgetFilter"),
                    scope: {
                        accounts: "=",
                        shipToList: "=",
                        enforcementLevel: "=",
                        user: "=",
                        shipTo: "=",
                        year: "=",
                        viewBudget: "&",
                        switchFilterInput: "&",
                        budgetYears: "="
                    }
                };
            }
        ])
        .directive("iscBudgetMaintenance", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    templateUrl: coreService.getApiUri("/Directives/Budget/BudgetMaintenance"),
                    scope: {
                        currencySymbol: "=",
                        maintenanceInfo: "=",
                        updateBudgets: "&",
                        getEndDate: "&"
                    }
                };
            }
        ])
        .directive("iscBudgetView", [
            "coreService", function(coreService) {
                return {
                    restrict: "E",
                    replace: true,
                    templateUrl: coreService.getApiUri("/Directives/Budget/BudgetView"),
                    controller: "BudgetController",
                    controllerAs: "vm"
                };
            }
        ]);
}(angular));