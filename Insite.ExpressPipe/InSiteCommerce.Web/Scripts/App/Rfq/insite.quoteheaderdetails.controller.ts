module insite.rfq {
    "use strict";

    export class QuoteHeaderDetailsController {
        quote: QuoteModel;
        quoteExpireDays: number;

        static $inject = ["$scope", "rfqService"];

        constructor(protected $scope: ng.IScope, protected rfqService: rfq.IRfqService) {
            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded", (event, data) => {
                this.quoteExpireDays = data.quoteSettings.quoteExpireDays;
            });
        }

        updateExpirationDate(): void {
            if (!this.validateExpirationDateForm()) {
                return;
            }

            var quoteInfo = {
                quoteId: this.quote.id,
                expirationDate: this.quote.expirationDate
            };

            this.rfqService.patchQuote(this.quote.id, quoteInfo);
        }

        protected validateExpirationDateForm() {
            var form = angular.element("#updateExpirationDate");
            if (form && form.length !== 0) {
                return form.validate().form();
            }
            return true;
        }
    }

    angular
        .module("insite")
        .controller("QuoteHeaderDetailsController", QuoteHeaderDetailsController);
}