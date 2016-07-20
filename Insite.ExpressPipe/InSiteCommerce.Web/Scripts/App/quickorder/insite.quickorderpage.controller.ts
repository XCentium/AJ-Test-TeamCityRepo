// controller for the quickorder full page widget

///<reference path="../_typelite/insite.models.d.ts"/>
///<reference path="../catalog/insite.product.service.ts"/>
///<reference path="../../typings/angularjs/angular.d.ts"/>
///<reference path="../cart/insite.cart.service.ts"/>

import OrderSettingsModel = Insite.Order.WebApi.V1.ApiModels.OrderSettingsModel;

module insite.quickorder {
    "use strict";

    export class QuickOrderPageController {

        products: ProductDto[];
        searchTerm: string;
        errorMessage: string;
        settings: ProductSettingsModel;
        orderSettings: OrderSettingsModel;
        autocompleteOptions: AutoCompleteOptions;

        public static $inject = [
            "$scope",
            "$window",
            "cartService",
            "productService",
            "searchService"];

        constructor(
            protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected cartService: cart.ICartService,
            protected productService: catalog.IProductService,
            protected searchService: catalog.ISearchService) {

            this.init();
        }
        
        init() {
            this.products = [];
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.productSettings;
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

            this.autocompleteOptions.select = function (evt) {
                var dataItem = this.dataItem(evt.item.index());
                that.addProduct(dataItem.name);
            }
        }

        onEnter(name: string) {
            var autocomplete = <any>$("#qo-search-view").data("kendoAutoComplete");
            if (autocomplete._last === kendo.keys.ENTER && autocomplete.listView.selectedDataItems().length === 0) {
                this.addProduct(this.searchTerm);
            }
        }

        // look up and add a product by extended name
        addProduct(name: string) {
            if (!name || name.length == 0) {
                return;
            }
            var parameter: insite.catalog.IProductCollectionParameters = { extendedNames: [name] };
            var expandParameter = ["pricing"];
            this.productService.getProductCollectionData(parameter, expandParameter).then(
                result => {
                    // TODO we may need to refresh the foundation tooltip, used to be insite.core.refreshFoundationUI
                    var product = result.products[0];
                    if (this.validateProduct(product)) {
                        product.qtyOrdered = 1;
                        (<any>product).uuid = this.getGuid(); // tack on a guid to use as an id for the quantity break pricing tooltip
                        this.products.push(product);
                        this.searchTerm = "";
                        this.errorMessage = "";
                    }
                },
                error => {
                    this.errorMessage = angular.element("#messageNotFound").val();
                });
        }

        // returns true if the product is allowed to be quick ordered
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

        changeUnitOfMeasure(product: ProductDto) {
            if (!product.productUnitOfMeasures) {
                return;
            }
            // this calls to get a new price and updates the product which updates the ui
            this.productService.changeUnitOfMeasure(product);
        }

        quantityInput(product: ProductDto) {
            this.productService.getProductPrice(product);
        }

        // add all lines to cart and redirect to cart page
        addAllToCart(redirectUrl: string) {
            this.cartService.addLineCollectionFromProducts(this.products).then(result => {
                this.$window.location.href = redirectUrl;
            });
        }

        allQtysIsValid() {
            return this.products.every((product: ProductDto) => {
                return product.qtyOrdered && parseFloat(product.qtyOrdered.toString()) > 0;
            });
        }

        removeProduct(product: ProductDto) {
            this.products.splice(this.products.indexOf(product), 1);
        }

        // returns the grand total of all lines prices, in the same currency format
        grandTotal() {
            var total = 0;
            var currencySymbol = "";
            var decimalSymbol = ".";
            angular.forEach(this.products, product => {
                if (!product.quoteRequired) {
                    var fullPrice = product.pricing.extendedActualPriceDisplay;
                    // this code assumes decimal/thousands separators are either , or .
                    decimalSymbol = fullPrice[fullPrice.length - 3];
                    currencySymbol = fullPrice.substring(0, 1);
                    if (decimalSymbol === ".") {
                        total += parseFloat(fullPrice.substring(1).replace(/,/g, ""));
                    } else {
                        total += parseFloat(fullPrice.substring(1).replace(/\./g, "").replace(",", "."));
                    }
                }
            });
            var formattedTotal = currencySymbol + total.toFixed(2);
            if (decimalSymbol === ".") {
                formattedTotal = formattedTotal.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
            } else {
                formattedTotal = formattedTotal.replace(".", ",");
                formattedTotal = formattedTotal.replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            }
            return formattedTotal;
        }

        getGuid() {
            var guidHolder = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
            var hex = "0123456789abcdef";
            var r = 0;
            var guidResponse = "";
            for (var i = 0; i < 36; i++) {
                if (guidHolder[i] !== "-" && guidHolder[i] !== "4") {
                    // each x and y needs to be random
                    r = Math.random() * 16 | 0;
                }

                if (guidHolder[i] === "x") {
                    guidResponse += hex[r];
                } else if (guidHolder[i] === "y") {
                    // clock-seq-and-reserved first hex is filtered and remaining hex values are random
                    r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??
                    r |= 0x8; // set pos 3 to 1 as 1???
                    guidResponse += hex[r];
                } else {
                    guidResponse += guidHolder[i];
                }
            }

            return guidResponse;
        }
    }

    angular
        .module("insite")
        .controller("QuickOrderPageController", QuickOrderPageController);
}
