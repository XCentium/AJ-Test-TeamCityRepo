(function (angular) {
    "use strict";
    angular
        .module("insite")
        .directive("iscMyJobQuotes", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/JobQuote/MyJobQuotesView"),
            controller: "MyJobQuotesController",
            controllerAs: "vm"
        };
        }]).directive("iscJobQuoteDetails", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/JobQuote/JobQuoteDetailsView"),
            controller: "JobQuoteDetailsController",
            controllerAs: "vm",
            scope: {
                checkoutAddressUrl: "@"
            },
            bindToController: true
        };
    }])

    ;
} (angular));