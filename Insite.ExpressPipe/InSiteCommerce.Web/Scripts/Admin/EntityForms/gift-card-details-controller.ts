module insite_admin {
    "use strict";

    export class GiftCardDetailsController extends EntityDetailsController {
        balance: number;

        init() {
            this.expandProperties = ["giftCardTransactions", "customProperties"];

            this.$scope.$watchGroup([() => this.model.amount, () => this.model.conversionRate], (newValue) => {
                if (typeof newValue[0] === "number" && typeof newValue[1] === "number") {
                    this.model.currencyAmount = newValue[0] * newValue[1];
                }
            });

            this.$scope.$watch(() => this.model.amount, (newValue) => {
                if (typeof newValue === "number") {
                    this.balance = this.model.amount - this.getSumOfTransactions();
                }
            });

            super.init();
        }

        private getSumOfTransactions() {
            if (!this.model.giftCardTransactions) {
                return 0;
            }

            return this.model.giftCardTransactions.reduce((prev, cur) => prev + cur.amount, 0);
        }
    }

    angular
        .module("insite-admin")
        .controller("GiftCardDetailsController", GiftCardDetailsController);
}