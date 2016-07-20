module insite.rfq {
    "use strict";

    export class QuoteDetailsController {
        quoteId : string;
        openLineNoteId = "";
        cart: CartModel;
        isCartEmpty: boolean;
        quote: QuoteModel;
        formValid = false;
        calculationMethod: any;
        percent: number;
        minimumMargin: number;
        maximumDiscount: any;

        static $inject = ["$window", "$rootScope", "$scope", "coreService", "rfqService"];
        constructor(protected $window: ng.IWindowService,
            protected $rootScope: ng.IScope,
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected rfqService: rfq.IRfqService) {

            this.init();
        }

        init() {
            this.initEvents();
            this.quoteId = this.coreService.getQueryStringParameter("quoteId");
            this.getQuote();
            this.validateForm();
        }

        protected initEvents(): void {
            this.$scope.$on("cartLoaded",(event, cart: CartModel) => {
                this.cart = cart;
                this.isCartEmpty = cart.lineCount === 0;
            });
        }
        
        getQuote(): void {
            this.rfqService.getQuote(this.quoteId).then((result) => {
                this.quote = result;
                if (this.quote && this.quote.calculationMethods && this.quote.calculationMethods.length > 0) {
                    this.calculationMethod = this.quote.calculationMethods[0];
                    this.changeCalculationMethod();
                }
            });
        }

        acceptCheckout(url): void {
            this.validateForm();
            if (!this.formValid) {
                return;
            }
            if (!this.isCartEmpty) {
                angular.element("#rfqPopupCartNotificationLink").trigger("click");
            } else {
                this.continueCheckout(url);
            }
        }

        acceptJobQuote(url): void {
            this.validateForm();
            if (!this.formValid) {
                return;
            }

            if (!this.validateExpirationDateForm()) {
                return;
            }

            var parameters = {
                quoteId: this.quoteId,
                status: "JobAccepted"
            };

            this.rfqService.patchQuote(this.quoteId, parameters).then(() => {
                this.$window.location.href = url;
            });
        }

        continueCheckout(url): void {
            url += this.quoteId;
            this.$window.location.href = url; 
        }

        declineQuote(returnUrl): void {
            var quoteInfo = {
                quoteId: this.quoteId,
                status: "QuoteRejected"
            };

            this.rfqService.patchQuote(this.quoteId, quoteInfo)
                .then( () => {this.$window.location.href = returnUrl;});
        }

        closeModal(selector: string): void {
            this.coreService.closeModal(selector);
        }

        submitQuote(url: string): void {
            if (!this.validateExpirationDateForm()) {
                return;
            }

            var parameters = {
                quoteId: this.quoteId,
                status: "QuoteProposed"
            };

            this.rfqService.patchQuote(this.quoteId, parameters).then(() => {
                this.$window.location.href = url;
            });
        }

        applyQuote(): void {
            if (!this.validateQuoteCalculatorForm()) {
                return;
            }
            var quoteInfo = {
                quoteId: this.quoteId,
                calculationMethod: this.calculationMethod.name,
                percent: this.percent
            };

            this.rfqService.patchQuote(this.quoteId, quoteInfo).then((result) => {
                this.quote.quoteLineCollection = result.quoteLineCollection;
                this.closeModal("#orderCalculator");
            });
        }

        openOrderCalculatorPopup() {
            this.coreService.displayModal(angular.element("#orderCalculator"));
        }

        changeCalculationMethod() {
            this.maximumDiscount = this.calculationMethod.maximumDiscount > 0 ? this.calculationMethod.maximumDiscount : false;
            this.minimumMargin = 0;
            for (var i = 0; i < this.quote.quoteLineCollection.length; i++) {
                var minLineMargin = 100 - (this.quote.quoteLineCollection[i].pricingRfq.unitCost * 100 / this.quote.quoteLineCollection[i].pricingRfq.minimumPriceAllowed);
                this.minimumMargin = minLineMargin > this.minimumMargin ? minLineMargin : this.minimumMargin;
            }
            this.minimumMargin = this.calculationMethod.minimumMargin > 0 ? this.minimumMargin > this.calculationMethod.minimumMargin ? this.minimumMargin : this.calculationMethod.minimumMargin : 0;

            $("#rfqApplyOrderQuoteForm input").data("rule-min", this.minimumMargin);
            $("#rfqApplyOrderQuoteForm input").data("rule-max", this.maximumDiscount > 0 ? (this.maximumDiscount * 1) : 'false');

            //this.resetValidationCalculatorForm();
            //this.validateQuoteCalculatorForm();
        }

        openOrderLineCalculatorPopup(quoteLine: any) {
            this.$rootScope.$broadcast("openLineCalculator", quoteLine);
        }

        protected validateForm() {
            var form = angular.element("#quoteDetailsForm");
            if (form && form.length !== 0) {
                this.formValid = form.validate().form();   
            }
        }

        protected validateExpirationDateForm() {
            var form = angular.element("#updateExpirationDate");
            if (form && form.length !== 0) {
                return form.validate().form();
            }
            return true;
        }

        protected validateQuoteCalculatorForm() {
            var form = angular.element("#rfqApplyOrderQuoteForm");
            if (form && form.length !== 0) {
                var validator = form.validate({
                    errorLabelContainer: "#rfqApplyOrderQuoteFormError"
                });
                validator.resetForm();
                return form.validate().form();
            }
            return true;
        }

        protected resetValidationCalculatorForm() {
            var form = angular.element("#rfqApplyOrderQuoteForm");
            if (form && form.length !== 0) {
                var validator = form.validate();
                validator.resetForm();
                //$("#rfqApplyOrderQuoteForm .field-validation-error").hide();// Class("error")
                //$(".field-validation-error").
            }
        }

        protected getPriceForJobQuote(priceBreaks: any[], qtyOrdered) {
            return priceBreaks.slice().sort((a, b) => b.startQty - a.startQty).filter(x => x.startQty <= qtyOrdered)[0].priceDispaly;
        }
    }

    angular
        .module("insite")
        .controller("QuoteDetailsController", QuoteDetailsController);
}