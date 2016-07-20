module insite.catalog {
    "use strict";

    export class CompareProductsCarouselController {
        addToCart: (param: { productId: string }) => void;
        removeComparedProduct: (param: { productId: string }) => void;
        openWishListPopup: (param: { product: ProductDto }) => void;
        maxTries: number;
        imagesLoaded: number;
        productsToCompare: ProductDto[];
        carousel: JQuery;

        public static $inject = ["$scope", "productService", "$timeout", "$window"];

        constructor(protected $scope: ng.IScope, protected productService: IProductService, protected $timeout: ng.ITimeoutService, protected $window: ng.IWindowService) {
            this.init();
        }

        init() {
            this.imagesLoaded = 0;
            this.waitForDom(this.maxTries);
        }

        changeUnitOfMeasure(product: ProductDto) {
            this.productService.changeUnitOfMeasure(product);
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
                && product.productUnitOfMeasures.length > 1;
        }

        //If jcarousel is initalized before the DOM is ready and images loaded
        //it will break...
        waitForDom(tries: number) {

            if (isNaN(+tries)) {
                tries = this.maxTries || 1000; //Max 20000ms
            }

            //If DOM isn"t ready after max number of tries then stop
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
            return $(".isc-carousel").length > 0
                && this.imagesLoaded === this.productsToCompare.length;
        }

        initializeCarousel() {
            $(".pc-attr-carousel-container").addClass("pc-carousel");
            this.carousel = $(".isc-carousel");
            this.carousel
                .on("jcarousel:create jcarousel:reload", (event) => {
                    var num = $(".top-carousel .items .isc-productContainer").length;
                    var element = $(event.currentTarget),
                        width = element.innerWidth();

                    if (width > 700) {
                        width = width / 4;
                        this.showCarouselArrows(num > 4);
                    } else if (width > 480) {
                        width = width / 3;
                        this.showCarouselArrows(num > 3);
                    } else {
                        this.showCarouselArrows(num > 1);
                    }

                    element.jcarousel("items").css("width", width + "px");
                    this.equalizeCarouselDimensions();
                })
                .on("jcarousel:scrollend", (event, car) => {
                    if (car.first().hasClass("isc-productContainer")) {
                        this.highlightProductAttributes(car.first());
                    }
                })
                .jcarousel({
                    wrap: "circular"
                });

            // top and bottom move together
            $(".carousel-control-prev").click((e) => {
                e.preventDefault();
                var large = $(".pc-carousel").innerWidth() > 480;
                this.carousel.jcarousel("scroll", "-=" + (large ? "2" : "1"));
            });

            $(".carousel-control-next").click((e) => {
                e.preventDefault();
                var large = $(".pc-carousel").innerWidth() > 480;
                this.carousel.jcarousel("scroll", "+=" + (large ? "2" : "1"));
            });

            if ($(".btn-panel-compare").length > 0) {
                $(".btn-panel-compare").on("jcarousel:reload", (e) => { // ????
                    e.preventDefault();
                    $(".pc-carousel").jcarousel("reload");
                });
            }

            $(".isc-small-attr-container li.pc-attr").click((event) => {
                // expand attribute
                event.preventDefault();
                event.stopPropagation();
                if ($("body").innerWidth() < 768) {
                    $("li.pc-attr.pc-active").removeClass("pc-active");
                    if ($(event.currentTarget).hasClass("pc-active")) {
                        $(event.currentTarget).removeClass("pc-active");
                    } else {
                        $(event.currentTarget).addClass("pc-active");
                    }
                }
            });

            $(".isc-small-attr-container li.pc-value").click((event) => {
                // expand attribute section
                event.preventDefault();
                event.stopPropagation();
                if ($("body").innerWidth() < 768) {
                    $("li.pc-value.pc-active").removeClass("pc-active");
                    if ($(event.currentTarget).hasClass("pc-active")) {
                        $(event.currentTarget).removeClass("pc-active");
                    } else {
                        $(event.currentTarget).addClass("pc-active");
                    }
                }
            });

            // auto scroll to selected item in mobile size
            $(".isc-small-attr-container li.pc-attr .item-block").click((event) => {
                var productId: string = $(event.currentTarget).find("[data-productid]").data("productid").toString();
                this.carousel.jcarousel("scroll", $(".isc-productContainer").find("[data-productid='" + productId + "']:first").closest("li").index());
            });

            $(".removeProductFromComparison").click((event) => {
                var productId: string = $(event.currentTarget).data("productid").toString();

                // remove several nodes relating to this product
                $("[data-productid=" + productId + "]").closest("li").remove();

                this.removeEmptyAttributes();

                this.carousel = $(".isc-carousel");
                this.carousel.jcarousel("reload");

                this.removeComparedProduct({ productId: productId });

                // update the total number of items
                var itemCount = this.carousel.jcarousel("items").length;
                $(".pc-controls .results-count .result-num").html(itemCount.toString());

                // update the highlights
                this.highlightProductAttributes(this.currentProductElement());

                if (itemCount == 0)
                    this.$window.history.back();
            });

            this.carousel.jcarousel().touch();
        }

        removeEmptyAttributes = function () {
            // delete attributes with products left
            var removeList = [];
            $(".isc-large-attr-container .pc-attr-list .pc-attr").each(function () {
                var item = $(this);
                var hasValues = false;
                item.find("li span").each(function () {
                    var span = $(this);
                    if (span.html())
                        hasValues = true;
                });
                if (!hasValues) {
                    removeList.push(item);
                }
            });


            $(".isc-small-attr-container .pc-attr-list .pc-attr").each(function () {
                var item = $(this);
                var hasValues = false;
                item.find("li").each(function () {
                    hasValues = true;
                });
                if (!hasValues) {
                    removeList.push(item);
                }
            });

            for (var i = 0; i < removeList.length; i++)
                removeList[i].remove();
        }

        highlightProductAttributes(productElement: JQuery) {
            if ($("body").innerWidth() < 768) {
                var productId = productElement.find("[data-productid]").data("productid");
                $(".isc-small-attr-container li.pc-value .item-block").removeClass("pc-active-item");
                $(".isc-small-attr-container li.pc-value [data-productid=" + productId + "]:first").closest("li.item-block").addClass("pc-active-item");
            }
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
                    var height = $(this).height();
                    maxHeight = maxHeight > height ? maxHeight : height;
                });

                // set all to max heights
                if (maxThumbHeight > 0) {
                    $(".carousel-item-equalize").each(function() {
                        $(this).find(".item-thumb").height(maxThumbHeight);
                        $(this).find(".item-name").height(maxNameHeight);
                        $(this).height(maxHeight);
                        $(this).addClass("eq");
                    });
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

        currentProductElement() {
            return $(".top-carousel").jcarousel("first");
        }
    }

    angular.module("insite")
        .controller("CompareProductsCarouselController", CompareProductsCarouselController);
} 