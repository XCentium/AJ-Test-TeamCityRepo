module insite.catalog {
    "use strict";

    export class CompareProductsController {

        ready = false;
        productsToCompare:  ProductDto[]; // products being compared
        relevantAttributeTypes: AttributeTypeDto[]; // list of all attribute types belonging to the products
        productSettings: ProductSettingsModel;

        public static $inject = [
            "$scope",
            "$window",
            "cartService",
            "coreService",
            "productService",
            "compareProductsService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected productService: catalog.IProductService,
            protected compareProductsService: ICompareProductsService) {           

            this.init();
        }

        init() {
            this.productsToCompare = [];
            this.relevantAttributeTypes = [];
            var productsToCompare = this.compareProductsService.getProductIds();            
            var expandParameter = ["styledproducts", "attributes", "pricing"];

            var parameter: IProductCollectionParameters = { productIds: productsToCompare };
            this.productService.getProductCollectionData(parameter, expandParameter).then(
                result => {
                    this.productsToCompare = result.products;

                    if (this.productsToCompare.length > 0) {
                       
                        var allAttributeTypes =
                            lodash.chain(this.productsToCompare)
                                .pluck<AttributeTypeDto>("attributeTypes")
                                .flatten<AttributeTypeDto>(true)
                                .where<AttributeTypeDto, { "isComparable": boolean }>({ "isComparable": true })
                                .sortBy("label")
                                .value();

                        this.relevantAttributeTypes = [];
                        allAttributeTypes.forEach((attributeType) => {
                            if (!lodash.some(this.relevantAttributeTypes, relevantAttributeType =>
                                relevantAttributeType.id === attributeType.id
                            )) {
                                this.relevantAttributeTypes.push(attributeType);
                            }
                        });
                    }
                    this.ready = true;
                },
                error => {
                });

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.productSettings = data.productSettings;
            });
        }

        // gets all attribute value display strings available for a given attribute type
        getAttributeTypeValuesForAllProducts(attributeTypeId: string): string[] {
            if (!attributeTypeId) {
                return [];
            }

            return lodash.chain(this.productsToCompare)
                .pluck<AttributeTypeDto>("attributeTypes")
                .flatten(true)
                .where({ "id": attributeTypeId })
                .pluck<AttributeTypeDto>("attributeValues")
                .flatten(true)
                .pluck<string>("valueDisplay")
                .value();
        }

        // returns all attribute value display strings belonging to products for a given attribute type
        getUniqueAttributeTypeValuesForAllProducts(attributeTypeId: string): string[] {
            var attributeValues: string[] = [];
            this.productsToCompare.forEach((product) => {
                attributeValues = attributeValues.concat(this.getAttributeValuesForProduct(product, attributeTypeId));
            });
            return lodash.uniq(attributeValues);
        }

        // returns the attribute value display string for a given product and attribute type
        getAttributeValuesForProduct(product: ProductDto, attributeTypeId: string): string[] {
            if (!product || !attributeTypeId) {
                return [];
            }

            return lodash.chain(product.attributeTypes)
                .where({ "id": attributeTypeId })
                .pluck<AttributeTypeDto>("attributeValues")
                .flatten(true)
                .pluck<string>("valueDisplay")
                .value();
        }

        // returns a list of products with a given attribute value
        getProductsThatContainAttributeTypeIdAndAttributeValue(attributeTypeId: string, attributeValue: string): ProductDto[] {
            if (!attributeTypeId || !attributeValue) {
                return [];
            }

            var productsThatContainsAttributeTypeIdAndAttributeValue: ProductDto[] = [];

            this.productsToCompare.forEach(product => {
                var attributeValues = this.getAttributeValuesForProduct(product, attributeTypeId);
                var hasAttributeTypeIdAndAttributeValue = attributeValues.length > 0 && lodash.indexOf(attributeValues, attributeValue) > -1;
                hasAttributeTypeIdAndAttributeValue && productsThatContainsAttributeTypeIdAndAttributeValue.push(product);
            });

            return productsThatContainsAttributeTypeIdAndAttributeValue;
        }

        addToCart(product: ProductDto) {
            this.cartService.addLineFromProduct(product);
        }

        removeComparedProduct(productId: string) {
            this.compareProductsService.removeProduct(productId);
        }

        openWishListPopup(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        removeAllComparedProducts() {
            this.compareProductsService.removeAllProducts();
            this.productsToCompare = [];

            this.goBack();
        }

        goBack() {
            this.$window.location.replace(document.referrer);
        }
    }

    angular.module("insite")
            .controller("CompareProductsController", CompareProductsController);
}