module insite.rfq {
    "use strict";

    export class RecentQuotesController {
        quotes: any;
        parameters: any;
        quoteSettings: QuoteSettingsModel;

        static $inject = ["$scope", "rfqService"];

        constructor(
            protected $scope: ng.IScope,
            protected rfqService: rfq.IRfqService) {

            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded", (event, data) => {
                this.quoteSettings = data.quoteSettings;
            });
            this.$scope.$on("cartLoaded", (event, cart: CartModel) => {
                if (cart.canRequestQuote) {
                    this.getQuotes();
                }
            });
        }

        getQuotes(): any {
            this.parameters = {};
            this.parameters.pageSize = 5;

            this.rfqService.getQuotes(this.parameters, null).success((result) => {
                this.quotes = result.quotes;
            });
        }
    }

    angular
        .module("insite")
        .controller("RecentQuotesController", RecentQuotesController);
}