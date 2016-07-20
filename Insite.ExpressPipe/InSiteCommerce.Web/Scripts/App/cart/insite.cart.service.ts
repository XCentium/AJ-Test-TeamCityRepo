import CartCollectionModel = Insite.Cart.WebApi.V1.ApiModels.CartCollectionModel;
import CartLineCollectionModel = Insite.Cart.WebApi.V1.ApiModels.CartLineCollectionModel;
import CartLineModel = Insite.Cart.WebApi.V1.ApiModels.CartLineModel;
import PaginationModel = Insite.Core.WebApi.PaginationModel;
import CartSettingsModel = Insite.Cart.WebApi.V1.ApiModels.CartSettingsModel;

module insite.cart {

    "use strict";

    export interface ICartService {
        cartLoadCalled: boolean;
        preventCartLoad: boolean;
        expand: string;
        cartPopupTimeout: number;

        getCarts(filter?: IQueryStringFilter, pagination?: PaginationModel): ng.IHttpPromise<CartCollectionModel>;
        getCart(cartId?: string): ng.IPromise<CartModel>;
        updateCart(cart: CartModel, suppressApiErrors?: boolean): ng.IHttpPromise<CartModel>;
        removeCart(cart: CartModel): ng.IHttpPromise<string>;
        addLine(cartLine: CartLineModel): ng.IPromise<CartLineModel>;
        addLineFromProduct(product: ProductDto, configuration?: ConfigSectionOptionDto[]): ng.IPromise<CartLineModel>;
        addLineCollection(cartLines: any, toCurrentCart?: boolean): ng.IPromise<any>;
        addLineCollectionFromProducts(products: ProductDto[]): ng.IPromise<any>;
        updateLine(cartLine: CartLineModel, refresh: boolean): ng.IPromise<number>;
        removeLine(cartLine: CartLineModel): ng.IPromise<CartModel>;
        getCartSettings(): ng.IPromise<CartSettingsModel>;
    }

    export class CartService implements ICartService {
        serviceUri = this.coreService.getApiUri("/api/v1/carts");
        cartSettingsUri = this.coreService.getApiUri("/api/v1/settings/cart");
        cartLinesUri = "";
        currentCartLinesUri ="";

        cartPopupTimeout = 3000;
        cartLoadCalled = false;
        preventCartLoad = false;
        expand = "";

        private invalidAddressException = "Insite.Core.Exceptions.InvalidAddressException";

        static $inject = ["$http", "$rootScope", "$q", "coreService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $rootScope: ng.IRootScopeService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getCarts(filter?: IQueryStringFilter, pagination?: PaginationModel): ng.IHttpPromise<CartCollectionModel> {
            var uri = this.serviceUri;
            if (filter) {
                uri += "?";
                for (var property in filter) {
                    if (filter[property]) {
                        uri += property + "=" + filter[property] + "&";
                    }
                }
            }
            if (pagination) {
                uri += "page=" + pagination.currentPage + "&pageSize=" + pagination.pageSize;
            }
            uri = uri.replace(/&$/, "");
            return this.$http.get(uri);
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
                    }
                    deferred.resolve(cart);
                })
                .error(error => {
                    if (error.exceptionType === this.invalidAddressException) {
                        this.$rootScope.$broadcast("showAddressErrorPopup");
                    } else {
                        this.$rootScope.$broadcast("showApiErrorPopup", error);
                    }

                    return this.$q.reject(error);
                });
            return deferred.promise;
        }

        updateCart(cart: CartModel, suppressApiErrors = false): ng.IHttpPromise<CartModel> {
            var deferred = this.$q.defer();
            return this.$http({ method: "PATCH", url: cart.uri, data: cart, bypassErrorInterceptor: true })
                .success((result: CartModel) => {
                    deferred.resolve(result);
                })
                .error(error => {
                    if (error.exceptionType === this.invalidAddressException) {
                        this.$rootScope.$broadcast("showAddressErrorPopup");
                    } else if (!suppressApiErrors) {
                        this.$rootScope.$broadcast("showApiErrorPopup", error);
                    }

                    return this.$q.reject(error);
                });
        }

        removeCart(cart: CartModel): ng.IHttpPromise<string> {
            return this.$http.delete(cart.uri);
        }

        addLine(cartLine: CartLineModel): ng.IPromise<CartLineModel> {
            var parsedQty = parseFloat(cartLine.qtyOrdered.toString());
            cartLine.qtyOrdered = parsedQty > 0 ? parsedQty : 1;

            var deferred = this.$q.defer();
            this.$http({ method: "POST", url: this.cartLinesUri, data: cartLine, bypassErrorInterceptor: true })
                .success((result: CartLineModel) => {
                    this.$rootScope.$broadcast("showAddToCartPopup", { isQtyAdjusted: result.isQtyAdjusted });
                    cartLine.availability = result.availability;
                    this.getCart();
                    deferred.resolve(result);
                }).error(error => {
                    this.getCart();

                    if (error.exceptionType === this.invalidAddressException) {
                        this.$rootScope.$broadcast("showAddressErrorPopup");
                    } else {
                        this.$rootScope.$broadcast("showApiErrorPopup", error);
                    }

                    return this.$q.reject(error);
                });
            return deferred.promise;
        }

        addLineFromProduct(product: ProductDto, configuration?: ConfigSectionOptionDto[]): ng.IPromise<CartLineModel> {
            var cartLine = <CartLineModel>{};
            cartLine.productId = product.id;
            cartLine.qtyOrdered = product.qtyOrdered;
            cartLine.unitOfMeasure = product.unitOfMeasure;

            if (configuration) {
                cartLine.sectionOptions = <any>configuration; // both contain sectionOptionId
            }
            return this.addLine(cartLine);
        }

        addLineCollection(cartLines: any, toCurrentCart = false): ng.IPromise<any> {
            var cartLineCollection = { cartLines: cartLines };
            cartLineCollection.cartLines.forEach((line) => {
                var parsedQty = parseFloat(line.qtyOrdered.toString());
                line.qtyOrdered = parsedQty > 0 ? parsedQty : 1;;
            });

            var deferred = this.$q.defer();
            var postUrl = toCurrentCart ? this.currentCartLinesUri : this.cartLinesUri;
            this.$http({ method: "POST", url: postUrl + "/batch", data: cartLineCollection, bypassErrorInterceptor: true })
                .success((result: CartLineCollectionModel) => {
                    var isQtyAdjusted = result.cartLines.some((line) => {
                        return line.isQtyAdjusted;
                    });
                    this.$rootScope.$broadcast("showAddToCartPopup", { isAddAll: true, isQtyAdjusted: isQtyAdjusted });
                    this.getCart();
                    deferred.resolve(result);
                }).error(error => {
                    if (error.exceptionType === this.invalidAddressException) {
                        // workaround for Avalara exception
                        this.$rootScope.$broadcast("showAddressErrorPopup");

                        return this.$q.reject(error);
                    }
                    deferred.resolve(error);
                });
            return deferred.promise;
        }

        addLineCollectionFromProducts(products: ProductDto[]): ng.IPromise<any> {
            var cartLineCollection: CartLineModel[] = [];
            angular.forEach(products, product => {
                cartLineCollection.push(<CartLineModel>{
                    productId: product.id,
                    qtyOrdered: product.qtyOrdered,
                    unitOfMeasure: product.selectedUnitOfMeasure,
                });
            });
            return this.addLineCollection(cartLineCollection);
        }

        updateLine(cartLine: CartLineModel, refresh: boolean): ng.IPromise<number> {
            var deferred = this.$q.defer();
            this.$http({ method: "PATCH", url: cartLine.uri, data: cartLine })
                .success((result: number) => {
                    if (refresh) {
                        this.getCart();
                    }
                    deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        removeLine(cartLine: CartLineModel): ng.IPromise<CartModel> {
            var deferred = this.$q.defer();
            this.$http.delete(cartLine.uri)
                .success((result) => {
                    this.getCart();
                    deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getCartSettings(): ng.IPromise<CartSettingsModel> {
            var deferred = this.$q.defer();
            this.$http.get(this.cartSettingsUri)
                .success((result: CartSettingsModel) => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("cartService", CartService);

}