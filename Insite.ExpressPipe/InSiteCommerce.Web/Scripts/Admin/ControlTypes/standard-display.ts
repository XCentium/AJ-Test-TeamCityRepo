module insite_admin {
    "use strict";

    export class StandardDisplayController {
        listOptions: any;
        entityId: string;
        displayValue: string;

        static $inject = ["$scope"];

        constructor(
            protected $scope: ng.IScope
        ) {
            this.init();
        }

        init() {
            this.$scope.$watch("standardDisplayCtrl.entityId", () => {
                this.loadDisplay();
            });
        }

        loadDisplay(): void {
            if (this.entityId) {
                this.displayValue = this.entityId;
                var listOptions = this.listOptions.split("||");
                for (var x = 0; x < listOptions.length; x++) {
                    var parts = listOptions[x].split("|");
                    if (parts.length > 1 && this.entityId === parts[1]) {
                        this.displayValue = parts[0];
                    }
                }
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("StandardDisplayController", StandardDisplayController)
        .directive("isaStandardDisplay", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "StandardDisplayController",
                controllerAs: "standardDisplayCtrl",
                scope: {},
                bindToController: {
                    listOptions: "@",
                    entityId: "@"
                },
                template: "<span>{{standardDisplayCtrl.displayValue}}</span>"
            }
        });
}