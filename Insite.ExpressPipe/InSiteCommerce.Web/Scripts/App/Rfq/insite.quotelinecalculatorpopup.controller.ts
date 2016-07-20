module insite.rfq {
    "use strict";

    export class QuoteLineCalculatorPopupController {
        quote: QuoteModel;
        maxPriceBreaks = 5;
        quoteLine: QuoteLineModel;
        showCalculator = false;
        currentCalculatorLineIndex: number;
        initialBreakPricesState: BreakPriceRfqModel[];
        calculationMethod: any;
        displayMaxQty = '0';
        priceRequired = false;
        invalidPrice = false;
        invalidQty = false;

        static $inject = [
            "$scope",
            "coreService",
            "rfqService"
        ];

        constructor(protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected rfqService: rfq.IRfqService) {

            this.init();
        }

        init() {
            this.$scope.$on("openLineCalculator",(event, data) =>
            {
                if (this.quoteLine && this.quoteLine.id !== data.id)
                {
                    this.priceRequired = false;
                    this.invalidPrice = false;
                }
                this.quoteLine = data;
                this.getCurentMaxQty();
                this.initialize();
                this.showPopup();
            });
        }

        initialize() {
            this.showCalculator = false;
            this.currentCalculatorLineIndex = null;
            this.initialBreakPricesState = angular.copy(this.quoteLine.pricingRfq.priceBreaks);
        }

        showPopup() {
            this.coreService.displayModal(angular.element("#popup-quote-item"));
        }

        getCurentMaxQty() {
            var count = this.quoteLine.pricingRfq.priceBreaks.length;
            if (count !== 0) {
                var lastBreakPrice = this.quoteLine.pricingRfq.priceBreaks[count - 1];
                if (lastBreakPrice.endQty > 0) {
                    this.displayMaxQty = lastBreakPrice.endQtyDisplay;
                } else {
                    this.displayMaxQty = "Max";
                }
            }
        }

        openCalculator(index: number): void {
            if (this.quote && this.quote.calculationMethods) {
                this.calculationMethod = this.quote.calculationMethods[0];
            }
            this.showCalculator = true;
            this.currentCalculatorLineIndex = index;
        }

        cancelCalculator(index: number) {
            this.showCalculator = false;
            this.currentCalculatorLineIndex = null;
        }

        changeCalculationMethod_Test() {
            var field = $("#popup-quote-item [name='percent']");//.rules("remove");
            if (this.calculationMethod.value === "List") {
                field.rules("add", { min: 2 });
            }
            if (this.calculationMethod.value === "Customer") {
                field.rules("add", { max: 10 });
            }
            if (this.calculationMethod.value === "Margin") {
                field.rules("add", { max: 20 });
            }
            
        }

        applyBreakDiscount(index: number): void {
            var breakPrice = this.quoteLine.pricingRfq.priceBreaks[index];
            if (breakPrice.percent != null && breakPrice.percent > 0) {
                // List, Customer, Margin
                var basePrice: number;
                if (this.calculationMethod.value === "List") {
                    basePrice = this.quoteLine.pricingRfq.listPrice;
                    breakPrice.price = basePrice - ((breakPrice.percent / 100) * basePrice);
                }
                if (this.calculationMethod.value === "Customer") {
                    basePrice = this.quoteLine.pricingRfq.customerPrice;
                    breakPrice.price = basePrice - ((breakPrice.percent / 100) * basePrice);
                }
                if (this.calculationMethod.value === "Margin") {
                    basePrice = this.quoteLine.pricingRfq.unitCost;
                    breakPrice.price = basePrice === 0 ? -1 : basePrice / (1 - breakPrice.percent / 100);
                }
                this.validateQuoteLineCalculatorForm();
            }
        }

        addPriceBreak() {
            if (!this.validateQuoteLineCalculatorForm()) {
                return;
            }

            var newBreakPrice = <BreakPriceRfqModel>{};
            if (this.quoteLine.pricingRfq.priceBreaks.length !== 0) {
                var index = this.quoteLine.pricingRfq.priceBreaks.length - 1;
                var lastBreak = this.quoteLine.pricingRfq.priceBreaks[index];
                newBreakPrice.endQty = this.quoteLine.maxQty;
                if (lastBreak.endQty === 0) {
                    lastBreak.endQty = lastBreak.startQty;
                } else {
                    lastBreak.endQty = Math.round(lastBreak.endQty);
                }
                newBreakPrice.startQty = lastBreak.endQty + 1;

                lastBreak.endQtyDisplay = lastBreak.endQty.toString();
            }
            else {
                newBreakPrice.startQty = 1;
                newBreakPrice.endQty = this.quoteLine.maxQty;
            }

            newBreakPrice.endQtyDisplay = newBreakPrice.endQty.toString();
            this.quoteLine.pricingRfq.priceBreaks.push(newBreakPrice);
            this.getCurentMaxQty();
        }

        clearBreaks() {
            this.quoteLine.pricingRfq.priceBreaks = angular.copy(this.initialBreakPricesState);
            this.validateQuoteLineCalculatorForm();
        }

        qtyEndKeyPress(keyEvent, index) {
            if (keyEvent.which === 13) {
                this.updateMaxQty(keyEvent, index);
            }
        }

        updateMaxQty(keyEvent, index) {

            this.formatEndQty(index);

            if (!this.validateQuoteLineCalculatorForm()) {
                return;
            }

            var maxQty = 0;

            if (this.displayMaxQty !== "Max") {
                maxQty = Math.round(Number(this.displayMaxQty));

                if (isNaN(maxQty)) {
                    maxQty = 0;
                }
            }

            var lastBreak = this.quoteLine.pricingRfq.priceBreaks[index];
            if (maxQty && maxQty > 0) {

                if (maxQty < lastBreak.startQty) {
                    maxQty = lastBreak.startQty;
                }

                lastBreak.endQty = maxQty;
                lastBreak.endQtyDisplay = maxQty.toString();
                this.displayMaxQty = lastBreak.endQtyDisplay;
            } else {
                if (keyEvent) {
                    this.displayMaxQty = keyEvent.target.attributes['data-attr-name'].value;
                    lastBreak.endQty = maxQty;
                    lastBreak.endQtyDisplay = maxQty.toString();
                }
            }
        }

        formatStartQty(index) {
            var numValue = Math.round(Number(this.quoteLine.pricingRfq.priceBreaks[index].startQty));

            if (isNaN(numValue)) {
                numValue = 0;
            }

            if (index > 0 && numValue > 0) {
                this.quoteLine.pricingRfq.priceBreaks[index - 1].endQty = numValue - 1;
                this.quoteLine.pricingRfq.priceBreaks[index - 1].endQtyDisplay = this.quoteLine.pricingRfq.priceBreaks[index - 1].endQty.toString();
            } 

            this.quoteLine.pricingRfq.priceBreaks[index].startQty = numValue;
        }

        formatEndQty(index) {
            var numValue = Math.round(Number(this.displayMaxQty));

            if (isNaN(numValue)) {
                numValue = 0;
            }

            this.quoteLine.pricingRfq.priceBreaks[index].endQty = numValue;
            this.displayMaxQty = numValue !== 0 ? numValue.toString() : "Max";
            this.quoteLine.pricingRfq.priceBreaks[index].endQtyDisplay = this.displayMaxQty;
        }

        startQtyChanged(index) {
            this.formatStartQty(index);

            if (!this.validateQuoteLineCalculatorForm()) {
                return;
            }
        }

        removeLine(index) {
            var lastIndex = this.quoteLine.pricingRfq.priceBreaks.length - 1;

            if (index === this.currentCalculatorLineIndex) {
                this.cancelCalculator(index);
            }

            if (index !== 0) {
                this.quoteLine.pricingRfq.priceBreaks[index - 1].endQty = this.quoteLine.pricingRfq.priceBreaks[index].endQty;
                this.quoteLine.pricingRfq.priceBreaks[index - 1].endQtyDisplay = this.quoteLine.pricingRfq.priceBreaks[index - 1].endQty.toString();
            }

            this.quoteLine.pricingRfq.priceBreaks.splice(index, 1);
            this.validateQuoteLineCalculatorForm();
        }

        applyQuoteBreaks() {
            if (!this.validateQuoteLineCalculatorForm()) {
                return;
            }
            var quoteLine = <QuoteLineModel>{};
            quoteLine.id = this.quoteLine.id;
            quoteLine.pricingRfq = this.quoteLine.pricingRfq;
            if (this.quote.isJobQuote) {
                quoteLine.pricingRfq.priceBreaks = this.quoteLine.pricingRfq.priceBreaks.filter(x => this.shouldShowPriceBreak(x));
            }
            this.rfqService.patchLine(this.quote.id, quoteLine).then(
                (result : QuoteLineModel) => {
                    var index = this.quote.quoteLineCollection.indexOf(this.quoteLine);
                    this.quote.quoteLineCollection[index].pricing = result.pricing;
                    this.quote.quoteLineCollection[index].pricingRfq = result.pricingRfq;
                    this.quote.quoteLineCollection[index].maxQty = result.maxQty;
                    this.closeModal('#popup-quote-item');
                });
        }

        priceIsValid(index: number): boolean {
            if (!this.quoteLine.pricingRfq.priceBreaks[index].price || isNaN(this.quoteLine.pricingRfq.priceBreaks[index].price)) {
                this.priceRequired = true;
                return false;
            }
            if (this.quoteLine.pricingRfq.minimumPriceAllowed > 0 && this.quoteLine.pricingRfq.priceBreaks[index].price < this.quoteLine.pricingRfq.minimumPriceAllowed) {
                this.invalidPrice = true;
                return false;
            }
            return true;
        }

        startQtyIsValid(index: number): boolean {
            var result = true;

            if (index === 0) {
                if (!isNaN(this.quoteLine.pricingRfq.priceBreaks[0].startQty)
                    && this.quoteLine.pricingRfq.priceBreaks[0].startQty !== 1) {
                    this.invalidQty = true;
                    result = false;
                }
            } else {
                if (this.quoteLine.pricingRfq.priceBreaks[index].startQty <= this.quoteLine.pricingRfq.priceBreaks[index - 1].startQty
                    || this.quoteLine.pricingRfq.priceBreaks[index].startQty < this.quoteLine.pricingRfq.priceBreaks[index - 1].endQty) {
                    this.invalidQty = true;
                    result = false;
                }

                if ((index === this.quoteLine.pricingRfq.priceBreaks.length - 1)
                    && !isNaN(this.quoteLine.pricingRfq.priceBreaks[this.quoteLine.pricingRfq.priceBreaks.length - 1].startQty)
                    && Number(this.displayMaxQty) < this.quoteLine.pricingRfq.priceBreaks[this.quoteLine.pricingRfq.priceBreaks.length - 1].startQty) {
                    this.invalidQty = true;
                    result = false;
                }
            }

            return result;
        }

        endQtyIsValid(index: number): boolean {
            var result = true;

            if ((index === this.quoteLine.pricingRfq.priceBreaks.length - 1)
                && !isNaN(Number(this.displayMaxQty))
                && Number(this.displayMaxQty) < this.quoteLine.pricingRfq.priceBreaks[this.quoteLine.pricingRfq.priceBreaks.length - 1].startQty) {
                this.invalidQty = true;
                result = false;
            }

            return result;
        }

        validateQuoteLineCalculatorForm() {
            this.priceRequired = false;
            this.invalidPrice = false;
            this.invalidQty = false;

            if (this.quoteLine) {
                for (var i = 0; i < this.quoteLine.pricingRfq.priceBreaks.length; i++) {
                    if (!this.shouldShowPriceBreak(this.quoteLine.pricingRfq.priceBreaks[i])) {
                        continue;
                    }

                    this.priceIsValid(i);

                    if (!this.quote.isJobQuote) {
                        this.startQtyIsValid(i);
                    }
                }
            }

            return !this.priceRequired && !this.invalidPrice && !this.invalidQty;
        }

        shouldShowPriceBreak(priceBreak) {
            if (!this.quote || !this.quoteLine) {
                return false;
            }

            if (this.quote.isJobQuote) {
                return this.quoteLine.pricingRfq.priceBreaks.slice().sort((a, b) => b.startQty - a.startQty).filter(x => x.startQty <= this.quoteLine.qtyOrdered)[0].startQty === priceBreak.startQty;
            }

            return true;
        }

        closeModal(selector: string): void {
            this.coreService.closeModal(selector);
        }
    }

    angular
        .module("insite")
        .controller("QuoteLineCalculatorPopupController", QuoteLineCalculatorPopupController);
}