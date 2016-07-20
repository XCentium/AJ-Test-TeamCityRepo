module insite.catalog {

    "use strict";

    export class CrossSellCarouselController {

        product: ProductDto;
        productCrossSell: boolean;
        maxTries: number;
        crossSellProducts: ProductDto[];
        imagesLoaded: number;
        carousel: JQuery;
        productSettings: ProductSettingsModel;

        public static $inject = ["$scope", "cartService", "coreService", "productService", "$timeout"];

        constructor(
            protected $scope: ng.IScope,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected productService: IProductService,
            protected $timeout: ng.ITimeoutService) {

            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.productSettings = data.productSettings;
            });

            this.crossSellProducts = [];
            this.imagesLoaded = 0;
            
            if (!this.productCrossSell) {
                this.productService.getCrossSells(null).then((result: CrossSellCollectionModel) => {
                    this.crossSellProducts = result.products;
                    this.imagesLoaded = 0;
                    this.waitForDom(this.maxTries);
                }, (error) => {
                });
            } else {
                
                this.waitForProduct(this.maxTries);
            }
        }

        addToCart(product: ProductDto) {
            this.cartService.addLineFromProduct(product);
        }

        changeUnitOfMeasure(product: ProductDto) {
            this.productService.changeUnitOfMeasure(product);
        }

        openWishListPopup(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        showCrossSellCarousel() {
            
            return !!this.crossSellProducts
                && this.crossSellProducts.length > 0
                && this.productSettings;
        }

        showQuantityBreakPricing(product: ProductDto) {
            return product.canShowPrice
                && product.pricing
                && !!product.pricing.actualBreakPrices
                && product.pricing.actualBreakPrices.length > 1
                && !product.quoteRequired;
        }

        showUnitOfMeasure(product: ProductDto) {
            return product.canShowUnitOfMeasure
                && !!product.unitOfMeasureDisplay
                && !!product.productUnitOfMeasures
                && product.productUnitOfMeasures.length > 1
                && this.productSettings.alternateUnitsOfMeasure;
        }


        waitForProduct(tries: number) {
            if (isNaN(+tries)) {
                tries = this.maxTries || 1000; //Max 20000ms
            }

            if (tries > 0) {
                this.$timeout(() => {
                    if (this.isProductLoaded()) {
                        this.crossSellProducts = this.product.crossSells;
                        this.imagesLoaded = 0;
                        this.waitForDom(this.maxTries);
                    } else { 
                        this.waitForProduct(tries - 1);
                    }
                }, 20);
            }
        }

        //If jcarousel is initalized before the DOM is ready and images loaded
        //it will break...
        waitForDom(tries: number) {

            if (isNaN(+tries)) {
                tries = this.maxTries || 1000; //Max 20000ms
            }

            //If DOM isn't ready after max number of tries then stop
            if (tries > 0) {
                this.$timeout(() => {
                    if (this.isCarouselDomReadyAndImagesLoaded()) {
                        this.initializeCarousel();
                    } else {
                        this.waitForDom(tries - 1);
                    }
                }, 20);
            }
        }

        isCarouselDomReadyAndImagesLoaded() {
            return $(".cs-carousel").length > 0
                && this.imagesLoaded >= this.crossSellProducts.length;
        }

        isProductLoaded() {
            return this.product
                && typeof this.product === "object";
        }

        initializeCarousel() {
            this.carousel = $(".cs-carousel").jcarousel();
            this.carousel.on("jcarousel:reload", () => this.reloadCarousel()).jcarousel({
                wrap: "circular"
            });

            this.setCarouselSpeed();
            this.carousel.touch();

            $(window).resize(() => {
                this.carousel.jcarousel("reload");
                this.setCarouselSpeed();
                this.carousel.touch();
            });
        }

        setCarouselSpeed() {
            if (this.carousel.innerWidth() > 768) {
                $("div[role='cross-sells'] .carousel-control-prev")
                    .jcarouselControl({
                        target: "-=2"
                    });
                $("div[role='cross-sells'] .carousel-control-next")
                    .jcarouselControl({
                        target: "+=2"
                    });
            } else {
                $("div[role='cross-sells'] .carousel-control-prev")
                    .jcarouselControl({
                        target: "-=1"
                    });
                $("div[role='cross-sells'] .carousel-control-next")
                    .jcarouselControl({
                        target: "+=1"
                    });
            }
        }

        reloadCarousel() {
            var num = $(".cs-carousel .isc-productContainer").length;
            var el = this.carousel, //  $(this),
                width = el.innerWidth();

            if (width > 768) {
                width = width / 4;
                this.showCarouselArrows(num > 4);
            } else if (width > 480) {
                width = width / 3;
                this.showCarouselArrows(num > 3);
            } else {
                this.showCarouselArrows(num > 1);
            }

            el.jcarousel("items").css("width", width + "px");
            this.equalizeCarouselDimensions();
        }

        equalizeCarouselDimensions() {
            if ($(".carousel-item-equalize").length > 0) {
                var maxHeight = -1;
                var maxThumbHeight = -1;
                var maxNameHeight = -1;

                var navHeight = "min-height:" + $("ul.item-list").height();
                $(".left-nav-2").attr("style", navHeight);

                // clear the height overrides
                $(".carousel-item-equalize").each(function() {
                    $(this).find(".item-thumb").height("auto");
                    $(this).find(".item-name").height("auto");
                    $(this).height("auto");
                });

                // find the max heights
                $(".carousel-item-equalize").each(function() {
                    var thumbHeight = $(this).find(".item-thumb").height();
                    maxThumbHeight = maxThumbHeight > thumbHeight ? maxThumbHeight : thumbHeight;
                    var nameHeight = $(this).find(".item-name").height();
                    maxNameHeight = maxNameHeight > nameHeight ? maxNameHeight : nameHeight;
                      
                });

                // set all to max heights
                if (maxThumbHeight > 0) {
                    $(".carousel-item-equalize").each(function() {
                        $(this).find(".item-thumb").height(maxThumbHeight);
                        $(this).find(".item-name").height(maxNameHeight);
                        var height = $(this).height();
                        maxHeight = maxHeight > height ? maxHeight : height;
                        $(this).addClass("eq");
                    });
                    $(".carousel-item-equalize").height(maxHeight);
                }
            }
        }

        showCarouselArrows(shouldShowArrows: boolean) {
            if (shouldShowArrows) {
                $(".carousel-control-prev,.carousel-control-next").show();
            } else {
                $(".carousel-control-prev,.carousel-control-next").hide();
            }
        }
    }

    angular.module("insite")
        .controller("CrossSellCarouselController", CrossSellCarouselController);
} 