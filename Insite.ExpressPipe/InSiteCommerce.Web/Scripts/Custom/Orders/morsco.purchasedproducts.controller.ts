module insite.order {
    "use strict";

    export class PurchasedProductsController {

        paramList: string[] = [];
        allowCancellationRequest = false;
        pagination: PaginationModel;
        paginationStorageKey = "DefaultPagination-OrderList";
        validationMessage: string;
        shipTo: ShipToModel;
        products: any = <any>{};
        myproducts: ProductDto[];
        page: number;
        perPage: number;
        searchTerm: string;
        totalPages: number;
        totalRecords: number;
        productsLoaded: boolean;
		warehouses: {};
        
        static $inject = [
            "purchasedProductsService",
            "$scope",
            "orderService",
            "cartService",
            "customerService",
            "coreService",
            "paginationService",
            "productService",
			"customProductService",
            "spinnerService",
            "$rootScope"
        ];

        constructor(
            protected purchasedProductsService: IPurchasedProductsService,
            protected $scope: ng.IScope,
            protected orderService: order.IOrderService,
            protected cartService: cart.ICartService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService,
            protected productService: IProductService,
			protected customProductService: catalog.ICustomProductService,
            protected spinnerService: core.ISpinnerService,
            protected $rootScope: ng.IRootScopeService) {
            
            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.allowCancellationRequest = data.orderSettings.allowCancellationRequest;
            });

            this.productsLoaded = false;
            this.page = 1;
            this.perPage = 32;
            this.searchTerm = '';
            var queryStringHash = this.getUrlVars();
            if (!this.pagination) {
                this.pagination = {
                    currentPage: 1, pageSize: 32, defaultPageSize: 32, nextPageUri: '/', numberOfPages: 0, totalItemCount: 1,
                    prevPageUri: '', pageSizeOptions: [0],
                    sortOptions: [],
                    sortType: ''
                };
            }
            if (queryStringHash['page']) {
                this.page = +queryStringHash['page'];
            }
            if (queryStringHash['perPage']) {
                this.perPage = +queryStringHash['perPage'];
            }

            if (queryStringHash['searchTerm']) {
                this.searchTerm = queryStringHash['searchTerm'];
            }
            this.customerService.getShipTo("").success((result) => {
                this.shipTo = result;
                this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);
                this.getPurchasedProducts();
            });
        }
        
        ppSearch() {
            this.page = 1;
			this.spinnerService.show("mainLayout", true);
            this.getPurchasedProducts();
        }

        ppMovePrevious() {
			this.spinnerService.show("mainLayout", true);
			this.page--;
            this.getPurchasedProducts();
        }

        ppMoveNext() {
			this.spinnerService.show("mainLayout", true);
            this.page++;
            this.getPurchasedProducts();
        }

		ppKeyPressChangePage(keyEvent: KeyboardEvent) {
			if (keyEvent.which === 13) {
				this.spinnerService.show("mainLayout", true);
				this.getPurchasedProducts();
			}
		}

		ppBlurChangePage() {
			this.spinnerService.show("mainLayout", true);
			this.getPurchasedProducts();
		}

        triggerGetPurchasedProducts(element) {
            this.getPurchasedProducts();
        }

        getPurchasedProducts() {
            var self = this;
            var baseUrl = window.location.href.split('#')[0];
            var hash = '';
            if (self.page) {
                hash += '&page=' + self.page;
            }
            if (self.perPage) {
                hash += '&perPage=' + self.perPage;
            }
            if (self.searchTerm) {
                hash += '&searchTerm=' + self.searchTerm;
            }
            if (hash.length > 0) {
                var url = baseUrl + '#' + hash;
                if (typeof (window.history.replaceState) != "undefined") {
                    window.history.replaceState(null, null, url);
                } else {
                    window.location.replace(url);
                }
            }

            this.purchasedProductsService.getPurchasedProducts(this.page, this.perPage, this.searchTerm).then(function (result) {
                self.products = result.products;
                self.totalPages = parseInt(result.properties['totalPages']);
                self.totalRecords = parseInt(result.properties['totalRecords']);
                self.productsLoaded = true;
				self.spinnerService.hide();

                if (result.properties['warehouses']) {
                    self.warehouses = JSON.parse(result.properties['warehouses']);
                }

                self.products.forEach((product: ProductDto) => {
                    product.qtyOrdered = 1;
                    if (product.properties['minimumSellQty']) {
                        product.qtyOrdered = parseInt(product.properties['minimumSellQty']);
                    }
					if (product.properties['availability']) {
						var availability = JSON.parse(product.properties['availability']);
						if (availability.StockQty > 0) {
							product.availability['messageType'] = 1;
							product.availability['message'] = "In Stock";
						}
					}
				});


            });
        }

        addToCart(productId: string) {
            this.productService.getProductData("", productId).then(result => {
                var btnId = '#inputQty' + productId;
                var qty = angular.element(document.querySelector(btnId)).val();
                result.product.qtyOrdered = qty;
                this.addToCartEx(result.product);
            });
        }

        addToCartEx(product: ProductDto) {
            this.cartService.addLineFromProduct(product);
        }


        openWishListPopup(productId: string) {
            this.productService.getProductData("", productId).then(result => {
                var btnId = '#inputQty' + productId;
                var qty = angular.element(document.querySelector(btnId)).val();
                result.product.qtyOrdered = qty;
                this.popupWishList(result.product);
            });
        }

        popupWishList(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        openAvailabilityPopup() {
            this.coreService.displayModal("#popup-availability-shipping-tax");
        }

        showProductAvailabilityPopup(product: ProductDto, warehouses: {}) {
            this.customProductService.setAvailability(warehouses, product.properties['availability'], product);
            this.coreService.displayModal("#popup-availability");
        }

        getUrlVars() {

            var parms = {};
            var temp;
            var querystring = window.location.hash.slice(1);
            var items = querystring.slice(1).split("&");   // remove leading ? and split
            for (var i = 0; i < items.length; i++) {
                temp = items[i].split("=");
                if (temp[0]) {
                    if (temp.length < 2) {
                        temp.push("");
                    }
                    parms[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
                }
            }
            return (parms);
        }

        updateQty(product, refresh) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$rootScope.$broadcast("ProductQtyChanged", product);
            }
        }

        isInt(n) {
            return n % 1 === 0;
        }
    }

    angular
        .module("insite")
        .controller("PurchasedProductsController", PurchasedProductsController);
}