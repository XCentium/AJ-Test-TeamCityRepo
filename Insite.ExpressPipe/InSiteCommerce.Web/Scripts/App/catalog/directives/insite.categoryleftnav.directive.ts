module insite.catalog {
    angular
        .module("insite")
        .directive("iscCategoryLeftNav", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    products: "=",
                    breadCrumbs: "=",
                    attributeValueIds: "=",
                    filterCategory: "=",
                    priceFilterMinimums: "=",
                    updateProductData: "&",
                    searchWithinTerms: "=",
                    category: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/CategoryLeftNav"),
                controller: "CategoryLeftNavController",
                controllerAs: "vm",
                bindToController: true
            }
        }]);
}