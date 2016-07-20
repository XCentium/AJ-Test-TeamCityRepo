// controller for the quickorder cms small widget

///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/angularjs/angular.d.ts"/>
///<reference path="../catalog/insite.product.service.ts"/>
///<reference path="../cart/insite.cart.service.ts"/>

module insite.quickorder {
    "use strict";

    export class QuickOrderController {
        product: ProductDto;
        alternateUnitsOfMeasure: boolean;
        canAddToCart: boolean;        
        errorMessage: string;
        searchTerm: string;
        selectedUnitOfMeasure: string;
        selectedQty: number;
        orderSettings: Insite.Order.WebApi.V1.ApiModels.OrderSettingsModel;
        autocompleteOptions: AutoCompleteOptions;
        findingProduct: boolean;

        public static $inject = ["cartService", "productService", "searchService", "$q", "$scope"];

        constructor(
            protected cartService: cart.ICartService,
            protected productService: IProductService,
            protected searchService: catalog.ISearchService,
            protected $q: ng.IQService,
            protected $scope: ng.IScope) {
            this.init();
        }

        init() {
            this.product = null;
            this.alternateUnitsOfMeasure = true; // ??
            this.canAddToCart = true; // ?
            this.findingProduct = false;
            this.selectedUnitOfMeasure = "EA";
            this.selectedQty = 1;
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.orderSettings = data.orderSettings;
            });

            this.initializeAutocomplete();
        }

        initializeAutocomplete() {
            var that = this;

            this.autocompleteOptions = this.searchService.getProductAutocompleteOptions(() => this.searchTerm);

            this.autocompleteOptions.template = suggestion => {
                var pattern = `(${this.searchTerm.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") })`;

                suggestion.name = suggestion.name || "";

                var name = suggestion.name.replace(new RegExp(pattern, "gi"), "<strong>$1<\/strong>");
                var shortDescription = suggestion.value.replace(new RegExp(pattern, "gi"), "<strong>$1<\/strong>");
                return `<div class='image'><img src='${suggestion.image}' /></div><div><span class='shortDescription'>${shortDescription}</span><span class='name'>${name}</span></div>`;
            };

            this.autocompleteOptions.select = function(evt) {
                var dataItem = this.dataItem(evt.item.index());
                that.addProduct(dataItem.name);
            };
        }

        addProduct(name: string) {
            if (!name || name.length === 0) {
                return;
            }
            this.findProduct(name);
        }

        findProduct(name: string) {
            this.findingProduct = true;
            var deferred = this.$q.defer();
            var parameter: insite.catalog.IProductCollectionParameters = { extendedNames: [name] };
            var expandParameter = ["pricing"];
            this.productService.getProductCollectionData(parameter, expandParameter).then(
                (result: ProductCollectionModel) => {
                    var product = result.products[0];
                    if (this.validateProduct(product)) {
                        product.qtyOrdered = 1;
                        this.product = product;
                        this.errorMessage = "";
                        deferred.resolve(result);
                    } else {
                        deferred.reject();
                    }
                    this.findingProduct = false;
                },
                (result) => {
                    this.findingProduct = false;
                    this.errorMessage = angular.element("#messageNotFound").val();
                    deferred.reject();
                });
            return deferred.promise;
        }

        validateProduct(product: ProductDto) {
            if (product.canConfigure || (product.isConfigured && !product.isFixedConfiguration)) {
                this.errorMessage = angular.element("#messageConfigurableProduct").val();
                return false;
            }
            if (product.isStyleProductParent) {
                this.errorMessage = angular.element("#messageStyledProduct").val();
                return false;
            }
            if (!product.canAddToCart) {
                this.errorMessage = angular.element("#messageUnavailable").val();
                return false;
            }
            return true;
        }

        onEnter(name: string) {
            var autocomplete = <any>$("#qo-search-widget").data("kendoAutoComplete");
            if (autocomplete._last === kendo.keys.ENTER && autocomplete.listView.selectedDataItems().length === 0) {
                this.addProduct(this.searchTerm);
            }
        }

        changeUnitOfMeasure(product: ProductDto) {
            if (!product.productUnitOfMeasures) {
                return;
            }
            // this calls to get a new price and updates the product which updates the ui
            product.selectedUnitOfMeasure = this.selectedUnitOfMeasure;
            this.productService.changeUnitOfMeasure(product);
        }

        addToCart(product: ProductDto) {
            if (!product) {
                if (!this.searchTerm) {
                    this.errorMessage = angular.element("#messageEnterProduct").val();
                    return;
                }
                // get the product and add it all at once
                this.findProduct(this.searchTerm).then(
                    () => {
                        this.product.qtyOrdered = this.selectedQty;
                        this.addToCartAndClearInput(this.product);
                    });
            } else {
                this.product.qtyOrdered = this.selectedQty;
                this.addToCartAndClearInput(this.product);
            }
        }

        addToCartAndClearInput(product: ProductDto) {
            if (product.qtyOrdered == 0) {
                product.qtyOrdered = 1;
            }

            this.cartService.addLineFromProduct(product).then(
                () => {
                    this.searchTerm = "";
                    this.selectedUnitOfMeasure = "EA";
                    this.product = null;
                    this.selectedQty = 1;
                });
        }
    }

    angular.module("insite")
        .controller("QuickOrderController", QuickOrderController);
}