module insite_admin.formElements {
    "use strict";

    export class ProductStyleChildrenSelectorController {
        public initialModel: any;
        public model: any;

        serviceUri: string;

        static $inject = ["$http", "$scope"];

        constructor(protected $http: ng.IHttpService,
            protected $scope: ng.IScope) {
            this.init();
        }

        init() {
            this.serviceUri = `/api/v1/admin/`;
            if (!this.model.styleParentId) {
                this.$http.get(`${this.serviceUri}products(${this.model.id})?$expand=StyleChildren`)
                    .success((object: any) => {
                    });
            }
        }

    }

    angular
        .module("insite-admin")
        .controller("ProductStyleChildrenSelectorController", ProductStyleChildrenSelectorController)
        .directive("isaProductStyleChildrenSelector", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "ProductStyleChildrenSelector",
                controller: "ProductStyleChildrenSelectorController",
                controllerAs: "vm",
                bindToController: {
                    initialModel: "=",
                    model: "="
                },
                scope: {}
            }
        });

}