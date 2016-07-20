module insite.rfq {
    "use strict";

    export class MorscoRecentQuotesController extends RecentQuotesController{
      
        getQuotes(): any {
            this.parameters = {};
            this.parameters.pageSize = 5;

            this.rfqService.getQuotes(this.parameters, null)
                .success((result) => {
                    this.quotes = result.quotes;
                    var today = new Date();
                    this.quotes.forEach(quote => {
                        if (quote.statusDisplay === "QuoteRequested") {
                            quote.statusDisplay = "Requested";
                        }
                        else if (quote.statusDisplay === "QuoteProposed") {
                            quote.statusDisplay = "Active";
                            var expires = new Date(quote.expirationDate);
                            if (expires.setHours(0, 0, 0, 0).valueOf() < today.setHours(0, 0, 0, 0).valueOf()) {
                                quote.statusDisplay = "Expired";
                            }
                        }
                        else if (quote.statusDisplay === "QuoteSubmitted") {
                            quote.statusDisplay = "Order Pending";
                        }
                });
            });
        }
    }

    angular
        .module("insite")
        .controller("RecentQuotesController", MorscoRecentQuotesController);
}