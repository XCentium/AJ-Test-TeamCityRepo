module insite_admin {
    "use strict";

    export class OrderHistoryProductImageController {
        productErpNumber: string;
        imagePath: string;

        static $inject = ["$scope", "$http"];

        constructor(protected $scope: ng.IScope, protected $http: ng.IHttpService) {
            this.$http.get(`/api/v1/admin/products?$filter=erpNumber eq '${this.productErpNumber}'&$select=smallImagePath`).success((products: any) => {
                if (products.value.length > 0) {
                    this.imagePath = products.value[0].smallImagePath;
                }
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("OrderHistoryProductImageController", OrderHistoryProductImageController)
        .directive("isaOrderHistoryProductImage", () => <ng.IDirective>{
            restrict: "E",
            controller: "OrderHistoryProductImageController",
            controllerAs: "vm",
            scope: { productErpNumber: "@" },
            bindToController: true,
            template: "<div class='productimage' ng-if='vm.imagePath'>" +
                        "<img ng-src='{{vm.imagePath}}' style='max-width: 45px; max-height: 45px;' />" +
                      "</div>"
        });
}