module insite_admin {
    "use strict";

    export class HomeController {
        static $inject = [
            "$location",
            "$window",
            "entityDefinitionService",
            "spinnerService",
            "FoundationApi",
            "$http",
            "websiteService",
            "$rootScope",
            "adminSessionService"
        ];

        constructor(
            protected $location: ng.ILocationService,
            protected $window: ng.IWindowService,
            protected entityDefinitionService: EntityDefinitionService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected $http: ng.IHttpService,
            protected websiteService: IWebsiteService,
            protected $rootScope: ng.IRootScopeService,
            protected adminSessionService: IAdminSessionService) {
            this.init();
        }

        actionName: string;
        definitionName: string;
        websitesList: any;
        insiteLinks: Array<any>;
        supportLinks: Array<any>;

        init() {
            this.loadWebsites();
            this.loadLinks();

        }

        loadLinks() {
            var insiteResourseRequestData = {
                url: "http://www.insitesoft.com/index.php/tools/required/resource_list?sortBy=newest&resourceType[]=Blog+Posts&resourceType[]=News"
            };
            var insiteSupportRequestData = {
                url: "https://support.insitesoft.com/api/v2/help_center/sections/201054499/articles.json?sort_by=updated_at&per_page=2"
            };

            this.$http.post("/admin/Proxy/GetInsiteResourseLinks", insiteResourseRequestData).then((result : any) => {
                this.insiteLinks = result.data.resources;
            });

            this.$http.post("/admin/Proxy/GetInsiteSupportLinks", insiteSupportRequestData).then((result: any) => {
                this.supportLinks = result.data.articles;
            });
        }

        openLink(location) {
            this.$location.url(location);
        }

        openExternalLink(location) {
            var win = this.$window.open(location, "_blank");
            win.focus();
        }

        openImportExportModal() {
            this.spinnerService.show();
            this.actionName = 'import';
            this.definitionName = 'products';
            this.$foundationApi.publish("importExportModal", "open");
            this.spinnerService.hide();
        }

        loadWebsites() {
            this.websiteService.loadWebsites().success((result: any) => {
                this.websitesList = result.value;
            });
        }

        openWebsite(website: any) {
            var currentDomainName = this.$location.host();
            var url = this.websiteService.getWebsiteUrl(website.domainName, currentDomainName);
            if (website.microSiteIdentifiers !== "") {
                 url += `/${website.microSiteIdentifiers}`;
            }

            this.$window.open(`${url}/ContentAdmin/Shell?frameUrl=/`);
        }

        createNewUser(): void {
            this.$rootScope.$broadcast("addNewUser");
        }

        contentEditorIsEnabled(): boolean {
            return this.adminSessionService.hasRole("ISC_ContentAdmin") ||
                this.adminSessionService.hasRole("ISC_ContentApprover") ||
                this.adminSessionService.hasRole("ISC_ContentEditor");
        }
    }

    angular
        .module("insite-admin")
        .controller("HomeController", HomeController)
        .directive("isaHome", <any>function () {
            return {
                restrict: "E",
                templateUrl: "home-page",
                controller: "HomeController",
                controllerAs: "vm",
                scope: {}
            };
        });
}