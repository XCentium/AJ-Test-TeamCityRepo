module insite.catalog {
    "use strict";

    // service which manages storage of a list of product to compare
    export interface ICompareProductsService {
        getProductIds(): System.Guid[];
        addProduct(product: ProductDto): boolean;
        removeProduct(product: string): boolean;
        removeAllProducts(): void;
    }

    export class CompareProductsService implements ICompareProductsService {
        cacheKey = "compareProducts";
        localStorage: core.IWindowStorage;

        constructor($localStorage: core.IWindowStorage, protected $rootScope: ng.IRootScopeService) {
            this.localStorage = $localStorage;
        }

        getProductIds() {
            return this.localStorage.getObject(this.cacheKey, []);
        }

        addProduct(product: ProductDto) {
            var productIds = this.localStorage.getObject(this.cacheKey, []);                    
            if(!lodash.contains(productIds,product.id)) {
                productIds.push(product.id);
                this.localStorage.setObject(this.cacheKey, productIds);
                this.$rootScope.$broadcast("addProductToCompare", product);
                return true;
            }
            return false;
        }

        removeProduct(productId: string) {
            var productIds: System.Guid[] = this.localStorage.getObject(this.cacheKey, []);                
            if (lodash.contains(productIds, productId)) {
                lodash.pull(productIds,productId);
                this.localStorage.setObject(this.cacheKey, productIds);
                this.$rootScope.$broadcast("removeProductToCompare", productId);
                return true;
            }
            return false;
        }

        removeAllProducts() {
            this.localStorage.setObject("compareProducts", []);
        }
    }

    factory.$inject = ["$localStorage", "$rootScope"];
    function factory(
        $localStorage: core.IWindowStorage,
        $rootScope: ng.IRootScopeService): CompareProductsService {
        return new CompareProductsService($localStorage, $rootScope);
    }

    angular
        .module("insite")
        .factory("compareProductsService", factory);
}