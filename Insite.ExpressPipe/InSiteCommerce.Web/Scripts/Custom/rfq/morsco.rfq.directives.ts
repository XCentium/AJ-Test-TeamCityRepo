module insite.account {
    "use strict";

    angular
        .module("insite")
        .directive("morscoQuoteDetailsGrid", ["coreService", function (coreService) {
        return {
            controller: "QuoteDetailsGridController",
            controllerAs: "vm",
			restrict: "E",
			replace: true,
			templateUrl: coreService.getApiUri("/Directives/Rfq/QuoteDetailsGrid"),
			scope: {
                quote: "=",
                removeline: '&',
                notepanelclicked: '&',
                noteskeypress: '&',
                updateline: '&',
                quantitykeypress: '&',
                warehouses: "="
            }
		};
	}]);
}