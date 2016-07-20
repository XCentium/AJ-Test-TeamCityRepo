module insite_admin {
    "use strict";

    export class WebsiteDropdownController {
        onChange: any;
        initialWebsiteId: string;
        allowEmptySelection: boolean;

        websites: { displayName: string; id: string }[];
        website: { displayName: string; id: string };

        static $inject = [
            "$http",
            "displayNameService"
        ];
        constructor(
            protected $http: ng.IHttpService,
            protected displayNameService: IDisplayNameService
        ) {
            if (typeof (this.allowEmptySelection) === "undefined") {
                this.allowEmptySelection = true;
            }

            var keys = this.displayNameService.getDisplayNameFormatKeys("websites");

            this.$http.get("/api/v1/admin/websites/?$orderby=name&$select=id," + keys.join(",")).success((result: any) => {
                this.websites = result.value.map((o) => { return { displayName: this.displayNameService.getDisplayNameFor("websites", o), id: o.id} });
                if (this.allowEmptySelection) {
                    this.websites.unshift({ displayName: "Select Website", id: null });
                }

                if (typeof(this.initialWebsiteId) !== "undefined") {
                    for (var x = 0; x < this.websites.length; x++) {
                        if (this.websites[x].id.toLowerCase() === this.initialWebsiteId) {
                            this.website = this.websites[x];
                        }
                    }
                } else {
                    this.website = this.websites[0];
                }

                
                this.websiteChanged(this.website);
            });
        }

        websiteChanged(website: any) {
            this.onChange({ websiteId: website.id});
        }
    }

    var websiteDropdownDirective: ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            restrict: "E",
            controller: "WebsiteDropdownController",
            controllerAs: "vm",
            scope: {
                onChange: "&",
                allowEmptySelection: "=",
                initialWebsiteId: "="
            },
            bindToController: true,
            template: "<select ng-model='vm.website' ng-options='option.displayName for option in vm.websites' ng-change='vm.websiteChanged(vm.website)'></select>"
        };
        return directive;
    }

    angular
        .module("insite-admin")
        .controller("WebsiteDropdownController", WebsiteDropdownController)
        .directive("isaWebsiteDropdown", websiteDropdownDirective);
}