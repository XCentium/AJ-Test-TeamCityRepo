import BreakPriceDto = Insite.Catalog.Services.Dtos.BreakPriceDto;

module insite.catalog {
    "use strict";

    // controller for isc-product-price directive
    export class ProductPriceController {

        public static $inject = [
            "$scope"
        ];

        constructor(protected $scope: ng.IScope) {
        }

        getActualPrice(product: ProductDto): string {
            var priceBreak = this.getBreakPrice(product.pricing.actualBreakPrices, product.qtyOrdered);

            if (product.pricing.isOnSale && priceBreak && (product.pricing.actualPrice < priceBreak.breakPrice)) {
                return product.pricing.actualPriceDisplay;
            }

            return this.getPrice(product.pricing.actualBreakPrices, product.pricing.actualPriceDisplay, product.qtyOrdered);;
        }

        getRegularPrice(product: ProductDto): string {
            return this.getPrice(product.pricing.regularBreakPrices, product.pricing.regularPriceDisplay, product.qtyOrdered);
        }

        protected getPrice(breaks: BreakPriceDto[], priceToDisplay: string, qty: any): string {
            qty = !qty || qty === "0" ? 1 : qty;

            if (this.conditionBreakPrice(breaks, qty)) {
                return priceToDisplay;
            }

            var breakPrice: BreakPriceDto = this.getBreakPrice(breaks, qty);

            return breakPrice.breakPriceDisplay;
        }

        protected conditionBreakPrice(breaks: BreakPriceDto[], count: number): boolean {
            return !breaks || breaks.length === 0 || count === 0;
        }

        protected getBreakPrice(breaks: BreakPriceDto[], count: number): BreakPriceDto {
            if (!breaks) {
                return null;
            }
            var copyBreaks = breaks.slice();
	        copyBreaks.sort((a, b) => { return b.breakQty - a.breakQty });

            for (var i = 0; i < copyBreaks.length; i++) {
                if (copyBreaks[i].breakQty <= count) {
                    return copyBreaks[i];
                }
            }

            return copyBreaks[copyBreaks.length];
        }
    };

    angular
        .module("insite")
        .controller("ProductPriceController", ProductPriceController);
}
