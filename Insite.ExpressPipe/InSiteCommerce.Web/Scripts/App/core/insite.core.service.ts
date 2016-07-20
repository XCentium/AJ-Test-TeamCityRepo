module insite.core {
    "use strict";

    export interface ICoreService {
        getSettings(isAuthenticated?: boolean): ng.IHttpPromise<any>;
        parseParameters(parameters: {}): string;
        getObjectByPropertyValue<T>(values: T[], expr: {}): T;
        openWishListPopup(products: ProductDto[], popupId?: string): void;
        broadcastSettings(settings: any): void;
        queryString(a: string[]): { [key: string]: string; };
        getQueryStringParameter(key: string, ignoreCase?: boolean);
        getQueryStringCollection(): { [key: string]: string; } ;
        closeModal(selector: string): void;
        displayModal(html: any): void;
        getApiUri(uri: string): string;
        refreshUiBindings(): void;
    }

    export class CoreService implements ICoreService {

        webApiRoot = null;
        settingsUri = this.getApiUri("/api/v1/settings");

        static $inject = ["$rootScope", "$http", "$q", "$filter", "$window"];

        constructor(protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected $filter: ng.IFilterService,
            protected $window: ng.IWindowService) {
        }

        getSettings(isAuthenticated = false): ng.IHttpPromise<any> {
            return this.$http.get(this.settingsUri + "?auth=" + isAuthenticated.toString());
        }

        // turns an object into a "&" separated list of url key values
        parseParameters(parameters: { [key: string]: any }): string {
            var query = "";
            for (var property in parameters) {
                if (parameters.hasOwnProperty(property)) {
                    if (parameters[property] && parameters[property].constructor === Array) {
                        angular.forEach(parameters[property], value => {
                            query += property + "=" + value + "&";
                        });
                    } else if (parameters[property]) {
                        query += property + "=" + parameters[property] + "&";
                    }
                }
            }
            return query;
        }

        getApiUri(uri: string): string {
            if (this.webApiRoot === null) {
                this.webApiRoot = $("body").attr("data-webApiRoot");
                if (typeof (this.webApiRoot) === "undefined") {
                    this.webApiRoot = "";
                }             }
            return this.webApiRoot + uri;
        }

        //example: coreService.getObjectByPropertyValue(section.options, { selected: "true" })        
        getObjectByPropertyValue<T>(values: T[], expr: {}): T {
            var filteredFields = this.$filter("filter")(values, expr);
            return filteredFields ? filteredFields[0] : null;
        }

        openWishListPopup(products: ProductDto[], popupId?: string): void {
            // send the product to the addWishlistPopup directive controller
            this.$rootScope.$broadcast("addToWishList", { products: products, popupId: popupId });
        }

        broadcastSettings(settings: any): void {
            // send the settings to the pages that need it 
            this.$rootScope.$broadcast("settingsLoaded", settings);
        }

        queryString(a: string[]): {[key:string]:string;} {
            if (!a) return {};
            var b: { [key: string]: string; } = {};
            for (var i = 0; i < a.length; ++i) {
                var p = a[i].split("=");
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        }

        getQueryStringParameter(key: string, ignoreCase?: boolean) {
            key = key.toLowerCase().replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + key + "=([^&#]*)", ignoreCase ? "i" : undefined)
                , results = regex.exec(location.search.toLowerCase());
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        getQueryStringCollection(): { [key: string]: string; }  {
            return this.queryString(this.$window.location.search.substr(1).split("&"));
        }

        closeModal(selector: string): void {
            var modal = angular.element(selector);
            (<any>modal).foundation("reveal", "close");
        }

        displayModal(html: any): void {
            var $html = $(html);
            if ($html.parents("body").length === 0) {
                $html.appendTo($("body"));
            }

            (<any>$html).foundation("reveal", "open");
            $(document).on("closed", $html, function () {
                // TODO only remove if we added it?
                //$html.remove();
                // TODO
                //if (typeof onClose === "function") {
                //    onClose();
                //}
            });
        }

        refreshUiBindings(): void {
            (<any>$(document)).foundation({ bindings: "events" });
        }
    }

    angular
        .module("insite")
        .service("coreService", CoreService)
        .filter("trusted", ['$sce', $sce => val => $sce.trustAsHtml(val)])
        .filter("escape", ["$window", $window => $window.encodeURIComponent]);
}

