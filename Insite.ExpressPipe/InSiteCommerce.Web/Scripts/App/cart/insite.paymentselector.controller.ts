module insite.cart {
    "use strict";

    export class PaymentSelectorController {

        cart: CartModel;
        cartId: string;
        promotionAppliedMessage: string;
        promotionCode: string;
        promotionErrorMessage: string;
        applyPromotionCallback: () => void;
        submitPaypal: (returnUrl: string, signInUrl: string) => void;
        settings: CartSettingsModel;

        static $inject = [
            "promotionService",
            "$scope"
        ];

        constructor(
            protected promotionService: promotions.IPromotionService,
            protected $scope: ng.IScope) {
            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded", (event, data) => {
                this.settings = data.cartSettings;
            });
        }


        applyPromotion() {
            this.promotionAppliedMessage = "";
            this.promotionErrorMessage = "";

            var promotion = {
                "promotionCode": this.promotionCode
            };

            this.promotionService.applyCartPromotion(this.cartId, promotion).success(result => {
                if (result.promotionApplied) {
                    this.promotionAppliedMessage = result.message;
                } else {
                    this.promotionErrorMessage = result.message;
                }
            }).error(error => {
                this.promotionErrorMessage = error.message;
            }).finally(this.applyPromotionCallback);
        }
    }

    angular
        .module("insite")
        .controller("PaymentSelectorController", PaymentSelectorController);
}
