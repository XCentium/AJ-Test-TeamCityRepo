module insite.catalog {
	
	angular.module("insite")
			.directive("iscCompareProductsCarousel", ["coreService", (coreService: core.ICoreService) => {
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
					productSettings: "="
				},
				templateUrl: coreService.getApiUri("/Directives/Catalog/CompareProductsCarousel"),
				bindToController: true
			}
			return directive;
		}]);

	/*
	* Cross Sell Carousel child directive
	*******************************
	*/

	export interface ICompareProductsCarouselScope extends ng.IScope {
		vm: CompareProductsCarouselController;
	}

	function comparecarouselimageonload() {
		var directive: ng.IDirective = {
			link: link,
			restrict: "A"
		}
		return directive;

		function link(scope: ICompareProductsCarouselScope, element: ng.IAugmentedJQuery) {
			element.on("load error", () => {
				scope.vm.imagesLoaded++;
			});
		}
	};

	angular.module("insite")
		.directive("comparecarouselimageonload", comparecarouselimageonload);	
}