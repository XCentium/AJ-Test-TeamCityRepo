module insite_admin {
    "use strict";

    export interface ISpinnerService {
        register(api);
        show();
        hide();
    }

    export class SpinnerController {
        show: boolean;

        static $inject = ["spinnerService", "$rootScope"];

        constructor(
            protected spinnerService: ISpinnerService,
            protected $rootScope: ng.IRootScopeService
        ) {
            this.init();
        }

        init() {
            var api = {
                show: () => {
                    this.show = true;
                },
                hide: () => {
                    this.show = false;
                }
            };

            this.spinnerService.register(api);

            this.$rootScope.$on("$routeChangeStart", function() {
                api.show();
            });
            this.$rootScope.$on("$routeChangeSuccess", function() {
                api.hide();
            });
        }
    }

    export class SpinnerService implements ISpinnerService {
        api: any;

        register(api) {
            this.api = api;
        }

        show(): void {
            this.api.show();
        }

        hide(): void {
            this.api.hide();
        }
    }

    angular
        .module("insite-admin")
        .controller("SpinnerController", SpinnerController)
        .service("spinnerService", SpinnerService)
        .directive("isaSpinner", function() {
            return {
                restrict: "EAC",
                replace: true,
                transclude: true,
                controller: "SpinnerController",
                controllerAs: "spinnerCtrl",
                bindToController: true,
                templateUrl: "isa-spinner"
            }
        });

}