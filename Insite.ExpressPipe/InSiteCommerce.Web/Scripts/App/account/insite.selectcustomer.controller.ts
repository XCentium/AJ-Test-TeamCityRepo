module insite.account {
    "use strict";

    export class SelectCustomerController {

        billTo: BillToModel;
        billTos: BillToModel[];
        dashboardUrl: string;
        errorMessage = "";
        returnUrl: string;
        shipTo: ShipToModel;
        homePageUrl: string;
        checkoutAddressUrl: string;
        reviewAndPayUrl: string;
        addressesUrl: string;
        cart: CartModel;

        static $inject = ["$scope", "$window", "accountService", "sessionService", "customerService", "coreService"];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected sessionService: ISessionService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.returnUrl = this.coreService.getQueryStringParameter("returnUrl", true);
            if (!this.returnUrl) {
                this.returnUrl = this.homePageUrl;
            }

            this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel) => {
                this.cart = cart;
            });

            this.$scope.$on("settingsLoaded",(event, settings) => {
                var customerSettings = settings.customerSettings;
                this.customerService.getBillTos("shiptos,state,validation").success(billToResult => {
                    this.billTos = billToResult.billTos;
                    if (!customerSettings.allowCreateNewShipToAddress) {
                        this.billTos = this.billTos.filter(x => x.shipTos.length > 0);
                    }
                    if (this.billTos && this.billTos.length === 1) {
                        this.billTo = this.billTos[0];
                        this.changeBillTo();
                    }
                });
            });
        }

        cancel() {
            this.$window.location.href = this.returnUrl;
        }

        setCustomer() {
            if (!this.billTo || !this.shipTo) {
                return;
            }
            this.sessionService.setCustomer(this.billTo.id, this.shipTo.id).then((result: SessionModel) => {
                result.shipTo = this.shipTo;
                this.sessionService.redirectAfterSelectCustomer(result, this.cart.canBypassCheckoutAddress,
                    this.dashboardUrl, this.returnUrl, this.checkoutAddressUrl, this.reviewAndPayUrl, this.addressesUrl);
            }, error => {
                    this.errorMessage = error.message;
            });
        }

        changeBillTo(): void {
            if (this.billTo && this.billTo.shipTos && this.billTo.shipTos.length === 1)
            {
                this.shipTo = this.billTo.shipTos[0];
            }
        }
    }

    angular
        .module("insite")
        .controller("SelectCustomerController", SelectCustomerController);
}
