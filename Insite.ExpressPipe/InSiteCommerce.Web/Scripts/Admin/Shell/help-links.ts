module insite_admin {
    "use strict";

    export class HelpLinksController {
        links: Array<any>;

        static $inject = ["HelpLinksService", "$scope", "fingerTabsService", "$location"];

        constructor(
            protected helpLinksService: HelpLinksService,
            protected $scope: ng.IScope,
            protected fingerTabsService: FingerTabsService,
            protected $location: ng.ILocationService
        ) {
            this.init();
        }

        init() {
            this.$scope.$on("$locationChangeSuccess", (event, newUrl: string) => {
                this.fetchAndShowHelpLinks(newUrl);
            });
            this.$scope.$on("tabselected", () => {
                this.fetchAndShowHelpLinks(this.$location.absUrl());
            });
            this.fetchAndShowHelpLinks(this.$location.absUrl());
        }

        fetchAndShowHelpLinks(url: string) {
            url = url.toLowerCase();
            if (url.indexOf("/admin/") >= 0) {
                url = url.substr(url.indexOf("/admin/") + "/admin/".length);
                var parts = url.split('/');
                var entityId = parts.length === 3 ? parts[2] : null;
                url = parts[0] + "/" + (parts[1] ? parts[1] : "") + (entityId ? "/id" : "");
            }
            var tabLabel = this.fingerTabsService.getSelectedTabLabel(this.$location.path());
            var promise = this.helpLinksService.getLinks(url, tabLabel);
            promise.then(x => {
                this.links = x;
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("HelpLinksController", HelpLinksController)
        .directive("isaHelpLinks", () => {
            return {
                restrict: "E",
                controller: "HelpLinksController",
                controllerAs: "helpLinksCtrl",
                replace: true,
                scope: {
                },
                templateUrl: "helpMenuLinks",
                bindToController: true
            }
        });
}