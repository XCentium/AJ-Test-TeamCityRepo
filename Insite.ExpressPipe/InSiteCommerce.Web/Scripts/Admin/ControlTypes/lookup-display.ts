module insite_admin {
    "use strict";

    export class LookupDisplayController {
        displayValue: string;
        pluralizedEntityName: string;
        entityId: string;

        static $inject = ["displayNameService", "$http", "$scope"];

        constructor(
            protected displayNameService: IDisplayNameService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope

        ) {
            this.init();
        }

        init() {
            this.loadDisplay();

            this.$scope.$watch("lookupDisplayCtrl.entityId", () => {
                this.loadDisplay();
            });
        }

        loadDisplay(): void {
            if (this.entityId !== "") {
                this.displayNameService.getDisplayNameForLookup(this.pluralizedEntityName, this.entityId).then((model: any) => {
                    this.displayValue = this.displayNameService.getDisplayNameFor(this.pluralizedEntityName, model);
                });
            } else {
                this.displayValue = "";
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("LookupDisplayController", LookupDisplayController)
        .directive("isaLookupDisplay", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "LookupDisplayController",
                controllerAs: "lookupDisplayCtrl",
                scope: {},
                bindToController: {
                    pluralizedEntityName: "@",
                    entityId: "@"
                },
                template: "<span>{{lookupDisplayCtrl.displayValue}}</span>"
            }
        });

}