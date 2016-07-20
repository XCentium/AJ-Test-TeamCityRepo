module insite.dealers {
    "use strict";

    export interface IDealersDirectionsScope extends ng.IScope {
        map: google.maps.Map;
    }

    export class DealerDirectionsController {

        protected geoOrigins: google.maps.LatLng;
        protected geoDestination: google.maps.LatLng;
        protected directionsService: google.maps.DirectionsService;
        protected directionsDisplay: google.maps.DirectionsRenderer;

        addressSearchField: string;
        dealer: DealerModel;
        directions: any;
        notFound: boolean;

        static $inject = [
            "$scope",
            "dealerService",
            "coreService",
            "$sce"
        ];

        constructor(
            protected $scope: IDealersDirectionsScope,
            protected dealerService: IDealerService,
            protected coreService: core.ICoreService,
            protected $sce: ng.ISCEService) {

            this.init();
        }

        init() {
            this.initializeMap();
        }

        setOrigin(geoResult: google.maps.LatLng) {
            this.geoOrigins = geoResult;
            this.$scope.map.setCenter(this.geoOrigins);

            this.dealerService.getGeoCodeFromLatLng(geoResult.lat(), geoResult.lng()).then((result: google.maps.GeocoderResult[]) => {
                    this.addressSearchField = result[0].formatted_address;
                },() => {
                    // if it errors out, just put the lat/lng in 
                    this.addressSearchField = geoResult.lat() + ", " + geoResult.lng();
                });
        }

        setDestination(dealerResult: DealerModel) {
            try {
                this.geoDestination = new google.maps.LatLng(dealerResult.latitude, dealerResult.longitude);
                var unitSystem: google.maps.UnitSystem;

                if (dealerResult.distanceUnitOfMeasure === "Imperial") {
                    unitSystem = google.maps.UnitSystem.IMPERIAL;
                } else {
                    unitSystem = google.maps.UnitSystem.METRIC;
                }

                var request = {
                    origin: this.geoOrigins,
                    destination: this.geoDestination,
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: unitSystem,
                    durationInTraffic: true
                };

                this.directionsService = new google.maps.DirectionsService();

                this.directionsService.route(request,(response, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        this.directionsDisplay.setDirections(response);
                    }
                });
            } catch (e) {
            }
        }

        // fetches the dealers from the dealerService after the Google maps api is initialized. 
        initializeMap() {
            this.$scope.$on("mapInitialized",() => {

                this.dealerService.getGeoLocation().then((geoResults) => {
                    this.setOrigin(geoResults);
                    // get the dealer
                    this.dealerService.getDealer(this.coreService.getQueryStringParameter("dealerId", true)).then((dealerResult) => {
                        this.dealer = dealerResult;
                        this.dealer.htmlContent = this.$sce.trustAsHtml(this.dealer.htmlContent);

                        this.directionsDisplay = new google.maps.DirectionsRenderer(null);
                        this.directionsDisplay.setMap(this.$scope.map);
                        this.directionsDisplay.setPanel(document.getElementById("directionsPanel"));

                        google.maps.event.addListener(this.directionsDisplay, "directions_changed",() => {
                            this.directions = this.directionsDisplay.getDirections();
                            // $scope.computeTotalDistance(directionsDisplay.getDirections(), dealerResult);
                        });
                        this.setDestination(dealerResult);
                    }, (dealerResult) => {
                        if (dealerResult === 404) {
                            this.notFound = true;
                        }
                    });
                });
            });
        }

    } angular
        .module("insite")
        .controller("DealerDirectionsController", DealerDirectionsController);
}   