///<reference path="../../../typings/angularjs/angular.d.ts"/>

module insite.catalog {
    "use strict";

    angular
        .module("insite")
        .directive("iscMorscoAvailabilityPopup", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    product: "=product",
                    warehouses: "=warehouses",
                    availability: "=availability",
                },
                controller: "MorscoAvailabilityPopupController",
                controllerAs: "vm",
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoAvailabilityPopup")
            };
        }])
        .directive("morscoMinimumQtyMessage", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    product: "=product"
                },
                controller: "MorscoMinimumQtyController",
                controllerAs: "vm",
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoMinimumQtyMessage")
            };
        }])
        .directive("iscMorscoRecommendedProducts", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    product: "=",
                    recommendationType: "@"
                },
                controller: "MorscoCustomProductsController",
                controllerAs: "vm",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoRecommendedProducts")
            };
        }])


        .directive("morscoCompareProductsCarousel", ["coreService", (coreService: core.ICoreService) => {
            var directive: ng.IDirective = {
                controller: "CompareProductsCarouselController",
                controllerAs: "vm",
                replace: true,
                restrict: "E",
                scope: {
                    addToCart: "&",
                    removeComparedProduct: "&",
                    productsToCompare: "=",
                    openWishListPopup: "&",
                    productSettings: "=",
                    warehouses: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/CompareProductsCarousel"),
                bindToController: true
            }
            return directive;
        }])

        .directive("iscMorscoTopSellingProducts", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    product: "=",
                    recommendationType: "@recommendationType"
                },
                controller: "MorscoCustomProductsController",
                controllerAs: "vm",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoTopSellingProducts")
            };
        }])
        .directive("iscMorscoProductGrid", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    product: "="
                },
                controller: "MorscoCustomProductsController",
                controllerAs: "vm",
                replace: true,
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoProductGrid"),
                link: function (scope, element, attrs) {
                    if (scope.$parent.$last) {
                        setTimeout(function () {
                            scope.vm.initSlick(element.parents('.recos'));
                        }, 500);
                    }
                }
            };
        }])
        .directive("iscMorscoAvailabilityMessage", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    availability: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoAvailabilityMessage"),
                controller: "MorscoAvailabilityPopupController",
                controllerAs: "vm"
            };
        }])
        .directive("morscoCartAvailabilityMessage", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    availability: "=",
                    warehouses: "=",
                    itemline: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/MorscoCartAvailabilityMessage"),
                controller: "MorscoAvailabilityPopupController",
                controllerAs: "vm"
            };
        }])
        .directive("iscMorscoAvailabilityShippingTaxContent", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    availability: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Cart/MorscoAvailabilityShippingTaxContent")
            };
        }]);


    angular.module("insite")
        .directive("catimgloaded", ['$timeout', function ($timeout) {
            return {
                restrict: "A",
                scope: {
                    catimgheight: "="
                },
                link: function (scope, element) {
                    if (scope.$parent.$last) {
                        $('.cat-list-image').imagesLoaded().progress(function (instance, image) {
                            //var result = image.isLoaded ? 'loaded' : 'broken';
                            //$('.cat-list-images .cat-list-image').equalHeights();
                        });
                    }

                    element.bind('load error', function () {
                        $timeout(function () {
                        }, 0);
                    });
                }
            }
        }]);
}