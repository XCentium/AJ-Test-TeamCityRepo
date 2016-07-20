module insite.cart {
    "use strict";

    export class CartController {
        cart: CartModel;
        promotions: PromotionModel[];
        settings: CartSettingsModel;
        showInventoryAvailability = false;
        
		static $inject = [
			"$scope",
			"$window",
            "cartService",
            "promotionService"
        ];

        constructor(
            protected $scope: ICartScope,
            protected $window: ng.IWindowService,
            protected cartService: ICartService,
            protected promotionService: promotions.IPromotionService) {

            this.init();
        }

        init() {
            this.initEvents();
            this.cartService.cartLoadCalled = true; // prevents request race
        }

        protected initEvents(): void {
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.cartSettings;
                this.showInventoryAvailability = data.productSettings.showInventoryAvailability;
                this.cartService.expand = "cartlines,costcodes";
                if (this.settings.showTaxAndShipping) {
                    this.cartService.expand += ",shipping,tax";
                }
                this.cartService.getCart();
            });
            this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                this.cart = cart;
                this.promotionService.getCartPromotions("current").success((result: PromotionCollectionModel) => {
                    this.promotions = result.promotions;
                });
            });
        }

        continueCheckout(url: any): void {
            window.location = url;
        }

        emptyCart(emptySuccessUri: string) {
            this.cartService.removeCart(this.cart).success(result => {
                this.$window.location.href = emptySuccessUri;
            });
        }

        saveCart(saveSuccessUri: string, signInUri: string): void {
            if (!this.cart.isAuthenticated) {
                this.$window.location.href = signInUri + "?returnUrl=" + this.$window.location.href;
                return;
            }

            this.cart.status = "Saved";
            this.cartService.updateCart(this.cart).success(result => {
                this.$window.location.href = saveSuccessUri + "?cartid=" + result.id;
            });
        }

        submitRequisition(submitRequisitionSuccessUri: string): void {
            this.cart.status = "RequisitionSubmitted";
            this.cartService.updateCart(this.cart).then(() => {
                this.$window.location.href = submitRequisitionSuccessUri;
            });
        }

        continueShopping($event): void {
            var host: string = this.$window.document.location.host;
            var referrer: string = this.$window.document.referrer.toLowerCase();
            if (referrer.indexOf(host + "/catalog/") !== -1 ||
                referrer.indexOf(host + "/search?") !== -1)
            {
                $event.preventDefault();
                this.$window.document.location.href = this.$window.document.referrer;
            }
        }
    }

    angular
        .module("insite")
        .controller("CartController", CartController);
}