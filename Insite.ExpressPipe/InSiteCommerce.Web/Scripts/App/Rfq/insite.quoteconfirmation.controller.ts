module insite.rfq {
    "use strict";

    export class QuoteConfirmationController {
        confirmedOrderId: any;
        quote: any;

        static $inject = ["rfqService", "coreService"];
        constructor(
            protected rfqService: any,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.rfqService.expand = "billTo";
            this.confirmedOrderId = this.coreService.getQueryStringParameter("cartid");
            this.getQuote();    
        }

        getQuote(): void {
            this.rfqService.getQuote(this.confirmedOrderId).then(
                (quote) => {
                    this.quote = quote;
                    this.quote.cartLines = this.quote.quoteLineCollection;
                });
        }
    }

    angular
        .module("insite")
        .controller("QuoteConfirmationController", QuoteConfirmationController);
} 