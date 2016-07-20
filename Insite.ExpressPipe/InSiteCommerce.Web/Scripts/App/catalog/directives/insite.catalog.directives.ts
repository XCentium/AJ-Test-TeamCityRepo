///<reference path="../../../typings/angularjs/angular.d.ts"/>

module insite.catalog {
    "use strict";

    angular
        .module("insite")

        .directive("iscProductListView", ["coreService", (coreService: core.ICoreService) => {
            return {
                controller: "ProductListController",
                controllerAs: "vm",
                restrict: "E",
                replace: true,
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/ProductListView")
            };
        }])
        .directive("iscProductDetailView", ["coreService", (coreService: core.ICoreService) => {
            return {
                controller: "ProductDetailController",
                controllerAs: "vm",
                restrict: "E",
                replace: true,
                scope: {
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/ProductDetailView")
            };
        }])
        .directive("iscProductName", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    product: "=",
                    noLink: "@"
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/ProductName")
            };
        }])
        .directive("iscProductThumb", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    product: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/ProductThumb")
            };
        }])
        .directive("iscAvailabilityMessage", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    availability: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/AvailabilityMessage")
            };
        }])
        .directive("iscProductPrice", ["coreService", (coreService: core.ICoreService) => {
            return {
                controller: "ProductPriceController",
                controllerAs: "vm",
                restrict: "E",
                scope: {
                    product: "=",
                    idKey: "@"
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/ProductPrice")
            };
        }])
        .directive("iscQuantityBreakPricing", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    productId: "=",
                    breakPrices: "=",
                    block: "@"
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/QuantityBreakPricing")
            };
        }])
        .directive("iscSortedAttributeValueList", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    attributeTypes: "=",
                    maximumNumber: "@"
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/SortedAttributeValueList")
            };
        }])
        .directive("iscUnitOfMeasureSelectList", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/Catalog/UnitOfMeasureSelectList"),
                scope: {
                    product: "=",
                    alternateUnitsOfMeasure: "@",
                    displayPack: "@",
                    changeUnitOfMeasure: "&"
                }
            };
        }])
        .directive("iscUnitOfMeasureDisplay", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                templateUrl: coreService.getApiUri("/Directives/Catalog/UnitOfMeasureDisplay"),
                scope: {
                    product: "="
                }
            };
        }]);
}