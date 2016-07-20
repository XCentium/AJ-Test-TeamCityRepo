module insite.layout {
    "use strict";

    export class HeaderController {
        cart: CartModel;
        
        static $inject = ["$scope", "$timeout", "cartService"];

        constructor(
            protected $scope: ng.IScope,
            protected $timeout: ng.ITimeoutService,
            protected cartService: cart.ICartService) {

            this.init();
        }

        init() {
            this.$scope.$on("cartLoaded",(event, cart) => {
                this.cart = cart;
            });

            // use a short timeout to wait for anything else on the page to call to load the cart
            this.$timeout(() => {
                if (!this.cartService.cartLoadCalled) {
                    this.cartService.getCart();
                }
            }, 20);
        }
    }

    angular
        .module("insite")
        .controller("HeaderController", HeaderController);
} 