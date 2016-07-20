module insite.catalog {

    "use strict";

    export class MorscoProductSearchController extends ProductSearchController {
        criteria: string;
        category: CategoryModel; // selected category if any
        categories: CategoryModel[] = [];
        listenForData: boolean;
        products: AutocompleteProductModel[] = [];
        transformResult: (response) => any;

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
            "searchService",
            "spinnerService"
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
            protected searchService: ISearchService,
            protected spinnerService: core.ISpinnerService) {
            super($window, $localStorage, $scope, $rootScope, $compile, $element, $filter, productService, sessionService, base64, coreService, searchService);

        }

        search(query?: string, includeSuggestions?: boolean) {
            var searchTerm = encodeURIComponent(query || this.criteria.trim());
            searchTerm = searchTerm.replace(/%2B|%23|%26/, ""); // ignore + # &

            if (!searchTerm) {
                this.preventActions = false;
                return;
            }

            this.spinnerService.show("mainLayout", true);
            super.search(query, includeSuggestions);
        }
    }

    angular
        .module("insite")
        .controller("ProductSearchController", MorscoProductSearchController);
} 