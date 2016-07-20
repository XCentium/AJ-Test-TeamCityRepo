import AutocompleteModel = Insite.Catalog.WebApi.V1.ApiModels.AutocompleteModel;
import AutoCompleteOptions = kendo.ui.AutoCompleteOptions;

module insite.catalog {
    "use strict";

    export interface ISearchService {
        addSearchHistory(query: string, limit?: number, includeSuggestions?: boolean): void;
        autocompleteSearch(query: string): ng.IHttpPromise<AutocompleteModel>;
        clearSearchHistory(): void;
        getSearchHistory(): Array<Object>;
        getProductAutocompleteOptions(query: Function): AutoCompleteOptions;
    }

    export class SearchService implements ISearchService {
       
        autocompleteServiceUri = this.coreService.getApiUri("/api/v1/autocomplete/");
        localStorage: core.IWindowStorage;
        searchHistoryCacheKey = "searchHistory";
        defaultSearchHistoryLimit = 10;
    
        constructor(protected $localStorage: core.IWindowStorage,
            protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {
            this.localStorage = $localStorage;
        }
        
        addSearchHistory(query: string, limit?: number, includeSuggestions?: boolean): void {
            if (!query || query.trim().length === 0) {
                return;
            }

            query = query.trim();

            var searchHistory = this.getSearchHistory();
            var queryIndex = searchHistory.map((e: any) => { return e.q; }).indexOf(query);
            if (queryIndex > -1) {
                searchHistory.splice(queryIndex, 1);
            }

            searchHistory.splice(0, 0, { q: query, includeSuggestions: includeSuggestions });
            searchHistory = searchHistory.splice(0, limit || this.defaultSearchHistoryLimit);

            this.localStorage.setObject(this.searchHistoryCacheKey, searchHistory);
        }

        clearSearchHistory(): void {
            this.localStorage.setObject(this.searchHistoryCacheKey, new Array());
        }

        getSearchHistory(): Array<Object> {
            return this.localStorage.getObject(this.searchHistoryCacheKey, new Array()).filter(item => typeof item === "object");
        }

        autocompleteSearch(query: string): ng.IHttpPromise<AutocompleteModel> {
            var request = this.autocompleteServiceUri;

            var queryString = this.coreService.parseParameters({
                q: encodeURIComponent(query)
            });

            if (queryString && queryString.length > 0) {
                request += `?${queryString}`;
            }

            return this.$http.get(request);
        }

        getProductAutocompleteOptions(query: Function): AutoCompleteOptions {
            return {
                height: 300,
                filtering: function(evt) {
                    if (!evt.filter.value || evt.filter.value.length < 3) {
                        evt.preventDefault();
                        this.close();
                    }
                },
                dataTextField: "value",
                dataSource: {
                    serverFiltering: true,
                    transport: {
                        read: (options) => {
                            this.$http({ method: "GET", url: this.autocompleteServiceUri + "?q=" + query(), bypassErrorInterceptor: true })
                                .success((result) => { options.success(result); });
                        }
                    },
                    schema: {
                        data: (response: AutocompleteModel) => {
                            var products = response.products;
                            var results = products.map(p => <any>{
                                id: p.id,
                                name: p.name,
                                image: p.image,
                                value: p.title
                            });

                            return results;
                        }
                    }
                },
                popup: {
                    position: "top left",
                    origin: "bottom left"
                },
                animation: {
                    open: {
                        effects: "slideIn:down"
                    }
                }
            }
        }
    }

    function factory(
        $localStorage: core.IWindowStorage,
        $http: ng.IHttpService, 
        coreService: core.ICoreService
    ): SearchService {
        return new SearchService($localStorage, $http, coreService);
    }
    factory.$inject = ["$localStorage", "$http", "coreService"];

    angular
        .module("insite")
        .factory("searchService", factory);
}