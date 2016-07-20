module insite_admin.formElements {
    "use strict";

    export class DealerGeolocatorController {
        model: any;
        entityDefinition: any;

        static $inject = ["$http"];

        constructor(protected $http: ng.IHttpService) {
            
        }

        click(): void {
            var address = `${this.model.city} ${this.model.address1} ${this.model.address2} ${this.model.postalCode} ${this.model.state} ${this.model.phone}`;

            this.$http.post("/admin/Geocoder/geocodeAddress", {address : address}).success((result: any) => {
                this.model.latitude = result.Latitude;
                this.model.longitude = result.Longitude;
            });
        }
        
        shouldDisplay(): boolean {
            if (typeof (this.entityDefinition) !== "undefined") {
                var coordinates = this.entityDefinition.properties.filter(item =>
                    item.name === 'latitude' || item.name === 'longitude');
                return coordinates[0].canEdit && coordinates[1].canEdit;    
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("DealerGeolocatorController", DealerGeolocatorController)
        .directive("isaDealerGeolocator", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                template: `<button class="button secondary" ng-click="vm.click()" ng-show="vm.shouldDisplay()">Geolocator</button>`,
                controller: "DealerGeolocatorController",
                controllerAs: "vm",
                bindToController: {
                    model: "=",
                    entityDefinition: "="
                },
                scope: {}
            }
        });

}