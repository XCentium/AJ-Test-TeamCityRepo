module insite.orderapproval {
    "use strict";

    export class OrderApprovalDetailController {
        currentCart: CartModel;
        account: AccountModel;
        cart: CartModel;
        approveOrderErrorMessage: string;

        static $inject = [
            "$scope"
            , "orderApprovalService"
            , "$window"
            , "cartService"
            , "accountService"
            , "coreService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected orderApprovalService: orderapproval.IOrderApprovalService,
            protected $window: ng.IWindowService,
            protected cartService: cart.ICartService,
            protected accountService: account.IAccountService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            var cartId = this.coreService.getQueryStringParameter("cartid");

            this.initEvents();

            this.accountService.getAccount().success(account => {
                this.account = account;
            });

            this.orderApprovalService.getCart(cartId).then(cart => {
                this.cart = cart;
                this.canApproveOrders();
            });
        }

        protected initEvents(): void {
            this.$scope.$on("cartLoaded",(event, cart: CartModel) => {
                this.currentCart = cart;
                this.canApproveOrders();
            });
        }

        approveOrder(cartUri: string) {
            this.approveOrderErrorMessage = "";
            this.cart.status = "Cart";
            this.cartService.updateCart(this.cart).success(() => {
                this.$window.location.href = cartUri;
            }).error(error => {
                this.approveOrderErrorMessage = error.message;
            });
        }

        protected canApproveOrders(): void {
            if (this.account && this.account.canApproveOrders && this.cart) {
                this.account.canApproveOrders = this.account.userName !== this.cart.initiatedByUserName;
            }
        }
    }

    angular
        .module("insite")
        .controller("OrderApprovalDetailController", OrderApprovalDetailController);
}