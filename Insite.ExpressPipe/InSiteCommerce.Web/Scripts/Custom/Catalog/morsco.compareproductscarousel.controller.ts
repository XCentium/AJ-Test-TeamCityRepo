module insite.catalog {
    "use strict";

	export class MorscoCompareProductsCarouselController extends CompareProductsCarouselController {

		isAuthenticated: boolean;
        warehouses: any;

        public static $inject = ["$scope", "productService", "$timeout", "$window", "sessionService", "$rootScope"];

		constructor(protected $scope: ng.IScope,
			protected productService: IProductService,
			protected $timeout: ng.ITimeoutService,
			protected $window: ng.IWindowService,
            protected sessionService: insite.account.ISessionService,
            protected $rootScope: ng.IRootScopeService) {
			super($scope, productService, $timeout, $window);
			this.isAuthenticated = this.sessionService.isAuthenticated();
		}

		init() {
			this.imagesLoaded = 0;
            this.waitForDom(this.maxTries);
		}

        initializeCarousel() {
            this.productsToCompare.forEach((product) => {
                product.qtyOrdered = 1;
                if (product.properties['minimumSellQty']) {
                    product.qtyOrdered = parseInt(product.properties['minimumSellQty']);
                }
            });
            super.initializeCarousel();
        }

        updateQty(product, refresh) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$rootScope.$broadcast("ProductQtyChanged", product);
            }
        }

        isInt(n) {
            return n % 1 === 0;
        }

        equalizeCarouselDimensions() {
            $('div[role="compare-grid"] .item-thumb > a').equalHeights();
            $('div[role="compare-grid"] .item-brand').equalHeights();
            $('div[role="compare-grid"] .item-name').equalHeights();
            $('div[role="compare-grid"] .item-num').equalHeights();
            $('div[role="compare-grid"] .item-env-icons').equalHeights();
            $('div[role="compare-grid"] .item-name').dotdotdot({});

            $('.pc-carousel').css("opacity",1);
        }
	}

	angular.module("insite")
        .controller("CompareProductsCarouselController", MorscoCompareProductsCarouselController);
} 