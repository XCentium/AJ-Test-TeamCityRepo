module insite.account {
    "use strict";

    export class MorscoSelectCustomerController extends SelectCustomerController {

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
                this.customerService.getBillTos("IncludeExtraAddresses=False").success(billToResult => {
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
    }

    angular
        .module("insite")
        .controller("SelectCustomerController", MorscoSelectCustomerController);
}
