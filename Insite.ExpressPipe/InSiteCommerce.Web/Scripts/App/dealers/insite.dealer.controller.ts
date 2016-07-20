module insite.dealers {
    import Marker = google.maps.Marker;
    "use strict";

    export interface IDealersScope extends ng.IScope {
        map: google.maps.Map;
    }

    declare function RichMarker(options: any): void;

    export class DealerController {

        dealer: DealerModel;
        notFound: boolean;
        addressForDirections: string;

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

        // fetches the dealers from the dealerService after the Google maps api is initialized. 
        initializeMap() {
            this.$scope.$on("mapInitialized",() => {
                this.dealerService.getDealer(this.coreService.getQueryStringParameter("dealerId", true)).then((dealerResult) => {
                    this.dealer = dealerResult;

                    this.dealer.htmlContent = this.$sce.trustAsHtml(this.dealer.htmlContent);
                    
                    var latlong = new google.maps.LatLng(this.dealer.latitude, this.dealer.longitude);

                    var richMarker = new RichMarker({ position: latlong, map: this.$scope.map, flat: true, draggable: false, content: "<span class=\"home-marker\"></span>" });

                    this.$scope.map.setCenter(latlong);

                    this.addressForDirections = dealerResult.address1 + " " + dealerResult.address2 + ", " + dealerResult.city + ", " + dealerResult.state + " " + dealerResult.postalCode;
                });
            });
        }

    } angular
        .module("insite")
        .controller("DealerController", DealerController);
}   