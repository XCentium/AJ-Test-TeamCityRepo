module insite.catalog {
    
    angular
        .module("insite")
        .directive("iscMorscoCategoryLeftNav", ["coreService", (coreService: core.ICoreService) => {
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
					updateProductDataArray: "&",
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