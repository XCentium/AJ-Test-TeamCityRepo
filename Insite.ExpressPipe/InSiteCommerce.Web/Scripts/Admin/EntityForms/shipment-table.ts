module insite_admin {
    "use strict";

    export class ShipmentTableController {
        webOrderNumber: string;
        erpOrderNumber: string;
        shipmentPackages: any[];

        static $inject = ["$scope", "$http"];

        constructor(protected $scope: ng.IScope, protected $http: ng.IHttpService) {
            this.shipmentPackages = [];

            this.$scope.$watch(() => this.webOrderNumber, (newValue) => {
                if (newValue !== "") {
                    this.loadShipmentPackages();
                }
            });

            this.$scope.$watch(() => this.erpOrderNumber, (newValue) => {
                if (newValue !== "") {
                    this.loadShipmentPackages();
                }
            });
        }

        loadShipmentPackages() {
            var filters = [];

            if (this.webOrderNumber) {
                filters.push(`webOrderNumber eq '${this.webOrderNumber}'`);
            }

            if (this.erpOrderNumber) {
                filters.push(`erpOrderNumber eq '${this.erpOrderNumber}'`);
            }

            if (filters.length > 0) {
                this.$http.get(`/api/v1/admin/shipments?$filter=${filters.join(" or ")}&$select=shipmentNumber,shipmentDate&$expand=shipmentPackages`).success((entities: any) => {
                    this.shipmentPackages = entities.value.reduce((prev, curr) => {
                        curr.shipmentPackages.map((shipmentPackage) => {
                            shipmentPackage.shipmentNumber = curr.shipmentNumber;
                            shipmentPackage.shipmentDate = curr.shipmentDate;
                        });
                        return prev.concat(curr.shipmentPackages);
                    }, []);
                });
            } else {
                this.shipmentPackages = [];
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("ShipmentTableController", ShipmentTableController)
        .directive("isaShipmentTable", () => <ng.IDirective>{
            restrict: "E",
            controller: "ShipmentTableController",
            controllerAs: "vm",
            replace: true,
            transclude: true,
            scope: {
                webOrderNumber: "@",
                erpOrderNumber: "@",
                shipmentPackages: "="
            },
            bindToController: true,
            templateUrl: "/admin/directives/ShipmentTable"
        });
}