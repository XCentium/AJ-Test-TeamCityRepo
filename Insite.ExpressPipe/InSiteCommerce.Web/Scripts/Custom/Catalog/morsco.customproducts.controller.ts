module insite.catalog {
    "use strict";

    export class MorscoCustomProductsController {

        recommendationType: string;
        shipTo: ShipToModel;
        productList: ProductCollectionModel = <any>{};
        topProductsList: ProductCollectionModel = <any>{};
		isAuthenticated: boolean;

        static $inject = [
            "$scope", 
            "$rootScope",
            "customerService",
            "sessionService",
            "customProductService",
            "coreService",
            "cartService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected $rootScope: ng.IRootScopeService,
            protected customerService: customers.ICustomerService,
            protected sessionService: ISessionService,
            protected customProductService: catalog.ICustomProductService,
            protected coreService: core.ICoreService,
            protected cartService: cart.ICartService) {

            var self = this;
			this.isAuthenticated = this.sessionService.isAuthenticated();
            // Disabled for now. Can't use on other pages if waiting for broadcast 
            this.$rootScope.$on("getProductListComplete", (event, products) => {
                self.init();
            });
            if ($('.product-list').length === 0) {
                self.init();
            }
        }

        addToCart(product: ProductDto) {
            this.cartService.addLineFromProduct(product);
        }

        openWishListPopup(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        init() {
            var self = this;

            //TODO - iscMorscoProductGrid is calling this multiple times.  it needs to have its own controller
            var recommendationType = this.$scope['recommendationType'];
			//window.console.log('Auth = ' + this.isAuthenticated);
            if (recommendationType) {
                if (this.sessionService.isAuthenticated()) {
	                this.customerService.getShipTo("").success((result) => {
		                self.shipTo = result;
						self.getRecommendedProductData(recommendationType, self.shipTo.customerNumber, self.shipTo.customerSequence);
	                });
                } else {
					self.getRecommendedProductData(recommendationType, "", "");
                }
            }
        }

		getRecommendedProductData(recommendationType: string, customerNumber: string, customerSequence: string) {
			if (recommendationType == "topProducts" || customerNumber != "") {
				this.customProductService.getRecommendedProductZone(recommendationType, customerNumber, customerSequence).success(data => {

					if (recommendationType == "recommended") {
						this.productList = data['productDtos'];
					} else {
						this.topProductsList = data['productDtos'];
					}
                    
                    angular.forEach(this.productList, product => {
                        product.qtyOrdered = 1;
                        if (product.properties['minimumSellQty']) {
                            product.qtyOrdered = parseInt(product.properties['minimumSellQty']);
                        }
                    });
                    angular.forEach(this.topProductsList, product => {
                        product.qtyOrdered = 1;
                        if (product.properties['minimumSellQty']) {
                            product.qtyOrdered = parseInt(product.properties['minimumSellQty']);
                        }
                    });
				});
			}
		}

        initSlick(recos) {
            var self = this;
            
            recos.find('.slick-it').on('init', initCEqualize => {
                // need to wait for images to load
                setTimeout(function () {
                    recos.find('.item-block .item-name > a').dotdotdot({});
                }, 250);

                setTimeout(function () {
                    self.cEqualize(recos);
                }, 500);

                var resizeId;
                $(window).on('resize', function () {
                    self.killHeights();
                    clearTimeout(resizeId);
                    resizeId = setTimeout(function () {
                                self.cEqualize(recos);
                            }, 500);
                });
            });

            try {
                recos.find('.slick-it').slick('unslick');
            } catch (ex) {
                //window.console.log(ex);
            }

            recos.find('.slick-it').slick({
                infinit: true,
                slidesToShow: 4,
                slidesToScroll: 4,
                prevArrow: '<i class="fa fa-lg fa-angle-left"></i>',
                nextArrow: '<i class="fa fa-lg fa-angle-right"></i>',
                accessibility: false,
                responsive: [
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 560,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 4
                        }
                    }
                ]
            });

            recos.css('opacity', 1);
            
        }

        openAvailabilityPopup() {
            var test = this.customProductService.getAvailability()
            this.coreService.displayModal("#popup-availability");
        }

        // in grid view, make all the boxes as big as the biggest one
        cEqualize(recos) {
            var self = this;
            var $itemBlocks = recos.find(".item-block");
            if ($itemBlocks.length > 0) {
                var maxHeight = -1;
                var priceHeight = -1;
                var thumbHeight = -1;
                var thumbWidth = -1;
                var envIconsHeight = -1;
                var availHeight = -1;
                var brandNameHeight = -1;

                $itemBlocks.each(function () {
                    maxHeight = maxHeight > $(this).find(".item-inf-wrapper").height() ? maxHeight : $(this).find(".item-inf-wrapper").height();
                    priceHeight = priceHeight > $(this).find(".item-price").height() ? priceHeight : $(this).find(".item-price").height();
                    thumbWidth = thumbWidth > $(this).find(".item-thumb").width() ? thumbWidth : $(this).find(".item-thumb").width();
                    // Height just needs to match width for square
                    thumbHeight = thumbWidth;
                    envIconsHeight = envIconsHeight > $(this).find(".item-env-icons").height() ? envIconsHeight : $(this).find(".item-env-icons").height();
                    availHeight = availHeight > $(this).find(".item-availability").height() ? envIconsHeight : $(this).find(".item-availability").height();
                    brandNameHeight = brandNameHeight > $(this).find(".item-brand").height() ? brandNameHeight : $(this).find(".item-brand").height();
                });

                if (maxHeight > 0) {
                    $itemBlocks.each(function () {
                        $(this).find(".item-inf-wrapper").height(maxHeight + 10);
                        $(this).find(".item-price").height(priceHeight);
                        $(this).find(".item-thumb > a").height(thumbHeight);
                        $(this).find(".item-thumb > a").width(thumbWidth);
                        $(this).find(".item-env-icons").height(envIconsHeight);
                        $(this).find(".item-availability").height(availHeight);
                        $(this).find(".item-brand").height(brandNameHeight);
                        $(this).addClass("eq");
                    });
                }
            }
        }
        
        killHeights() {
            $(".product-list .item-inf-wrapper").removeAttr("style");
            $(".product-list .item-price").removeAttr("style");
            $(".product-list .item-thumb > a").removeAttr("style");
            $(".product-list .item-env-icons").removeAttr("style");
            $(".product-list .item-availability").removeAttr("style");
            $(".product-list .item-brand").removeAttr("style");
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

    };

    angular
        .module("insite")
        .controller("MorscoCustomProductsController", MorscoCustomProductsController);
}