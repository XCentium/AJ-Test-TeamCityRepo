module insite.dealers {
    import Marker = google.maps.Marker;
    "use strict";

    declare function RichMarker(options: any): void;

    export class MorscoDealerController extends DealerController {

        locationTypes = ["Plumbing", "Showroom", "Premier Showroom", "Appliances", "Hardware"];
        
        // fetches the dealers from the dealerService after the Google maps api is initialized. 
        initializeMap() {
            this.$scope.$on("mapInitialized",() => {
                this.dealerService.getDealer(this.coreService.getQueryStringParameter("dealerId", true)).then((dealerResult) => {
                    this.dealer = dealerResult;

					this.dealer.htmlContent = this.$sce.trustAsHtml(this.dealer.htmlContent);

                    this.dealer['productCategories'] = [];
                    if (this.dealer.properties['productCategories']) {
                        this.dealer['productCategories'] = this.dealer.properties['productCategories'].replace(/\s*,\s*/g, ",").split(',');
                    }
                    this.dealer['images'] = [];
                    if (this.dealer.properties['images']) {
                        this.dealer['images'] = this.dealer.properties['images'].replace(/\s*,\s*/g, ",").split(',');
                    }

                    var latlong = new google.maps.LatLng(this.dealer.latitude, this.dealer.longitude);

                    var richMarker = new RichMarker({ position: latlong, map: this.$scope.map, flat: true, draggable: false, content: "<span class=\"home-marker\"></span>" });

                    this.$scope.map.setCenter(latlong);

                    this.addressForDirections = dealerResult.address1 + " " + dealerResult.address2 + ", " + dealerResult.city + ", " + dealerResult.state + " " + dealerResult.postalCode;
                });
            });
        }

    }
    angular
        .module("insite")
        .controller("DealerController", MorscoDealerController)
        .filter('removeSpaces', [
        function () {
            return function (string) {
                if (!angular.isString(string)) {
                    return string;
                }
                return string.replace(/[\s]/g, '');
            };
        }
    ])
        .filter('createLabel', [
        function () {
            return function (string) {
                if (string === "Pipe-Valves-Fittings") {
                    return "PVF";
                } else if (string === "Oil and Gas") {
                    return "Oil & Gas";
                }
                return string;

            };
        }
    ]);
}    