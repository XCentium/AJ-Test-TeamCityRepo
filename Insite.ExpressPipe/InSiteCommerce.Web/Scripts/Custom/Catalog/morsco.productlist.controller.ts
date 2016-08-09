module insite.catalog {
    import CategoryFacetDto = Insite.Core.Plugins.Search.Dtos.CategoryFacetDto;
    import AttributeTypeFacetDto = Insite.Core.Plugins.Search.Dtos.AttributeTypeFacetDto;
    "use strict";

    export class MorscoProductListController extends ProductListController {

        hasInit: boolean = false;
        facetHasInit: boolean = false;
        hasAttributeValues: boolean = false;
        isAuthenticated: boolean = false;
        cart: CartModel;
        prevItemsOnly: boolean = false;
        warehouses: any = {};
        catIds: string[] = [];
        selectedFacet: AttributeTypeFacetDto;

        public static $inject = [
            "$scope",
            "coreService",
            "cartService",
            "productService",
            "compareProductsService",
            "$rootScope",
            "$window",
            "$localStorage",
            "paginationService",
            "customProductService",
            "$q",
            "searchService",
            "spinnerService",
            "sessionService"
            , "ipCookie"
        ];



        constructor(
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected cartService: cart.ICartService,
            protected productService: IProductService,
            protected compareProductsService: ICompareProductsService,
            protected $rootScope: ng.IRootScopeService,
            protected $window: ng.IWindowService,
            $localStorage: core.IWindowStorage,
            protected paginationService: core.IPaginationService,
            protected customProductService: catalog.ICustomProductService,
            protected $q: ng.IQService,
            protected searchService: ISearchService,
            protected spinnerService: core.ISpinnerService,
            protected sessionService: ISessionService
            , protected ipCookie: any
            ) {
            super($scope, coreService, cartService, productService, compareProductsService, $rootScope, $window, $localStorage, paginationService, $q, searchService, spinnerService);
            this.sessionService.getIsAuthenticated().then(result => {
                this.isAuthenticated = result;
            });
            
            if (this.ipCookie('showOnlyPreviousPurchased')) {
                this.prevItemsOnly = this.ipCookie('showOnlyPreviousPurchased');
            }
        }

        getUrlVars() {
            if (!window.location.search) {
                return ({});   // return empty object
            }
            var parms = {};
            var temp;
            var querystring = window.location.hash.slice(1);
            var items = querystring.slice(1).split("&");   // remove leading ? and split
            for (var i = 0; i < items.length; i++) {
                temp = items[i].split("=");
                if (temp[0]) {
                    if (temp.length < 2) {
                        temp.push("");
                    }
                    parms[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
                }
            }
            return (parms);
        }

        init() {
            this.settingsDeferred = this.$q.defer();
            this.products.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);
            this.cartService.preventCartLoad = true;
            this.filterCategory = { categoryId: null, selected: false, shortDescription: "", count:0, subCategoryDtos: null, websiteId: null };
            this.view = this.$localStorage.get("productListViewName");
            this.cartService.preventCartLoad = true;

            this.getQueryStringValues();
            this.getHistoryValues();

            this.isSearch = this.query !== "";
            if (this.isSearch && this.view == "table") {
                this.view = "list";
            }
            
            if (this.isSearch) {
                this.getProductData({
                    query: this.query,
                    pageSize: this.pageSize || (this.products.pagination ? this.products.pagination.pageSize : null),
                    sort: this.sort || this.$localStorage.get("productListSortType", null),
                    page: this.page,
                    includeSuggestions: this.includeSuggestions
                });
            } else {
                this.resolvePage();
            }

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.productSettings;
                this.searchHistoryLimit = data.searchSettings ? data.searchSettings.searchHistoryLimit : null;

                this.settingsDeferred.resolve(true);

                this.updateLayout();
            });

            this.$rootScope.$on("compareProductsUpdated",() => {
                this.reloadCompareProducts();
            });

            this.$q.when(this.settingsDeferred.promise).then(() => {
                this.applySettings();
            });

			this.initBackButton();
        }

       

        // params: object with query string parameters for the products REST service
        getProductData(params: IProductCollectionParameters, expand?: string[]) {
            var selectedColumns: AttributeTypeFacetDto[];
            if (this.customPagerContext && this.customPagerContext.sortedTableColumns)
                selectedColumns = this.customPagerContext.sortedTableColumns.filter((item: any) => { return item.checked; });
            this.hasAttributeValues = this.attributeValueIds.length > 0;
            var self = this;
            self.$rootScope.$emit("getProducts", this.products);
            expand = ["noprices", "attributes", "facets"];
            try {
                this.spinnerService.show("mainLayout");
            }
            catch (ex) { }
            this.productService.getProductCollectionData(params, expand).then(
                (result: ProductCollectionModel) => {
                    // got product data -- and not doing faceted search
                    if (result.exactMatch
                        && (!params.attributeValueIds || params.attributeValueIds.length === 0)
                        && (!params['filterCategoryIds'] || params['filterCategoryIds'].length === 0)) {
                        this.searchService.addSearchHistory(this.query, this.searchHistoryLimit, this.includeSuggestions.toLowerCase() === "true");
                        this.$window.location.href = `${result.products[0].productDetailUrl}?criteria=${params.query}`;
                        return;
                    }

                    var oldAttributeTypeFacets = this.products.attributeTypeFacets;
                    if (expand.length == 3) {
                        this.products = result;
                    } else {
                        result.attributeTypeFacets = this.products.attributeTypeFacets;
                        result.categoryFacets = this.products.categoryFacets;
                        result.priceRange = this.products.priceRange;
                        this.products = result;
                    }
                    this.reloadCompareProducts();
                    angular.forEach(this.products.products, product => {
                        product.qtyOrdered = 1;
                        if (product.properties['minimumSellQty']) {
                            product.qtyOrdered = parseInt(product.properties['minimumSellQty']);
                        }
                        
                    });

                    if (result.properties['warehouses']) {
                        self.warehouses = JSON.parse(result.properties['warehouses']);
                    }

                    if (this.category == null && this.products.categoryFacets) {
                        this.filterCategory.categoryId = null;
                        var categoryFacet: CategoryFacetDto = lodash.first(lodash.where(this.products.categoryFacets, { "selected": true }));

                        if (categoryFacet) {
                            this.filterCategory.categoryId = categoryFacet.categoryId;
                            this.filterCategory.shortDescription = categoryFacet.shortDescription;
                            this.filterCategory.selected = true;
                            this.searchCategory = null;
                        }
                    }
                    
                    // context for custom pager to handle view selection                    
                    lodash.chain(this.sortedTableColumns())
                        .first(3)
                        .forEach(facet => { (<any>facet).checked = true; });

                    if (this.customPagerContext) {
                        this.customPagerContext.attributeTypeFacets = this.products.attributeTypeFacets;
                        this.customPagerContext.sortedTableColumns = this.sortedTableColumns();

                        var sortedTableColumns = this.customPagerContext.sortedTableColumns;
                        sortedTableColumns.forEach((item: any) => {
                            item.checked = false;
                        });
                        sortedTableColumns.slice(0, Math.min(3, sortedTableColumns.length)).forEach((item: any) => {
                            item.checked = true;
                        });
                    };

                    // allow the page to show
                    this.ready = true;
                    this.noResults = result.products.length === 0;

                    if (this.getSecondaryData) {
                        this.cartService.preventCartLoad = false;
                        this.cartService.getCart();
                        this.getSecondaryData = false;
                    }

                    this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                        self.cart = cart;
                    });
                    if (this.includeSuggestions == "true") {
                        if (result.originalQuery) {
                            this.query = result.correctedQuery || result.originalQuery;
                            this.originalQuery = result.originalQuery;
                            this.autoCorrectedQuery = result.correctedQuery != null && result.correctedQuery !== result.originalQuery;
                        } else {
                            this.autoCorrectedQuery = false;
                        }
                    }

                    this.searchService.addSearchHistory(this.query, this.searchHistoryLimit, this.includeSuggestions.toLowerCase() === "true");
                    
                    this.products.categoryFacets.forEach((category) => {
                        this.catIds.forEach((selectedCategory) => {
                            if (category.categoryId === selectedCategory) {
                                category.selected = true;
                            }
                        });
                    });
                    this.products.attributeTypeFacets.forEach((facet) => {
                        if (this.selectedFacet) {
                            if (facet.attributeTypeId === this.selectedFacet.attributeTypeId) {
                                facet.attributeValueFacets = this.selectedFacet.attributeValueFacets;

								facet.attributeValueFacets.forEach((attValFacet) => {
									attValFacet.selected = false;
									params.attributeValueIds.forEach((selectedAttribute) => {
										if (attValFacet.attributeValueId == selectedAttribute) {
											attValFacet.selected = true;
										}
									});
								});
														
                            }
                        }
                    });
                    setTimeout(function () {
                        $('.n-filter-toggle').on('click', function (e) {
                            e.preventDefault();

                            $('.n-filter').addClass('expanded');
                        });

                        $('.n-filter-toggle-close').on('click', function (e) {
                            e.preventDefault();

                            $('.n-filter').removeClass('expanded');
                        });
                    }, 500);

                    this.imagesLoaded = 0;
                    self.$rootScope.$emit("getProductsComplete", this.products);
                    // Check if hasInit so that Product Recos do not re-init
                    if (!self.hasInit) {
                        self.$rootScope.$emit("getProductListComplete", this.products);
                    }
                    self.hasInit = true;
                    self.$rootScope.$emit("updateLayout");
                    if (this.category) {
                        // Category Landing page
                        setTimeout(function () {
                            self.facetInit();
                        }, 250);
                    }
                    this.waitForDom();
                    this.updateLayout();
                    this.spinnerService.hide("mainLayout");
                    expand = ["TODOInsiteBug", "attributes", "facets"];
                    this.productService.getProductCollectionData(params, expand).then(
                        (result: ProductCollectionModel) => {
                            this.products.products.forEach((product: ProductDto) => {
                                result.products.forEach((productResult: ProductDto) => {
                                    if (product.id == productResult.id) {
                                        product.pricing = productResult.pricing;
                                        if (result.properties['warehouses']) {
                                            self.warehouses = JSON.parse(result.properties['warehouses']);
                                        }
                                        product.availability = productResult.availability;
                                        if (productResult.properties['availability']) {
                                            product.properties['availability'] = productResult.properties['availability'];
                                            var availability = JSON.parse(product.properties['availability']);
                                            if (availability.StockQty > 0) {
                                                product.availability['messageType'] = 1;
                                                product.availability['message'] = "In Stock";
                                            }
                                        }
                                    }
                                });
                            });
                    });
                },
                (error) => {
                    // no results
                    this.ready = true;
                    this.noResults = true;
                    this.updateLayout();
                    $('.product-list .recos').show();
                    this.spinnerService.hide("mainLayout");
                });
        }

        // updates products based on the state of this.pagination and the initial search/category query
        updateProductDataArray(categoryIds: string[], selectedFacet: any) {
			this.catIds = [];
			categoryIds.forEach((item: any) => {
                this.catIds.push(item.categoryId);
            });
            this.selectedFacet = selectedFacet;
            this.updateProductData();
		}

        updateProductData() {
			this.storeHistory();
            this.$localStorage.set("productListSortType", this.products.pagination.sortType);
            if (this.searchWithinTerms) {
                this.includeSuggestions = "false";
            }
            var categoryId = {};
            if (this.catIds.length == 0) {
                categoryId = this.category ? this.category.id : (this.filterCategory ? this.filterCategory.categoryId : null);
            }
            var params = {

                categoryId: categoryId,
                query: this.query, 
                searchWithin: this.searchWithinTerms.join(" "),
                page: this.products.pagination.currentPage,
                pageSize: this.products.pagination.pageSize,
                sort: this.products.pagination.sortType,
                attributeValueIds: this.attributeValueIds,
                priceFilters: this.priceFilterMinimums,
                includeSuggestions: this.includeSuggestions,
                filterCategoryIds: this.catIds
            };
            this.getProductData(params, this.pageChanged ? ["pricing", "attributes"] : null);
            this.pageChanged = false;
        }

        setTogglePurchasedProducts() {
            this.ipCookie('showOnlyPreviousPurchased', !this.ipCookie('showOnlyPreviousPurchased'));
            this.$window.location.reload();
        }

        // Equalize the product grid after all of the images have been downloaded or they will be misaligned (grid view only)
        waitForDom(tries?: number) {
            if (isNaN(+tries)) {
                tries = 1000; //Max 20000ms
            }

            //If DOM isn't ready after max number of tries then stop
            if (tries > 0) {
                setTimeout(() => {
                    if (this.imagesLoaded >= this.products.products.length) {
                        var that = this;
                        that.killHeights();
                        that.cEqualize();
                        var resizeId;
                        $(window).on('resize', function () {
                            clearTimeout(resizeId);
                            resizeId = setTimeout(function () {
                                            that.killHeights();
                                            that.cEqualize();
                                        }, 100);
                        });
                        //if (!this.facetHasInit) {
                            this.facetInit();
                        //}
                        $('.products-column .recos').show();
                    } else {
                        this.waitForDom(tries - 1);
                    }
                }, 20);
            }
        }

        updateLayout() {
            var self = this;
            if ($('.isc-editing').length === 0) {
                if (this.noResults && this.category == null) {
                    $('.category-content').remove();
                    $('.recos').insertAfter('.cat-list');
                } else if (this.category && this.category.subCategories.length > 0) {
                    $('.category-content').insertBefore('.cat-list-images');
                    $('.top-products').insertAfter('.cat-list-images');
                    $('.product-recos').insertAfter('.cat-list-images');
                } else if (this.products && this.products.products && this.products.products.length > 0) {
                    $('.products-column').append($('.top-products'));
                    $('.products-column').append($('.product-recos'));
                }

                if ($('.merchandising .merchandising-item').length < 1) {
                    $('.merchandising').hide();
                }
            }
            setTimeout(function () {
                $(document).foundation('orbit', 'reflow');
                $(document).foundation('tooltip', 'reflow');
                $('.product-list .recos').show();

                self.equalizeCatImages();

                $(window).on('resize', function () {
                    self.equalizeCatImages();
                });
            },500);
        }

        equalizeCatImages() {
            $('.cat-list-image > div > a').each(function (e) {
                var img = $(this);
                img.height(img.parent().width());
                img.width(img.parent().width());
            });
            $('.cat-list-image > div > a').equalHeights();
        }

        cEqualize() {
            //$('.product-list .item-block .item-brand').dotdotdot({});
            $('.product-list .item-block .item-name').dotdotdot({});
            
            if (this.view == "grid") {
                var $itemBlocks = $(".product-list .item-list .item-block");
                if ($itemBlocks.length > 0) {
                    var maxHeight = -1;
                    var priceHeight = -1;
                    var thumbHeight = -1;
                    var thumbWidth = -1;
                    var envIconsHeight = -1;
                    var availHeight = -1;
                    var brandHeight = -1;
                    $itemBlocks.each(function () {
                        maxHeight = maxHeight > $(this).find(".item-inf-wrapper").height() ? maxHeight : $(this).find(".item-inf-wrapper").height();
                        priceHeight = priceHeight > $(this).find(".item-price").height() ? priceHeight : $(this).find(".item-price").height();
                        thumbWidth = thumbWidth > $(this).find(".item-thumb").width() ? thumbWidth : $(this).find(".item-thumb").width();
                        // Height just needs to match width for square
                        thumbHeight = thumbWidth;
                        envIconsHeight = envIconsHeight > $(this).find(".item-env-icons").height() ? envIconsHeight : $(this).find(".item-env-icons").height();
                        availHeight = availHeight > $(this).find(".item-availability").height() ? envIconsHeight : $(this).find(".item-availability").height();
                        brandHeight = brandHeight > $(this).find(".item-brand").height() ? brandHeight : $(this).find(".item-brand").height();
                    });
                    
                    if (maxHeight > 0) {
                        $itemBlocks.each(function () {
                            $(this).find(".item-inf-wrapper").height(maxHeight);
                            $(this).find(".item-price").height(priceHeight);
                            $(this).find(".item-thumb > a").height(thumbHeight);
                            $(this).find(".item-thumb > a").width(thumbWidth);
                            $(this).find(".item-env-icons").height(envIconsHeight);
                            $(this).find(".item-availability").height(availHeight);
                            $(this).find(".item-brand").height(brandHeight);
                            $(this).addClass("eq");
                        });
                    }
                }
            }

            /* need to equalize height of category page images */
            $('.cat-list-image img').equalHeights();

            $('.item-block').removeClass('loading');
            
        }

        killHeights() {
            $(".product-list .item-inf-wrapper").removeAttr("style");
            $(".product-list .item-price").removeAttr("style");
            $(".product-list .item-thumb > a").removeAttr("style");
            $(".product-list .item-env-icons").removeAttr("style");
            $(".product-list .item-availability").removeAttr("style");
            $(".product-list .item-brand").removeAttr("style");
        }

        facetInit() {
            $('.accord-head').unbind('click');
            $('.accord-head').on('click', function (e) {
                if ($(this).find('> input[type="checkbox"]:checked').length > 0) {
                    $(this).find('> input[type="checkbox"]').prop('checked', false);
                    $(this).parent('.accordion-navigation').toggleClass('expanded');
                } else {
                    $(this).find('> input[type="checkbox"]').prop('checked', true);
                    $(this).parent('.accordion-navigation').toggleClass('expanded');
                }
            });
            var facets = $('.accord-content');
            facets.each(function () {
                var facet = $(this);
                facet.find('.accord-more a').unbind('click');
                facet.find('.accord-more a').on('click', function (e) {
                    e.preventDefault();
                    var showMore = $(this);

                    if (facet.hasClass('expanded')) {
                        facet.removeClass('expanded');
                        showMore.text('show more');
                    } else {
                        facet.addClass('expanded');
                        showMore.text('show less');
                    }
                });
            });
            this.facetHasInit = true;
            this.facetUpdate();
        }

        facetUpdate() {
            $('.n-filter .accordion:lt(3) .accordion-navigation > .accord-head > input[type="checkbox"]').prop('checked', true);
            $('.f-selected').parents('.accordion-navigation').find('.accord-head > input[type="checkbox"]').prop('checked', true);
            $('.n-filter .accordion .accordion-navigation > .accord-head > input[type="checkbox"]:checked').parents('.accordion-navigation').addClass('expanded');
        }

        showProductAvailabilityPopup(product: ProductDto, warehouses: {} ) {
            this.customProductService.setAvailability(warehouses, product.properties['availability'], product);
            this.coreService.displayModal("#popup-availability");
        }

        // tell the hopper to add the product to the compare list
        compareProduct(product: ProductDto) {
            if (!product.isBeingCompared) {
                if (this.compareProductsService.getProductIds().length > 3) {
                    this.showExceedCompareLimitPopup();
                    return;
                }
                this.compareProductsService.addProduct(product);
            } else {
                this.compareProductsService.removeProduct(product.id.toString());
            }
            product.isBeingCompared = !product.isBeingCompared;
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
    }

    angular
        .module("insite")
        .controller("ProductListController", MorscoProductListController);
}
