module insite.catalog {
    "use strict";

    export class ProductComparisonHopperController {

        productsToCompare: ProductDto[];

        public static $inject = [
            "$rootScope",
            "productService",
            "compareProductsService"
        ];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected productService: IProductService,
            protected compareProductsService: ICompareProductsService) {

            this.init();
        }

        init() {
            this.productsToCompare = []; // full product objects

            // add product from product list controller
            this.$rootScope.$on("addProductToCompare", (e: ng.IAngularEvent, product: ProductDto) => {
                this.addProductToCompare(product);
            });

            // remove product from product list controller
            this.$rootScope.$on("removeProductToCompare", (e: ng.IAngularEvent, productId: string) => {
                this.removeProductToCompare(productId);
            });

            this.setProductData();
        }

        canShowCompareHopper() {
            return this.productsToCompare.length > 0;
        }

        setProductData() {
            var productIdsToCompare = this.compareProductsService.getProductIds();
            if (productIdsToCompare && productIdsToCompare.length > 0) {
                var parameter: IProductCollectionParameters = { productIds: productIdsToCompare };
                this.productService.getProductCollectionData(parameter).then(
                (result: ProductCollectionModel) => {
                    this.productsToCompare = result.products;
                },
                (error) => {
                });
            }
        }

        addProductToCompare(product: ProductDto) {
            this.productsToCompare.push(product);
        }

        removeProductToCompare(productId: string) {
            lodash.remove(this.productsToCompare, p => (p.id === productId));
        }

        clickRemove(product: ProductDto) {
            this.removeProductToCompare(product.id.toString());
            if (this.compareProductsService.removeProduct(product.id.toString())) {
                this.updateProductList();
            }
        }

        removeAllProductsToCompare() {
            this.compareProductsService.removeAllProducts();
            this.productsToCompare = [];
            this.updateProductList();
        }

        // tell the product list page to clear compare check boxes
        updateProductList() {
            this.$rootScope.$broadcast("compareProductsUpdated");
        }
    }

    angular.module("insite")
        .controller("ProductComparisonHopperController", ProductComparisonHopperController);
} 