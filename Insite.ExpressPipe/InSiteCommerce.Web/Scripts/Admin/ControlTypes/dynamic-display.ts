module insite_admin {
    "use strict";

    export class DynamicDisplayController {
        displayValue: string;
        keyValue: string;
        route: string;
        filter: string;
        key: string;
        display: string;

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

            this.$scope.$watch("dynamicDisplayCtrl.keyValue", () => {
                this.loadDisplay();
            });
        }

        loadDisplay(): void {
            if (!this.keyValue) {
                this.displayValue = "";
                return;
            }

            var isKeyValueGuid = this.displayNameService.isGuid(this.keyValue);
            // prevent request when key is Guid but value is not Guid
            if (this.key.toLowerCase().slice(this.key.length - 2) === "id" && !isKeyValueGuid) {
                this.displayValue = this.keyValue;
                return;
            }

            var filter = "$filter=";

            filter += isKeyValueGuid ? `${this.key} eq ${this.keyValue}` : `${this.key} eq '${this.keyValue}'`;
            var uri = `${this.route}${this.route.indexOf("?") === -1 ? "?" : ""}&${filter}`;

            if (uri.match("{")) {
                this.displayValue = this.keyValue;
            } else {
                this.displayNameService.getDisplayNameForDynamic(uri, this.key, this.display).then(o => {
                    this.displayValue = o ? o.name : "";
                });
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("DynamicDisplayController", DynamicDisplayController)
        .directive("isaDynamicDisplay", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "DynamicDisplayController",
                controllerAs: "dynamicDisplayCtrl",
                scope: {},
                bindToController: {
                    route: "@",
                    filter: "@",
                    key: "@",
                    display: "@",
                    keyValue: "@"
                },
                template: "<span>{{dynamicDisplayCtrl.displayValue}}</span>"
            }
        });

}