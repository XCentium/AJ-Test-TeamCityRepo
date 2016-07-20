module insite.account {
    "use strict";

    angular
        .module("insite")
        .directive("iscCartBottomSubTotalDisplay", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/CartBottomSubTotalDisplay"),
            scope: {
                cart: "=",
                promotions: "=",
                isCartPage: "=",
				isNonCatalog: "="
            }
        };
    }])
        .directive("iscConfirmationBottomSubTotalDisplay", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/ConfirmationBottomSubTotalDisplay"),
            scope: {
                cart: "=",
                promotions: "=",
                isCartPage: "=",
                isCatalog: "="
            }
        };
    }])
        .directive("iscCartRightColumnSidebar", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/CartRightColumnSidebar"),
            scope: {
                cart: "=",
                promotions: "=",
                isCartPage: "="
            },
            link: function (scope, element, attrs) {
                if ($(window).width() > 960) {
                    setTimeout(function () {
                        $('.summary').sticky({
                            topSpacing: 50,
                            bottomSpacing: $('#footer').outerHeight() + 20
                        });
                    }, 250);
                }
            }
        };
    }])
        .directive("iscQuoteRightColumnSidebar", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Rfq/QuoteRightColumnSidebar"),
            scope: {
                cart: "=",
                promotions: "=",
                isCartPage: "=",
                quote: "=",
                declinequote: '&',
                deleteconfirmationpopup: '&',
                acceptcheckout: '&',
            },
            //controller: "QuoteDetailsController",
            //controllerAs: "vm",
            link: function (scope, element, attrs) {
                if ($(window).width() > 960) {
                    $('.summary').sticky({
                        topSpacing: 50,
                        bottomSpacing: $('#footer').outerHeight() + 20
                    });
                }
            }
        };
    }])
        .directive("iscConfirmationCartLines", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/ConfirmationCartLines"),
            scope: {
                cart: "=",
                isCatalog: "="
            },
            controller: "CartLinesController",
            controllerAs: "vm",
            link: function (scope, element, attrs) {
                scope.editable = attrs.editable === "true";
                scope.includeInventory = attrs.includeInventory === "true";
                scope.includeQuoteRequired = attrs.includeQuoteRequired === "true";
                scope.quoteRequiredFilter = function (value) {
                    if (scope.includeQuoteRequired) {
                        return true;
                    }
                    return value.quoteRequired === false;
                };
            }
        };
    }])
        .directive("iscMorscoAvailabilityShippingTax", ["coreService", (coreService: core.ICoreService) => {
        return {
            restrict: "E",
            scope: {
                availability: "="
            },
            templateUrl: coreService.getApiUri("/Directives/Cart/MorscoAvailabilityShippingTax"),
            controller: "MorscoAvailabilityShippingTax",
            controllerAs: "vm"
        };
    }])
        .directive("morscoCreditCardView", ["coreService", (coreService: core.ICoreService) => {
        return {
            restrict: "E",
            replace: true,
            controller: "MorscoCreditCardController",
            controllerAs: "vm",
			bindToController: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/CreditCardView"),
            scope: {
                cart: "=",
            }
        };
    }])
        .directive("morscoShippingBar", ["coreService", (coreService: core.ICoreService) => {
        return {
            restrict: "E",
            replace: true,
            controller: "MorscoShippingController",
            controllerAs: "vm",
            bindToController: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/ShippingBar_Morsco"),
            scope: {
                cart: "=",
                defaultWarehouses: "=",
            }
        };
    }])
        .directive("morscoSpecialOrderView", ["coreService", (coreService: core.ICoreService) => {
        return {
            restrict: "E",
            replace: true,
            controller: "MorscoSpecialOrderController",
            controllerAs: "vm",
            templateUrl: coreService.getApiUri("/Directives/Cart/SpecialOrderView"),
            scope: {
                cart: "=",
            }
        };
		}])
		.directive("morscoCartLines", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Cart/CartLines"),
            scope: {
                cart: "=",
                warehouses: "=",
				inventoryCheck: "@",
				includeInventory: "@",
				includeQuoteRequired: "=",
				isCatalog:"="
			},
			controller: "CartLinesController",
			controllerAs: "vm",
			link: function (scope, element, attrs) {
				scope.editable = attrs.editable === "true";
				scope.quoteRequiredFilter = function (value) {
					if (scope.includeQuoteRequired) {
						return true;
					}
					return value.quoteRequired === false;
                };
                setTimeout(function () {
                    $(document).foundation('tooltip', 'reflow');
                }, 500);
			}
		};
		}])
		.directive("morscoQuoteCartLines", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Rfq/QuoteCartLines"),
            scope: {
                cart: "=",
                warehouses: "=",
                inventoryCheck: "@",
                includeInventory: "@"
            },
			controller: "CartLinesController",
            controllerAs: "vm",
			link: function (scope, element, attrs) {
				scope.editable = attrs.editable === "true";
				scope.includeQuoteRequired = attrs.includeQuoteRequired === "true";
				scope.quoteRequiredFilter = function (value) {
					if (scope.includeQuoteRequired) {
						return true;
					}
					return value.quoteRequired === false;
                };
			}
		};
		}])
		.directive("morscoSpecialOrderLines", ["coreService", function (coreService) {
		return {
			restrict: "E",
			replace: true,
			templateUrl: coreService.getApiUri("/Directives/Cart/SpecialOrderLines"),
			scope: {
				cart: "=",
				inventoryCheck: "@",
				includeInventory: "@"
			},
			controller: "CartLinesController",
			controllerAs: "vm",
			link: function (scope, element, attrs) {
				scope.editable = attrs.editable === "true";
				scope.includeQuoteRequired = attrs.includeQuoteRequired === "true";
				scope.quoteRequiredFilter = function (value) {
					if (scope.includeQuoteRequired) {
						return true;
					}
					return value.quoteRequired === false;
                };
			}
		};
	}]);
}