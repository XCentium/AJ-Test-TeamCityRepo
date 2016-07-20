// controller for the quickorder full page widget

module insite.quickorder {
    "use strict";

    export class MorscoQuickOrderPageController  extends QuickOrderPageController{

        addingToCart: boolean;
        warehouses: {};

        public static $inject = [
			"$scope",
            "$window",
            "cartService",
            "productService",
            "searchService",
			"websiteService",
            "spinnerService",
            "$rootScope"];

        constructor(
			protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected cartService: cart.ICartService,
            protected productService: catalog.IProductService,
            protected searchService: catalog.ISearchService,
			protected websiteService: websites.IWebsiteService,
            protected spinnerService: core.ISpinnerService,
            protected $rootScope: ng.IRootScopeService) {

            super($scope, $window, cartService, productService, searchService);

            this.initOnUnload();
        }

        initOnUnload() {
            this.addingToCart = false;

            var self = this;
            $(window).on('beforeunload', function () {
                if (self.products.length > 0 && !self.addingToCart) {
                    return "You haven't added the Quick Order items to your cart yet. Do you want to leave without finishing?";
                }
            });
        }

        addProduct(name: string) {
            this.spinnerService.show("mainLayout", false);
            if (!name || name.length == 0) {
                return;
            }
            var parameter: insite.catalog.IProductCollectionParameters = { extendedNames: [name] };
            var expandParameter = ["documents", "pricing", "attributes"];
            this.productService.getProductCollectionData(parameter, expandParameter).then(
                result => {
                    // TODO we may need to refresh the foundation tooltip, used to be insite.core.refreshFoundationUI
                    var product = result.products[0];
                    if (result.properties['warehouses']) {
                        this.warehouses = JSON.parse(result.properties['warehouses']);
                    }
                    if (this.validateProduct(product)) {
                        product.qtyOrdered = 1;
                        if (product.properties['minimumSellQty']) {
                            product.qtyOrdered = parseInt(product.properties['minimumSellQty']);
                        }
                        this.quantityInput(product);
                        (<any>product).uuid = this.getGuid(); // tack on a guid to use as an id for the quantity break pricing tooltip
                        this.products.push(product);
                        this.searchTerm = "";
                        this.errorMessage = "";
                    }
                    var availability = JSON.parse(product.properties["availability"]);
                    
                    if (availability.StockQty > 0) {
                        product.availability['messageType'] = 1;
                        product.availability['message'] = "In Stock";
                    }

					this.websiteService.getWebsite('current').success(function (website) {
						var productType = "noncatalog";

						if (product.properties['catalogWebSite']) {
							var websiteList = product.properties['catalogWebSite'].split(",");
							if (websiteList.indexOf(website.name) > -1) {
								productType = "catalog";
							}
						}

						if (productType == 'noncatalog') {
							if (product.properties['sopDescription']) {
								productType = "special order";
							}
						}

						product.properties['productType'] = productType;
					});

                    this.spinnerService.hide("mainLayout");

                    setTimeout(function () {
                        $(document).foundation('tooltip', 'reflow');
                    }, 500);
                },
                error => {
                    this.errorMessage = angular.element("#messageNotFound").val();
                    this.spinnerService.hide("mainLayout");
                });
        }

        // add all lines to cart and redirect to cart page
        addAllToCart(redirectUrl: string) {
            this.spinnerService.show("mainLayout", false);
            var self = this;
            this.cartService.addLineCollectionFromProducts(this.products).then(result => {
                self.addingToCart = true;
                this.$window.location.href = redirectUrl;
            });
        }

        updateQty(product) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$rootScope.$broadcast("ProductQtyChanged", product);
            }
            this.quantityInput(product);
        }

        isInt(n) {
            return n % 1 === 0;
        }
    }

    angular
        .module("insite")
        .controller("QuickOrderPageController", MorscoQuickOrderPageController);
}
