module insite.catalog {
    "use strict";
    angular
        .module("insite")
        .directive("iscPagerCustomControls", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                scope: {
                    customContext: "=",
                    bottom: "="
                },
                templateUrl: coreService.getApiUri("/Directives/PagerCustomControls")
            };
        }]);

    /*
    * Product list child directive
    * this is used to watch the image loading for aligning the grid view.
    * it increments ProductListController.imagesLoaded counter after each image is loaded.
    */
    interface IProductListScope extends ng.IScope {
        vm: ProductListController;
    }

    angular
        .module("insite")
        .directive("productlistimageonload", () => {
            return {
                link: (scope: IProductListScope, element: ng.IAugmentedJQuery) => {
                    element.on("load error", () => {
                        scope.vm.imagesLoaded++;
                    });
                },
                restrict: "A"
            };
        });
}