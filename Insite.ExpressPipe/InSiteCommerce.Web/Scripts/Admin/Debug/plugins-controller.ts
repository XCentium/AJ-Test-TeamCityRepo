module insite_admin {
    "use strict";

    export class PluginsController {
        plugins: any[];
        isReady = false;
        sortProperty: string;
        isAsc = false;

        static $inject = ["$http"];

        constructor(protected $http: ng.IHttpService) {
            this.init();
        }

        init() {
            this.$http.get("/admin/debug/getplugins").then(result => {
                this.plugins = <any[]>result.data || [];
                this.isReady = true;
            });
        }

        sort(property: string) {
            if (this.sortProperty === property) {
                this.isAsc = !this.isAsc;
            } else {
                this.isAsc = true;
            }

            this.plugins.sort((a, b) => {
                if (a[property] === b[property]) {
                    return 0;
                }

                if (this.isAsc)
                    return (a[property] > b[property]) ? 1 : -1;
                else
                    return (a[property] < b[property]) ? 1 : -1;
            });

            this.sortProperty = property;
        }

        getSortClass(property: string) {
            if (property !== this.sortProperty) {
                return "";
            }

            return this.isAsc ? "st-sort-ascent" : "st-sort-descent";
        }
    }

    angular
        .module("insite-admin")
        .controller("PluginsController", PluginsController);
}