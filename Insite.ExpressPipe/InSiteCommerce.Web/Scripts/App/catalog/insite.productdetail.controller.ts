import cart = insite.cart;

module insite.catalog {
    "use strict";

    export class ProductDetailController {

        product: ProductDto;
        category: CategoryModel;      
        breadCrumbs: BreadCrumbModel[];  
        settings: ProductSettingsModel;
        configurationSelection: ConfigSectionOptionDto[] = [];
        configurationCompleted = false;
        styleSelection: StyleValueDto[] = [];
        styleSelectionCompleted = false;
        parentProduct: ProductDto = null;
        initialStyleTraits: StyleTraitDto[] = [];
        initialStyledProducts: StyledProductDto[] = [];
        styleTraitFiltered: StyleTraitDto[] = [];        

        public static $inject = ["$scope", "$filter", "coreService", "cartService", "productService"];

        constructor(
            protected $scope: ng.IScope,
            protected $filter: ng.IFilterService,
            protected coreService: core.ICoreService,
            protected cartService: cart.ICartService,
            protected productService: IProductService) {

            this.init();
        }

        init() {
            this.cartService.preventCartLoad = true;

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.productSettings;
            });

            this.resolvePage();
        }

        resolvePage() {
            var path = window.location.pathname;
            this.productService.getCatalogPage(path).then(
                (result: CatalogPageModel) => {                    
                    var productId = result.productId; // this url is already known to map to a single product so productId should always be non null.
                    this.category = result.category;
                    this.breadCrumbs = result.breadCrumbs;
                    this.getProductData(productId.toString());
                },
                (error) => {                    
                }
            );
        }

        getProductData(productId: string) {
            var expandParameter = ["documents", "specifications", "styledproducts", "htmlcontent", "attributes", "crosssells", "pricing"];
            this.productService.getProductData(this.category != null ? this.category.id.toString() : null, productId, expandParameter).then(
                (result: ProductModel) => {
                    this.product = result.product;
                    this.product.qtyOrdered = 1;

                    if (this.product.isConfigured && this.product.configurationDto && this.product.configurationDto.sections)
                        this.initConfigurationSelection(this.product.configurationDto.sections);

                    if (this.product.styleTraits.length > 0) {
                        this.initialStyledProducts = this.product.styledProducts.slice();
                        this.styleTraitFiltered = this.product.styleTraits.slice();
                        this.initialStyleTraits = this.product.styleTraits.slice();
                        if (this.product.isStyleProductParent) {
                            this.parentProduct = angular.copy(this.product);
                        }
                        this.initStyleSelection(this.product.styleTraits);
                    };
                    
                    setTimeout(() => {
                        (<any>$(".easy-resp-tabs")).easyResponsiveTabs();
                    }, 10);

                    this.cartService.preventCartLoad = false;
                    this.cartService.getCart();
                },
                (error) => {                    
                }); 
        }

        initConfigurationSelection(sections: ConfigSectionDto[]) {
            angular.forEach(sections,(section: ConfigSectionDto) => {
                var result = this.coreService.getObjectByPropertyValue(section.options, { selected: "true" });
                this.configurationSelection.push(result);
            });
            this.configurationCompleted = this.isConfigurationCompleted();
        }

        initStyleSelection(styleTraits: StyleTraitDto[]) {
            angular.forEach(styleTraits, (styleTrait: StyleTraitDto) => {
                var result = this.coreService.getObjectByPropertyValue(styleTrait.styleValues, { isDefault: "true" });
                this.styleSelection.push(result);
            });
            this.styleChange();
        }

        addToCart(product: ProductDto) {
            var sectionOptions: ConfigSectionOptionDto[] = null;
            if (this.configurationCompleted && product.configurationDto && product.configurationDto.sections) {
                sectionOptions = this.configurationSelection;
            }            
            this.cartService.addLineFromProduct(product, sectionOptions);
        }

        openWishListPopup(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        changeUnitOfMeasure(product: ProductDto) {
            this.product = this.productService.changeUnitOfMeasure(product);
            if (this.parentProduct) {
                this.parentProduct.selectedUnitOfMeasure = product.selectedUnitOfMeasure;
                this.parentProduct.unitOfMeasureDisplay = product.unitOfMeasureDisplay;
            }
        }

        styleChange(): void {
            var styledProductsFiltered: StyledProductDto[] = [];

            angular.copy(this.initialStyleTraits, this.styleTraitFiltered); // init styleTraitFiltered to display

            // loop trough every trait and compose values
            this.styleTraitFiltered.forEach((styleTrait) => {
                if (styleTrait) {
                    styledProductsFiltered = this.initialStyledProducts.slice();
                    // iteratively filter products for selected traits (except current)
                    this.styleSelection.forEach((styleValue: StyleValueDto) => {
                        if (styleValue && styleValue.styleTraitId != styleTrait.styleTraitId) { //skip current
                            styledProductsFiltered = this.getProductsByStyleTraitValueId(styledProductsFiltered, styleValue.styleTraitValueId);
                        }
                    });
                    // for current trait get all distinct values in filtered products
                    var filteredValues: StyleValueDto[] = [];
                    styledProductsFiltered.forEach((product: StyledProductDto) => {
                        var currentProduct = this.coreService.getObjectByPropertyValue(product.styleValues, { styleTraitId: styleTrait.styleTraitId }); // get values for current product
                        var isProductInFilteredList = currentProduct && filteredValues.some(function(item) { return item.styleTraitValueId == currentProduct.styleTraitValueId; }); // check if value already selected
                        if (currentProduct && !isProductInFilteredList) {
                            filteredValues.push(currentProduct);
                        }
                    });
                    styleTrait.styleValues = filteredValues.slice();
                }
            });

            this.styleSelectionCompleted = this.isStyleSelectionCompleted();

            if (this.styleSelectionCompleted) {
                var selectedProduct = this.getSelectedStyleProduct(styledProductsFiltered);
                if (selectedProduct) {
                    this.defineCompletedStyleProduct(selectedProduct);
                    this.product.isStyleProductParent = false;
                }
            } else {
                if (!this.product.isStyleProductParent) {
                    // displaying parent product when style selection is not completed and completed product was displayed
                    if (this.parentProduct.productUnitOfMeasures && this.parentProduct.productUnitOfMeasures.length > 1) {
                        this.parentProduct.selectedUnitOfMeasure = this.product.selectedUnitOfMeasure ?
                            this.product.selectedUnitOfMeasure : this.parentProduct.selectedUnitOfMeasure;
                        this.productService.getProductPrice(this.parentProduct).then(
                            () => {
                                this.product = angular.copy(this.parentProduct);
                            });
                    } else {
                        this.product = angular.copy(this.parentProduct);
                    }
                }
            }
        }

        getSelectedStyleProduct(styledProducts: StyledProductDto[]): StyledProductDto {
            var finalProductList: StyledProductDto[];
            this.styleSelection.forEach((styleValue: StyleValueDto) => {
                finalProductList = this.getProductsByStyleTraitValueId(styledProducts, styleValue.styleTraitValueId);
            });
            return (finalProductList && finalProductList.length > 0) ? finalProductList[0] : null;
        }

        getProductsByStyleTraitValueId(styledProducts: StyledProductDto[], styleTraitValueId: System.Guid): StyledProductDto[] {
            return styledProducts.filter(function (product) {
                return product.styleValues.some(function (value) { return value.styleTraitValueId == styleTraitValueId; });
            });
        }

        //TODO: HP: Do we need to copy all values?
        defineCompletedStyleProduct(styledProduct: StyledProductDto): void {
            this.product.erpNumber = styledProduct.erpNumber;
            this.product.largeImagePath = styledProduct.largeImagePath;
            this.product.name = styledProduct.name;
            this.product.id = styledProduct.productId;
            this.product.qtyOnHand = styledProduct.qtyOnHand;
            this.product.quoteRequired = styledProduct.quoteRequired;
            this.product.shortDescription = styledProduct.shortDescription;
            this.product.smallImagePath = styledProduct.smallImagePath;
            this.product.availability = styledProduct.availability;

            if (this.product.productUnitOfMeasures && this.product.productUnitOfMeasures.length > 1) {
                this.productService.getProductPrice(this.product);
            } else {
                this.product.pricing = styledProduct.pricing;
                this.product.quoteRequired = styledProduct.quoteRequired;
            }
        }

        isStyleSelectionCompleted() {
            if (!this.product.styleTraits) return true;
            return this.styleSelection.every(function (item) { return item != null; });
        }

        isConfigurationCompleted() {
            if (!this.product.isConfigured) return true;
            return this.configurationSelection.every(function (item) { return item != null; });
        }

        configChanged() {
            this.configurationCompleted = this.isConfigurationCompleted();
            this.getConfigurablePrice(this.product);
        }
        
        getConfigurablePrice(product: ProductDto) {
            var configuration: string[] = [];
            angular.forEach(this.configurationSelection, (selection) => {
                configuration.push(selection ? selection.sectionOptionId.toString() : "");
            });
            this.productService.getProductPrice(product, configuration);
        }
    }

    angular
        .module("insite")
        .controller("ProductDetailController", ProductDetailController);
}