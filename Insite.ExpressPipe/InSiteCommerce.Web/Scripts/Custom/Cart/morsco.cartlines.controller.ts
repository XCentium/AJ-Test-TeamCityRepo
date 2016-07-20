module insite.cart {
    "use strict";

    export class MorscoCartLinesController extends CartLinesController {

        isAuthenticated: boolean = false;
		isCatalog: string;

        static $inject = [
			"sessionService",
			"$scope",
            "cartService",
            "spinnerService",
            "productService",
            "customProductService",
            "coreService",
            "$rootScope"
        ];

        constructor(protected sessionService: ISessionService,
			protected $scope: ICartScope,
            protected cartService: ICartService,
            protected spinnerService: core.ISpinnerService,
            protected productService: IProductService,
            protected customProductService: catalog.ICustomProductService,
            protected coreService: core.ICoreService,
            protected $rootScope: ng.IRootScopeService) {
            super($scope, cartService, spinnerService);

            this.sessionService.getIsAuthenticated().then(result => {
                this.isAuthenticated = result;
            });
        }
        
        init() {
            this.$scope.$on("cartLoaded", () => {
				this.cartLoadItemBlock();
            });
            this.$scope.$on("cartIdLoaded", () => {
				
				this.cartLoadItemBlock();
            });
        }

		cartLoadItemBlock() {
			this.isUpdateInProgress = false;
			setTimeout(function () {
				$('.item-block').each(function () {
					var item = $(this);
					item.find('.col-thumb').height(item.find('.col-description').height());
					item.find('.col-thumb img').height(item.find('.col-thumb').height());
				});
			}, 250);
		}

        openWishListPopup(productId: string, qty: number) {
            this.productService.getProductData("", productId).then(result => {
                result.product.qtyOrdered = qty;
                this.popupWishList(result.product);
            });    
        }
   
        popupWishList(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        quantityKeyPress(keyEvent: KeyboardEvent, cartLine: CartLineModel) {
            if (keyEvent.which === 13) {
                this.updateQty(cartLine, true);
            }
        }

        updateQty(product, refresh) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$rootScope.$broadcast("ProductQtyChanged", product);
            }
            this.updateLine(product, refresh);
        }

        isInt(n) {
            return n % 1 === 0;
        }

        updateLine(cartLine: CartLineModel, refresh: boolean) {
            if (refresh) {
                this.isUpdateInProgress = true;
                cartLine.isQtyAdjusted = true;
            }
            if (parseFloat(cartLine.qtyOrdered.toString()) === 0) {
                this.cartService.removeLine(cartLine);
            } else {
                this.cartService.updateLine(cartLine, refresh);
            }
        }
    }

    angular
        .module("insite")
        .controller("CartLinesController", MorscoCartLinesController);
}
