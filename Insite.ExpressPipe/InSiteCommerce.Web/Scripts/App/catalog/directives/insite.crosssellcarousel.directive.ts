interface JQuery {
    jcarouselControl: (parm: any) => void;
    jcarousel: (parm1?: any, parm2?: any) => JQuery;
    touch: () => void;
}

module insite.catalog {

    "use strict";

    angular.module("insite")
        .directive("iscCrossSellCarousel", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    productCrossSell: "@",
                    product: "=",
                    maxTries: "@"
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/CrossSellCarousel"),
                controller: "CrossSellCarouselController",
                controllerAs: "vm",
                bindToController: true
            }
        }]);
    
    /*
    * Cross Sell Carousel child directive
    *******************************
    */
    
    export interface ICrossSellCarouselScope extends ng.IScope {
        vm: CrossSellCarouselController;
    }

    var carouselimageonload: ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            link: link,
            restrict: "A",
            require: "^iscCrossSellCarousel"
        }
        return directive;

        function link(scope: ICrossSellCarouselScope, element: ng.IAugmentedJQuery) {
            element.on("load error", () => {
                scope.vm.imagesLoaded++;
            });
        }
    }

    angular.module("insite")
        .directive("carouselimageonload", carouselimageonload);
}
