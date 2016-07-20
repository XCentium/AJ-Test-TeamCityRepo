module insite.dashboard {
    "use strict";

    export class MorscoDashboardLinksController extends DashboardLinksController {
        cart: CartModel;

        static $inject = ["$scope", "dashboardService", "$rootScope", "cartService", "$timeout"];

        constructor(
            protected $scope: ng.IScope,
            protected dashboardService: IDashboardService,
            protected $rootScope: ng.IRootScopeService,
            protected cartService: cart.ICartService,
            protected $timeout: ng.ITimeoutService) {
            super(dashboardService, $rootScope);
        }

        init() {
            this.getDashboardPanels();

            this.$rootScope.$on("cartLoaded",(event, cart) => {
                this.cart = cart;
            });
        }

        getCssClass(panelType: string): string {
            if (panelType === this.orderKey) {
                return "fa fa-lg fa-check";
            }
            if (panelType === this.requisitionKey) {
                return "fa fa-lg fa-pencil";
            }
            if (panelType === this.quoteKey) {
                return "fa fa-lg fa-calculator";
            }
            return "";
        }
    }

    angular
        .module("insite")
        .controller("DashboardLinksController", MorscoDashboardLinksController);
}  