module insite.savedorders {
    "use strict";

    export class SavedOrderDetailController {

        cart: CartModel = null;
        canAddToCart = false;
        canAddAllToCart = false;
        showInventoryAvailability = false;

        static $inject = [
            "$scope",
            "$window",
            "cartService",
            "coreService",
            "spinnerService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService) {

            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded",(event, data) => {
                data.productSettings.showAddToCartConfirmationDialog = false; //We do not need a popups for this page
                this.showInventoryAvailability = data.productSettings.showInventoryAvailability;
            });

            var cartId = this.coreService.getQueryStringParameter("cartid", true);

            this.cartService.expand = "cartlines,costcodes";
            this.cartService.getCart(cartId).then(cart => {
                this.cart = cart;
                var addToCartCount = this.cart.cartLines.filter(l => l.canAddToCart).length;
                this.canAddToCart = addToCartCount >= 1;
                this.canAddAllToCart = addToCartCount >= this.cart.cartLines.length;
            });
        }
        
        placeSavedOrder(cartUri: string) {
            var availableLines = this.cart.cartLines.filter(l => l.canAddToCart);
            if (availableLines.length > 0) {
                this.spinnerService.show();
                this.cartService.addLineCollection(availableLines, true).then(() => {
                    this.deleteSavedOrder(cartUri);
                });
            }
        }
        
        deleteSavedOrder(redirectUri: string) {
            this.cartService.removeCart(this.cart).then(() => {
                this.$window.location.href = redirectUri;
            });
        }
    }

    angular
        .module("insite")
        .controller("SavedOrderDetailController", SavedOrderDetailController);
}