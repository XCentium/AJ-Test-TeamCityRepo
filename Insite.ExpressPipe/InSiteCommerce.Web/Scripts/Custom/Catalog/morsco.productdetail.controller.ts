module insite.catalog {
    "use strict";

    export class MorscoProductDetailController extends ProductDetailController {

        warehouses: {};
        availability: {};
        isAuthenticated: boolean = false;
          
        public static $inject = ["$scope", "$filter", "coreService", "cartService", "productService", "customProductService", "sessionService", "$rootScope"];

        constructor(
            protected $scope: ng.IScope,
            protected $filter: ng.IFilterService,
            protected coreService: core.ICoreService,
            protected cartService: cart.ICartService,
            protected productService: IProductService,
            protected customProductService: catalog.ICustomProductService,
            protected sessionService: ISessionService,
            protected $rootScope: ng.IRootScopeService) {
           
            super($scope, $filter, coreService, cartService, productService);

            this.sessionService.getIsAuthenticated().then(result => {
                this.isAuthenticated = result;
            });

        }

        init() {
            this.cartService.preventCartLoad = true;
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.productSettings;
            });
            
            this.resolvePage();
        }

		showProductAvailabilityPopup(product: ProductDto, warehouses: {}) {
            this.customProductService.setAvailability(warehouses, product.properties['availability'], product);
            this.coreService.displayModal("#popup-availability");
        }

        getProductData(productId: string) {
            var expandParameter = ["documents", "specifications", "styledproducts", "htmlcontent", "attributes", "crosssells", "pricing"];
            var self = this;
            this.productService.getProductData(this.category != null ? this.category.id.toString() : null, productId, expandParameter).then(
                (result: ProductModel) => {
                    this.product = result.product;
                    this.product.qtyOrdered = (this.product.properties["minimumSellQty"]) ? parseInt(this.product.properties["minimumSellQty"]) : 1;
                    
                    if (this.product.isConfigured && this.product.configurationDto && this.product.configurationDto.sections)
                        this.initConfigurationSelection(this.product.configurationDto.sections);

                    if (this.product.styleTraits.length > 0) {
                        this.initialStyledProducts = this.product.styledProducts.slice();
                        this.styleTraitFiltered = this.product.styleTraits.slice();
                        this.initialStyleTraits = this.product.styleTraits.slice();
                        if (this.product.isStyleProductParent) {
                            this.parentProduct = angular.copy(this.product);
                        }
                        this.initStyleSelection(this.product.styleTraits);
                    };

                    setTimeout(() => {
                        (<any>$(".easy-resp-tabs")).easyResponsiveTabs();
                    }, 10);

                    self.cartService.preventCartLoad = false;
                    if (result.properties['warehouses']) {
                        self.warehouses = JSON.parse(result.properties['warehouses']);
                    }
                    if (result.product.properties['availability']) {
                        self.availability = JSON.parse(result.product.properties['availability']);
                        var stockList = self.availability['StockList'];
                        self.availability['StockList'] = self.toObject(stockList);
                    }
                    
                    this.cartService.preventCartLoad = false;
                    this.cartService.getCart();

                },
                (error) => {
                });
        }

        toObject(arr) {
            // Convert the ponderosa branch 'qty in stock' array to an object
            var rv = {};
            for (var i = 0; i < arr.length; ++i) {
                if (arr[i] !== undefined) {
                    rv[arr[i].Branch] = arr[i].Stock_Qty;
                }
            }
            return rv;
        }

        updateQty(product)
        {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$rootScope.$broadcast("ProductQtyChanged", product);
            }
        }
        
        isInt(n) {
            return n % 1 === 0;
        }

        openAvailabilityPopup() {
            this.coreService.displayModal("#popup-availability-shipping-tax");
        }
    }

    angular
        .module("insite")
        .controller("ProductDetailController", MorscoProductDetailController);
}