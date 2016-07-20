module insite.cart {

    "use strict";

    export class MorscoCartService extends CartService {
		private invalidAddressExceptionOverloaded = "Insite.Core.Exceptions.InvalidAddressException";

        static $inject = ["$http", "$rootScope", "$q", "coreService", "spinnerService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $rootScope: ng.IRootScopeService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService) {

            super($http, $rootScope, $q, coreService);
        }

        addLine(cartLine: CartLineModel): ng.IPromise<CartLineModel> {
            this.spinnerService.show("mainLayout");
            this.$rootScope.$on("showAddToCartPopup", () => {
                this.spinnerService.hide("mainLayout");
            });
			if (cartLine.qtyOrdered > 0) {
				return super.addLine(cartLine);
			}

            return this.$q.reject("Invalid Quantity");
        }

		addLineFromProduct(product: ProductDto, configuration?: ConfigSectionOptionDto[]): ng.IPromise<CartLineModel> {
            var cartLine = <CartLineModel>{};
            cartLine.productId = product.id;
            cartLine.qtyOrdered = product.qtyOrdered;
            cartLine.unitOfMeasure = product.unitOfMeasure;

            if (configuration) {
                cartLine.sectionOptions = <any>configuration; // both contain sectionOptionId
            }
			if (cartLine.qtyOrdered > 0) {
				return this.addLine(cartLine);
			} else {
				this.$rootScope.$broadcast("showApiErrorPopup", { message: "Quantity needs to be greater than 0." });
			}
        }

        addLineCollection(cartLines: any, toCurrentCart = false): ng.IPromise<any> {
            this.spinnerService.show("mainLayout");
            return super.addLineCollection(cartLines, toCurrentCart);
        }

        updateLine(cartLine: CartLineModel, refresh: boolean): ng.IPromise<number> {
            var deferred = this.$q.defer();
            this.$http({ method: "PATCH", url: cartLine.uri, data: cartLine })
                .success((result: number) => {
                    if (refresh) {
						var cartId = window.location.search.replace(/^.*?\=/, '');
						if (cartId != '') {
							this.getCart(cartId);
						} else {
							this.getCart();
						}
                    }
                    deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        removeLine(cartLine: CartLineModel): ng.IPromise<CartModel> {
            this.spinnerService.show("mainLayout");
            var deferred = this.$q.defer();
            this.$http.delete(cartLine.uri)
                .success((result) => {
					var cartId = window.location.search.replace(/^.*?\=/, '');
					if (cartId != '') {
						this.getCart(cartId);
					} else {
						this.getCart();
					}
					
                    deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getCart(cartId?: string): ng.IPromise<CartModel> {
            if (this.preventCartLoad)
                return null;
            if (!cartId) {
                cartId = "current";
            }

            if (cartId === "current") {
                this.cartLoadCalled = true;
            }
            var uri = this.serviceUri + "/" + cartId;
            if (this.expand) {
                uri += "?expand=" + this.expand;
            }

            var deferred = this.$q.defer();

            this.$http({ method: "GET", url: uri, bypassErrorInterceptor: true })
                .success((cart: CartModel) => {
                    this.cartLinesUri = cart.cartLinesUri;
                    if (cartId === "current") {
                        this.$rootScope.$broadcast("cartLoaded", cart);
                        this.currentCartLinesUri = cart.cartLinesUri;
                    } else {
                        this.$rootScope.$broadcast("cartIdLoaded", cart);
                    }
                    deferred.resolve(cart);
                })
                .error(error => {
                    if (error.exceptionType === this.invalidAddressExceptionOverloaded) {
                        this.$rootScope.$broadcast("showAddressErrorPopup");
                    } else {
                        this.$rootScope.$broadcast("showApiErrorPopup", error);
                    }

                    return this.$q.reject(error);
                });
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("cartService", MorscoCartService);

}