module insite.rfq {
    "use strict";

    export class QuoteProposedDetailsController {
        openLineNoteId = "";
        quote: QuoteModel;
        formValid: boolean;
        
        static $inject = ["$window", "$scope", "coreService", "rfqService"];
        constructor(protected $window: ng.IWindowService,
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected rfqService: rfq.IRfqService) {
        }

        updateLine(quoteLine: QuoteLineModel, refresh?: boolean): void {
            this.rfqService.patchLine(this.quote.id, quoteLine).then((result) =>
            {
                if (refresh) {
                    this.updateSubTotal();
                    quoteLine.pricing.actualPrice = result.pricing.actualPrice;
                    quoteLine.pricing.actualPriceDisplay = result.pricing.actualPriceDisplay;
                    quoteLine.pricing.extendedActualPrice = result.pricing.extendedActualPrice;
                    quoteLine.pricing.extendedActualPriceDisplay = result.pricing.extendedActualPriceDisplay;
                }
            });
        }

        updateSubTotal() {
            this.rfqService.getQuote(this.quote.id).then((result) => 
            {
                this.quote.orderSubTotal = result.orderSubTotal;
                this.quote.orderSubTotalDisplay = result.orderSubTotalDisplay;
                this.quote.quoteLineCollection = result.quoteLineCollection;
            }); 
        }

        quantityBlur(event, quoteLine): void {
            this.validateForm();
            var valid = $(event.target).valid();
            if (!valid) {
                this.formValid = false;
                return;
            }
            this.updateLine(quoteLine, true);
        }

        quantityKeyPress(keyEvent, quoteLine): void {
            this.validateForm();
            if (keyEvent.which === 13) {
                var valid = $(keyEvent.target).valid();
                if (!valid) {
                    this.formValid = false;
                    return;
                }
                this.updateLine(quoteLine, true);
            }
        }

        notesKeyPress(keyEvent: KeyboardEvent, quoteLine: QuoteLineModel) {
            if (keyEvent.which === 13) {
                this.updateLine(quoteLine, false);
            }
        }

        notePanelClicked(lineId: string) {
            if (this.openLineNoteId === lineId)
                this.openLineNoteId = "";
            else
                this.openLineNoteId = lineId;
        }

        protected validateForm() {
            var form = angular.element("#quoteDetailsForm");
            if (form && form.length !== 0) {
                this.formValid = form.validate().form();
            }
        }

    }

    angular
        .module("insite")
        .controller("QuoteProposedDetailsController", QuoteProposedDetailsController);
}