module insite.catalog {
    import CategoryFacetDto = Insite.Core.Plugins.Search.Dtos.CategoryFacetDto;
    import AttributeTypeFacetDto = Insite.Core.Plugins.Search.Dtos.AttributeTypeFacetDto;
    "use strict";

    export class ProductListController {
        view: string;
        attributeValueIds: string[] = [];
        priceFilterMinimums: string[] = [];
        filterCategory: CategoryFacetDto;
        searchWithinTerms = [];
        getSecondaryData = true;
        query: string;
        ready: boolean = false;
        products: ProductCollectionModel = <any>{};
        settings: ProductSettingsModel;
        category: CategoryModel;  // regular category page
        breadCrumbs: BreadCrumbModel[];
        searchCategory: CategoryModel; // searching within a category
        page: number = null; //query string page
        pageSize: number = null; // query string pageSize
        sort: string = null; // query string sort
        isSearch: boolean;
        visibleTableProduct: ProductDto;
        customPagerContext: ICustomPagerContext;
        paginationStorageKey = "DefaultPagination-ProductList";
        settingsDeferred: ng.IDeferred<boolean>;
        noResults: boolean;
        pageChanged: boolean = false; // true when the pager has done something to change pages.
        imagesLoaded: number; // number of product images loaded. set by productlistimageonload directive
        originalQuery: string;
        autoCorrectedQuery: boolean;
        includeSuggestions: string;
        searchHistoryLimit: number;

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
            "$q",
            "searchService",
            "spinnerService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected cartService: cart.ICartService,
            protected productService: IProductService,
            protected compareProductsService: ICompareProductsService,
            protected $rootScope: ng.IRootScopeService,
            protected $window: ng.IWindowService,
            protected $localStorage: core.IWindowStorage,
            protected paginationService: core.IPaginationService,
            protected $q: ng.IQService,
            protected searchService: ISearchService,
            protected spinnerService: core.ISpinnerService
        ) {
            this.init();
        }

        init() {
            this.settingsDeferred = this.$q.defer();
            this.products.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);
            this.cartService.preventCartLoad = true;
            this.filterCategory = { categoryId: null, selected: false, shortDescription: "", count: 0, subCategoryDtos: null, websiteId: null };
            this.view = this.$localStorage.get("productListViewName");
            this.cartService.preventCartLoad = true;

            this.getQueryStringValues();
            this.getHistoryValues();

            this.isSearch = this.query !== "";
            if (this.isSearch && this.view === "table") {
                this.view = "list";
            }

            if (this.isSearch) {
                this.getProductData({
                    query: this.query,
                    categoryId: this.category ? this.category.id : (this.filterCategory ? this.filterCategory.categoryId : null),
                    pageSize: this.pageSize || (this.products.pagination ? this.products.pagination.pageSize : null),
                    sort: this.sort || this.$localStorage.get("productListSortType", null),
                    page: this.page,
                    attributeValueIds: this.attributeValueIds,
                    priceFilters: this.priceFilterMinimums,
                    searchWithin: this.searchWithinTerms.join(" "),
                    includeSuggestions: this.includeSuggestions
                });
            } else {
                this.resolvePage();
            }

            this.$scope.$on("settingsLoaded", (event, data) => {
                this.settings = data.productSettings;
                this.searchHistoryLimit = data.searchSettings ? data.searchSettings.searchHistoryLimit : null;
                this.settingsDeferred.resolve(true);
            });

            this.$rootScope.$on("compareProductsUpdated", () => {
                this.reloadCompareProducts();
            });

            this.$q.when(this.settingsDeferred.promise).then(() => {
                this.applySettings();
            });

            this.initBackButton();
        }

        // set up the handlers for the browser back button using popstate events
        initBackButton() {
            // update the page when user hits the back button (without leaving the page)
            this.$window.addEventListener("popstate", () => {
                this.getQueryStringValues();
                this.getHistoryValues();

                var getProductParams: IProductCollectionParameters = {
                    pageSize: this.pageSize || (this.products.pagination ? this.products.pagination.pageSize : null),
                    sort: this.sort || this.$localStorage.get("productListSortType", null),
                    page: this.page,
                    attributeValueIds: this.attributeValueIds,
                    priceFilters: this.priceFilterMinimums,
                    includeSuggestions: this.includeSuggestions
                };

                if (this.isSearch) {
                    getProductParams.query = this.query;
                    getProductParams.categoryId = this.category ? this.category.id : (this.filterCategory ? this.filterCategory.categoryId : null);
                } else {
                    getProductParams.categoryId = this.category.id;
                }

                this.getProductData(getProductParams);
            });
        }

        // do actions that depend on the product settings
        applySettings() {
            this.view = this.view || this.settings.defaultViewType.toLowerCase();
            if (this.view !== "list" && this.view !== "grid" && this.view !== "table") {
                this.view = "list";
            }

            this.customPagerContext = {
                isSearch: this.isSearch,
                view: this.view,
                selectView: this.selectView,
                attributeTypeFacets: this.products.attributeTypeFacets,
                changeTableColumn: ((attr) => this.changeTableColumn(attr)),
                sortedTableColumns: this.sortedTableColumns()
            };

            this.customPagerContext.selectView(this.customPagerContext.view);
        }

        // get query string values (only query is used normally)
        getQueryStringValues() {
            this.query = this.coreService.getQueryStringParameter("criteria", true) || "";
            this.page = this.coreService.getQueryStringParameter("page", true) || null;
            this.pageSize = this.coreService.getQueryStringParameter("pageSize", true) || null;
            this.sort = this.coreService.getQueryStringParameter("sort", true) || null;
            this.includeSuggestions = this.coreService.getQueryStringParameter("includeSuggestions", true) || "true";
        }

        // get context values coming from the browser history (when back button was used)
        getHistoryValues() {
            if (this.$window.history.state) {
                var state = this.$window.history.state;
                this.page = state.page;

                if (state.attributeValueIds) {
                    this.attributeValueIds = state.attributeValueIds;
                }
                if (state.filterCategory) {
                    this.filterCategory = state.filterCategory;
                }
                if (state.priceFilterMinimums) {
                    this.priceFilterMinimums = state.priceFilterMinimums;
                }
                if (state.searchWithinTerms) {
                    this.searchWithinTerms = state.searchWithinTerms;
                }
            }
        }

        // set the isBeingCompared boolean on the products 
        reloadCompareProducts() {
            var productsToCompare = this.compareProductsService.getProductIds();
            for (var i in this.products.products) {
                var product = this.products.products[i];
                product.isBeingCompared = lodash.contains(productsToCompare, product.id);
            }
        }

        // tell the hopper to add the product to the compare list
        compareProduct(product: ProductDto) {
            if (!product.isBeingCompared) {
                if (this.compareProductsService.getProductIds().length > 5) {
                    this.showExceedCompareLimitPopup();
                    return;
                }
                this.compareProductsService.addProduct(product);
            } else {
                this.compareProductsService.removeProduct(product.id.toString());
            }
            product.isBeingCompared = !product.isBeingCompared;
        }

        showExceedCompareLimitPopup() {
            (<any>angular.element("#AddToCompareExceedsSixProducts")).foundation("reveal", "open");
        }

        resolvePage() {
            var path = window.location.pathname;
            this.productService.getCatalogPage(path).then(
                (result: CatalogPageModel) => {
                    this.category = result.category;
                    this.breadCrumbs = result.breadCrumbs;
                    this.getProductData({
                        categoryId: this.category.id,
                        pageSize: this.pageSize || (this.products.pagination ? this.products.pagination.pageSize : null),
                        sort: this.sort || this.$localStorage.get("productListSortType", ""),
                        page: this.page,
                        attributeValueIds: this.attributeValueIds,
                        priceFilters: this.priceFilterMinimums,
                        searchWithin: this.searchWithinTerms.join(" "),
                        includeSuggestions: this.includeSuggestions
                    });
                }
            );
        }

        // params: object with query string parameters for the products REST service
        getProductData(params: IProductCollectionParameters, expand?: string[]) {
            if (this.ready) {
                this.spinnerService.show("productlist");
            }

            expand = expand != null ? expand : ["pricing", "attributes", "facets"];
            this.productService.getProductCollectionData(params, expand).then(
                (result: ProductCollectionModel) => {
                    // got product data
                    if (result.exactMatch) {
                        this.searchService.addSearchHistory(this.query, this.searchHistoryLimit, this.includeSuggestions.toLowerCase() === "true");
                        this.$window.location.href = `${result.products[0].productDetailUrl}?criteria=${params.query}`;
                        return;
                    }

                    if (expand.length !== 3) {
                        result.attributeTypeFacets = this.products.attributeTypeFacets;
                        result.categoryFacets = this.products.categoryFacets;
                        result.priceRange = this.products.priceRange;
                    }
                    this.products = result;
                    this.products.products.forEach(product => { product.qtyOrdered = 1; });

                    this.reloadCompareProducts();

                    if (this.category == null && this.products.categoryFacets) {
                        var categoryFacet = lodash.first(lodash.where(this.products.categoryFacets, { "selected": true }));
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

                    if (this.includeSuggestions === "true") {
                        if (result.originalQuery) {
                            this.query = result.correctedQuery || result.originalQuery;
                            this.originalQuery = result.originalQuery;
                            this.autoCorrectedQuery = result.correctedQuery != null && result.correctedQuery !== result.originalQuery;
                        } else {
                            this.autoCorrectedQuery = false;
                        }
                    }

                    this.searchService.addSearchHistory(this.query, this.searchHistoryLimit, this.includeSuggestions.toLowerCase() === "true");

                    this.imagesLoaded = 0;
                    if (this.view === "grid") {
                        this.waitForDom();
                    }
                },
                () => {
                    // no results
                    this.ready = true;
                    this.noResults = true;
                });
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
                        this.cEqualize();
                    } else {
                        this.waitForDom(tries - 1);
                    }
                }, 20);
            }
        }

        // store state in the browser history so back button will work
        storeHistory() {
            var state = {
                page: this.products.pagination.currentPage,
                attributeValueIds: this.attributeValueIds,
                filterCategory: this.filterCategory,
                priceFilterMinimums: this.priceFilterMinimums,
                searchWithinTerms: this.searchWithinTerms
            };
            this.$window.history.pushState(state, "any", null);
        }

        // updates products based on the state of this.pagination and the initial search/category query
        updateProductData() {
            this.storeHistory();
            this.$localStorage.set("productListSortType", this.products.pagination.sortType);
            if (this.searchWithinTerms) {
                this.includeSuggestions = "false";
            }
            var params = {
                categoryId: this.category ? this.category.id : (this.filterCategory ? this.filterCategory.categoryId : null),
                query: this.query,
                searchWithin: this.searchWithinTerms.join(" "),
                page: this.products.pagination.currentPage,
                pageSize: this.products.pagination.pageSize,
                sort: this.products.pagination.sortType,
                attributeValueIds: this.attributeValueIds,
                priceFilters: this.priceFilterMinimums,
                includeSuggestions: this.includeSuggestions
            };
            this.getProductData(params, this.pageChanged ? ["pricing", "attributes"] : null);
            this.pageChanged = false;
        }

        attributeValueForSection(sectionFacet: AttributeTypeFacetDto, product: ProductDto) {
            for (var i = 0; i < product.attributeTypes.length; i++) {
                var productSection = product.attributeTypes[i];
                if (productSection.id.toString() === sectionFacet.attributeTypeId.toString()) {
                    if (productSection.attributeValues.length > 0) {
                        return productSection.attributeValues[0];
                    }
                }
            }
            return null;
        }

        addToCart(product: ProductDto) {
            this.cartService.addLineFromProduct(product);
        }

        changeUnitOfMeasure(product: ProductDto) {
            this.productService.changeUnitOfMeasure(product);
        }

        // called by pager when a different view is selected, and also once at startup
        selectView = (viewName: string) => {
            this.killHeights();
            this.view = viewName;
            // product will be undefined if this was called on startup. let getProductData call waitForDom.
            if (viewName === "grid" && this.products.products) {
                this.waitForDom();
            }
            this.$localStorage.set("productListViewName", viewName);
            this.customPagerContext.view = viewName;
        }

        // in grid view, make all the boxes as big as the biggest one
        cEqualize() {
            var $itemBlocks = $(".item-block");
            if ($itemBlocks.length > 0) {
                var maxHeight = -1;
                var priceHeight = -1;
                var thumbHeight = -1;

                $itemBlocks.each((i, elem) => {
                    var $elem = $(elem);
                    maxHeight = maxHeight > $elem.find(".item-inf-wrapper").height() ? maxHeight : $elem.find(".item-inf-wrapper").height();
                    priceHeight = priceHeight > $elem.find(".item-price").height() ? priceHeight : $elem.find(".item-price").height();
                    thumbHeight = thumbHeight > $elem.find(".item-thumb").height() ? thumbHeight : $elem.find(".item-thumb").height();
                });
                if (maxHeight > 0) {
                    $itemBlocks.each((i, elem) => {
                        var $elem = $(elem);
                        $elem.find(".item-inf-wrapper").height(maxHeight);
                        $elem.find(".item-price").height(priceHeight);
                        $elem.find(".item-thumb").height(thumbHeight);
                        $elem.addClass("eq");
                    });
                }
            }
        }

        killHeights() {
            $(".item-inf-wrapper").removeAttr("style");
            $(".item-price").removeAttr("style");
            $(".item-thumb").removeAttr("style");
        }

        openWishListPopup(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        // changed handler on table view column check boxes (ui in pager.cshtml)
        changeTableColumn(attribute: AttributeTypeFacetDto) {
            if (this.visibleTableColumns().length > 3) {
                (<any>attribute).checked = false;
                alert("You cannot select more than 3 attributes.");
            }
        }

        // all columns for table view check boxes
        sortedTableColumns(): AttributeTypeFacetDto[] {
            if (!this.products) {
                return [];
            }

            return lodash.chain(this.products.attributeTypeFacets)
                .sortBy(["sort", "name"])
                .value();
        }

        // visible (checked) columns for table view
        visibleTableColumns(): any[] {
            if (!this.products) {
                return [];
            }

            return lodash.chain(this.products.attributeTypeFacets)
                .sortBy(["sort", "name"])
                .where({ "checked": true })
                .value();
        }

        toggleTablePanel(product: ProductDto) {
            if (this.visibleTableProduct === product) {
                this.visibleTableProduct = null;
            } else {
                this.visibleTableProduct = product;
            }
        }

        isTablePanelVisible(product: ProductDto) {
            return this.visibleTableProduct === product;
        }

        // returns true if this is a page that renders sub categories rather than products
        isCategoryPage() {
            return this.category && this.category.subCategories && this.category.subCategories.length > 0;
        }

        pagerPageChanged() {
            this.pageChanged = true;
        }
    }

    export interface ICustomPagerContext {
        isSearch: boolean;
        view: string;
        selectView: (viewName: string) => void;
        attributeTypeFacets: AttributeTypeFacetDto[];
        changeTableColumn: (attribute: AttributeTypeFacetDto) => void;
        sortedTableColumns: AttributeTypeFacetDto[];
    };

    angular
        .module("insite")
        .controller("ProductListController", ProductListController);
}
