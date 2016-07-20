module insite.cart {
    "use strict";

    export class MorscoPaymentSelectorController extends PaymentSelectorController {
        
        static $inject = [
            "promotionService",
            "$scope"
        ];

        constructor(protected promotionService: promotions.IPromotionService,
            protected $scope: ng.IScope) {
            super(promotionService, $scope);
        }
        
        filterPaymentMethod(cart) {
            return function (paymentMethod) {
                if (paymentMethod.name == 'Pickup' && cart.carrier.description == 'Deliver') {
                    return false;
                }
                return true;
            }
        }

    }

    angular
        .module("insite")
        .controller("PaymentSelectorController", MorscoPaymentSelectorController);
}
