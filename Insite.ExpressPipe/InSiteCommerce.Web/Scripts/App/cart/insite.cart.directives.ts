module insite.account {
    "use strict";

    angular
        .module("insite")
        .directive("iscMicroCart", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/MicroCart"),
                scope: {
                    cart: "="
                }
            };
        }])
        .directive("iscAddToCartPopup", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/AddToCartPopup"),
                controller: "AddToCartPopupController",
                controllerAs: "vm",
                scope: { },
                bindToController: true
            };
        }])
        .directive("iscShippingSelector", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/ShippingSelector"),
                scope: {
                    cart: "=",
                    shippingMethodChange: "&",
                    changeCarrier: "&"
                }
            };
        }])
        .directive("iscAddressErrorPopup", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/AddressErrorPopup"),
                scope: {
                },
                controller: "AddressErrorPopupController",
                controllerAs: "vm",
                bindToController: true
            }
        }])
        .directive("iscPaymentSelector", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/PaymentSelector"),
                scope: {
                    cartId: "=",
                    cart: "=",
                    applyPromotionCallback: "&",
                    submitPaypal: "&"
                },
                controller: "PaymentSelectorController",
                controllerAs: "vm",
                bindToController: true
            };
        }])
        .directive("iscCartSummary", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/CartSummary")
            };
        }])
        .directive("iscCartLines", ["coreService", function (coreService) { 
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/CartLines"),
                scope: {
                    cart: "=",
                    inventoryCheck: "@",
                    includeInventory: "@",
                    includeQuoteRequired: "="
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
                }
            };
        }])
        .directive("iscCartLineNote", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/CartLineNote"),
                scope: {
                    openLineNoteId: "=",
                    editable: "@",
                    cart: "=",
                    cartLine: "="
                },
                controller: "CartLineNoteController",
                controllerAs: "vm"
            };
        }])
        .directive("iscCartTotalDisplay", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/CartTotalDisplay"),
                scope: {
                    cart: "=",
                    promotions: "=",
                    isCartPage: "="
                }
            };
        }])
        .directive("iscCartView", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/CartView"),
                controller: "CartController",
                controllerAs: "vm"
            };
        }])
        .directive("iscCheckoutAddressView", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/CheckoutAddressView"),
                controller: "CheckoutAddressController",
                controllerAs: "vm"
            };
        }])
        .directive("iscReviewAndPayView", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/ReviewAndPayView"),
                controller: "ReviewAndPayController",
                controllerAs: "vm",
                scope: {
                    cartUrl: "@"
                },
                bindToController: true
            };
        }])
        .directive("iscOrderConfirmationView", ["coreService", function (coreService) {
            return {
                restrict: "E",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Cart/OrderConfirmationView"),
                controller: "OrderConfirmationController",
                controllerAs: "vm"
            };
        }]);
}