import AutocompleteProductModel = Insite.Catalog.WebApi.V1.ApiModels.AutocompleteProductModel;
import ISessionService = insite.account.ISessionService;

module insite.catalog {

    "use strict";

    export class ProductSearchController {
        criteria: string;
        listenForData: boolean;
        products: AutocompleteProductModel[] = [];
        autocomplete: any;
        autocompleteOptions: AutoCompleteOptions;
        autocompleteType: string;
        translations: Array<any>;
        preventActions: boolean;

        public static $inject = [
            "$window",
            "$localStorage",
            "$scope",
            "$rootScope",
            "$compile",
            "$element",
            "$filter",
            "productService",
            "sessionService",
            "base64",
            "coreService",
            "searchService"
        ];

        constructor(
            protected $window: ng.IWindowService,
            protected $localStorage: core.IWindowStorage,
            protected $scope: ng.IScope,
            protected $rootScope: ng.IRootScopeService,
            protected $compile: ng.ICompileService,
            protected $element: any,
            protected $filter: ng.IFilterService,
            protected productService: IProductService,
            protected sessionService: ISessionService,
            protected base64: any,
            protected coreService: core.ICoreService,
            protected searchService: ISearchService) {

            this.init();
        }

        init() {
            this.criteria = this.coreService.getQueryStringParameter("criteria", true);

            this.initializeAutocomplete();
        }

        initializeAutocomplete() {
            var appliedOnce = false;
            var data = new Array();

            this.autocompleteOptions = {
                height: 600,
                filtering: evt => {
                    if (!appliedOnce) {
                        var list = this.getAutocomplete().list;
                        list.addClass("search-autocomplete-list");

                        list.prepend(this.$element.find(".search-history-label"));
                        list.append(this.$element.find(".clear-search-history"));

                        appliedOnce = true;
                    }
                    
                    if (!evt.filter.value) {
                        this.autocompleteType = AutocompleteTypes.searchHistory;
                    }
                    else if (evt.filter.value.length >= 3) {
                        this.autocompleteType = AutocompleteTypes.product;
                    }
                    else {
                        evt.preventDefault();
                        this.getAutocomplete().close();
                        return;
                    }

                    this.getAutocomplete().list.toggleClass("autocomplete-type-" + AutocompleteTypes.searchHistory, this.autocompleteType === AutocompleteTypes.searchHistory);
                    this.getAutocomplete().list.toggleClass("autocomplete-type-" + AutocompleteTypes.product, this.autocompleteType === AutocompleteTypes.product);
                },
                dataTextField: "title",
                dataSource: {
                    serverFiltering: true,
                    transport: {
                        read: (options) => {
                            data = new Array();
                            if (this.autocompleteType === AutocompleteTypes.searchHistory) {
                                data = this.searchService.getSearchHistory();
                                data.forEach((p: any) => p.type = "");

                                options.success(data);
                            } else {
                                this.searchService.autocompleteSearch(this.criteria).success(o => {
                                    var products = o.products;
                                    products.forEach((p: any) => p.type = AutocompleteTypes.product);

                                    var categories = o.categories;
                                    categories.forEach((p: any) => p.type = AutocompleteTypes.category);

                                    var content = o.content;
                                    content.forEach((p: any) => p.type = AutocompleteTypes.content);

                                    data = data.concat(categories, content, products);
                                    options.success(data);
                                }).error(options.error);
                            }
                        }
                    }
                },
                popup: {
                    position: "top left",
                    origin: "bottom left"
                },
                animation: false,
                template: suggestion => {
                    if (this.autocompleteType === AutocompleteTypes.searchHistory) {
                        return `<div class="group-${suggestion.type}">${suggestion.q}</div>`;
                    }

                    var pattern = `(${this.criteria.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")})`;

                    switch (suggestion.type) {
                        case AutocompleteTypes.category:
                            var parent = suggestion.subtitle ? "<span class='parent-category'>in " + suggestion.subtitle + "</span>" : "";
                            var title = suggestion.title.replace(new RegExp(pattern, "gi"), "<strong>$1<\/strong>");
                            return `<div class="group-${suggestion.type}"><span class="group-category__title">${title}</span>${parent}</div>`;
                        case AutocompleteTypes.content:
                            return `<div class="group-${suggestion.type}">${suggestion.title}</div>`;

                        default:
                            var shortDescription = suggestion.title.replace(new RegExp(pattern, "gi"), "<strong>$1<\/strong>");

                            var additionalInfo = "";

                            if (suggestion.title) {
                                var name = suggestion.name.replace(new RegExp(pattern, "gi"), "<strong>$1<\/strong>");
                                var nameLabel = this.getTranslation(suggestion.isNameCustomerOverride ? "customerPartNumber" : "partNumber") || "";
                                additionalInfo += `<span class='name'><span class='label'>${nameLabel}</span><span class='value'>${name}</span></span>`;
                            }

                            if (suggestion.manufacturerItemNumber) {
                                var manufacturerItemNumber = suggestion.manufacturerItemNumber.replace(new RegExp(pattern, "gi"), "<strong>$1<\/strong>");
                                var manufacturerItemNumberLabel = this.getTranslation("manufacturerItemNumber") || "";
                                additionalInfo += `<span class='manufacturer-item-number'><span class='label'>${manufacturerItemNumberLabel}</span><span class='value'>${manufacturerItemNumber}</span></span>`;
                            }

                            return `<div class="group-${suggestion.type}"><div class="image"><img src='${suggestion.image}' /></div><div><div class='shortDescription'>${shortDescription}</div>${additionalInfo}</div></div>`;
                    }
                },
                select: (evt: kendo.ui.AutoCompleteSelectEvent) => {
                    this.preventActions = true;

                    var dataItem = this.getAutocomplete().dataItem(evt.item.index(".k-item"));
                    if (!dataItem) {
                        evt.preventDefault();
                        return false;                       
                    }

                    if (this.autocompleteType === AutocompleteTypes.searchHistory) {
                        this.search(dataItem.q, dataItem.includeSuggestions);
                    } else {
                        window.location.href = dataItem.url;
                    }
                },
                dataBound: evt => {
                    if (this.autocompleteType === AutocompleteTypes.searchHistory) {
                        return;
                    }

                    var list = this.getAutocomplete().list;
                    var groupKeys = data.map(item => { return item.type; });

                    var leftColumn = $("<li>");
                    var leftColumnContainer = $("<ul>");
                    leftColumn.append(leftColumnContainer);

                    var rightColumn = $("<li class='products'>");
                    var rightColumnContainer = $("<ul>");
                    rightColumn.append(rightColumnContainer);

                    this.getAutocomplete().ul.append(leftColumn);
                    this.getAutocomplete().ul.append(rightColumn);

                    groupKeys = this.$filter("unique")(groupKeys);
                    groupKeys.forEach(groupKey => {
                        switch (groupKey) {
                            case AutocompleteTypes.category:
                            case AutocompleteTypes.content:
                                list.find(".group-" + groupKey).parent().each((index, item) => leftColumnContainer.append(item));
                                break;
                            case AutocompleteTypes.product:
                                list.find(".group-" + groupKey).parent().each((index, item) => rightColumnContainer.append(item));
                                break;
                        }

                        var translation = this.getTranslation(groupKey);
                        if (translation) {
                            list.find(".group-" + groupKey).eq(0).closest("li").before("<li class='header " + groupKey + "'>" + translation + "</li>");
                        }
                    });

                    var leftColumnChildrenCount = leftColumnContainer.find("li").length
                        , rightColumnChildrenCount = rightColumnContainer.find("li").length;

                    if (leftColumnChildrenCount === 0) {
                        leftColumn.remove();
                        rightColumn.addClass("products--full-width");
                    }
                    if (rightColumnChildrenCount === 0) {
                        rightColumn.remove();
                        leftColumn.addClass("products--full-width");
                    }

                    if (leftColumnChildrenCount > 0
                        && rightColumnChildrenCount > 0) {
                        this.getAutocomplete().popup.element.addClass("search-autocomplete-list--large");
                    } else {
                        this.getAutocomplete().popup.element.removeClass("search-autocomplete-list--large");
                    }

                    list.find(".header").on("click", () => {
                        return false;
                    });
                }
            };
        }

        onEnter() {
            if (this.getAutocomplete()._last === kendo.keys.ENTER && !this.preventActions) {
                this.search();
            }
        }

        getAutocomplete() {
            if (!this.autocomplete) {
                this.autocomplete = this.$element.find("input.isc-searchAutoComplete").data("kendoAutoComplete");
            }

            return this.autocomplete;
        }

        clearSearchHistory() {
            this.searchService.clearSearchHistory();
            this.autocomplete.close();
        }

        search(query?: string, includeSuggestions?: boolean) {
            var searchTerm = encodeURIComponent(query || this.criteria.trim());
            searchTerm = searchTerm.replace(/%2B|%23|%26/, ""); // ignore + # &

            if (!searchTerm) {
                this.preventActions = false;
                return;
            }

            var url = insiteMicrositeUriPrefix + "/search?criteria=" + searchTerm;
            if (includeSuggestions === false) {
                url += "&includeSuggestions=false";
            }     
            
            // Redirect directly to detail page if only one product is found in the autocomplete list
            if (this.products && this.products.length === 1) {
                url = this.products[0].productDetailUrl;
            }

            this.$window.location.href = url;
        }

        getTranslation(key: string): string {
            var translationMatches = this.translations.filter(item => item.key === key);
            if (translationMatches.length > 0) {
                return translationMatches[0].text;
            }

            return null;
        }
    }
    
    export class AutocompleteTypes {
        static searchHistory = "searchhistory";
        static product = "product";
        static category = "category";
        static content = "content";
    }

    angular
        .module("insite")
        .controller("ProductSearchController", ProductSearchController);
}

// Overriding kendo's autocomplete keydown event to allow support for our two column autocomplete
(<any>kendo.ui.AutoComplete.prototype)._keydown = function (e) {
    var that = this;
    var keys = kendo.keys;
    var itemSelector = "li.k-item";
    var ul = $(that.ul[0]);
    var key = e.keyCode;
    var focusClass = "k-state-focused";
    var items = <any>ul.find(itemSelector);

    var currentIndex = -1;
    items.each((idx, i) => {
        if ($(i).hasClass(focusClass)) {
            currentIndex = idx;
        }
    });

    var current = currentIndex >= 0 && currentIndex < items.length ? $(items[currentIndex]) : null;
    var visible = that.popup.visible();

    that._last = key;

    if (key === keys.DOWN) {
        if (visible) {
            if (current) {
                current.removeClass(focusClass);
            }

            if (currentIndex < 0) {
                current = items.first();
                current.addClass(focusClass);
            }
            else if (currentIndex < ((<any>items).length - 1)) {
                current = $(items[currentIndex + 1]);
                current.addClass(focusClass);
            }
        }
        e.preventDefault();
        return false;
    } else if (key === keys.UP) {
        if (visible) {
            if (current) {
                current.removeClass(focusClass);
            }

            if (currentIndex < 0) {
                current = items.last();
                current.addClass(focusClass);
            }
            else if (currentIndex > 0) {
                current = $(items[currentIndex - 1]);
                current.addClass(focusClass);
            }
        }
        e.preventDefault();
        return false;
    } else if (key === keys.ENTER || key === keys.TAB) {
        if (key === keys.ENTER && visible) {
            e.preventDefault();
        }

        if (visible && current) {
            if (that.trigger("select", { item: current })) {
                return;
            }

            this._select(current);
        }

        this._blur();
    } else if (key === keys.ESC) {
        if (that.popup.visible()) {
            e.preventDefault();
        }
        that.close();
    } else {
        that._search();
    }
}