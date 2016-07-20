
module insite.rfq {
    "use strict";

    export class MorscoQuoteDetailsGridController {
        openLineNoteId = "";
        quoteId: string;
        formValid = false;

        static $inject = ["$window", "$rootScope", "$scope", "coreService", "rfqService", "specialOrderService", "spinnerService", "cartService"];
        constructor(protected $window: ng.IWindowService,
					protected $rootScope: ng.IScope,
					protected $scope: ng.IScope,
					protected coreService: core.ICoreService,
					protected rfqService: rfq.IRfqService,
					protected specialOrderService: cart.ISpecialOrderService,
                    protected spinnerService: core.ISpinnerService,
                    protected cartService: cart.ICartService) {
			//super($window, $rootScope, $scope, coreService, rfqService);
        }

        notePanelClicked(lineId: string) {
            if (this.openLineNoteId === lineId)
                this.openLineNoteId = "";
            else
                this.openLineNoteId = lineId;
        }

        updateLine(quoteLine: QuoteLineModel, refresh?: boolean): void {
            this.quoteId = this.coreService.getQueryStringParameter("quoteId");
            this.rfqService.patchLine(this.quoteId, quoteLine).then((result) => {
                if (refresh) {
                    this.$rootScope.$broadcast("getQuote", cart);
                }
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
                this.updateQty(quoteLine);
            }
        }

        updateQty(product) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$rootScope.$broadcast("ProductQtyChanged", product);
            }
            this.updateLine(product, true);
        }

        isInt(n) {
            return n % 1 === 0;
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
        .controller("QuoteDetailsGridController", MorscoQuoteDetailsGridController);
}