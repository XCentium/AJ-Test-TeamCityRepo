module insite.catalog {
    "use strict";

    export class MorscoCompareProductsController extends CompareProductsController {
        warehouses: any = {};

	    init() {
            this.productsToCompare = [];
            this.relevantAttributeTypes = [];
            var productsToCompare = this.compareProductsService.getProductIds();            
            var expandParameter = ["styledproducts", "attributes", "pricing", "documents"];
            var self = this;
            var parameter: IProductCollectionParameters = { productIds: productsToCompare };
            
            this.productService.getProductCollectionData(parameter, expandParameter).then(
                result => {
                    this.productsToCompare = result.products;
                    if (result.properties['warehouses']) {
                        self.warehouses = JSON.parse(result.properties['warehouses']);
                    }
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

    }

    angular.module("insite")
            .controller("CompareProductsController", MorscoCompareProductsController);
}