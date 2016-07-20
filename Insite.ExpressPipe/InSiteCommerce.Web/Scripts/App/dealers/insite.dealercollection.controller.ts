module insite.dealers {
    "use strict";

    export interface MarkerOptions {
        position: google.maps.LatLng;
        map: google.maps.Map;
        flat: boolean;
        draggable: boolean;
        content: string;
    }

    declare var Foundation: any;
    declare function RichMarker(options: google.maps.MarkerOptions): void;

    export interface IDealersCollectionScope extends ng.IScope {
        map: google.maps.Map;
        dealerSearchForm: ng.IFormController;
    }

    export class DealerCollectionController {

        protected infoWindow: google.maps.InfoWindow;     // holds the text overlay for markers when clicked.
        protected markers: Array<any>; // Array<RichMarker>;  // holds the markers for the map

        addressSearchField: string;
        center: google.maps.LatLng;
        dealers: Array<DealerModel>;
        distanceUnitOfMeasure: number;
        locationKnown = true;
        pagination: PaginationModel;
        storeName: string;

        static $inject = [
            "$scope",
            "$q",
            "dealerService"
        ];

        constructor(
            protected $scope: IDealersCollectionScope,
            protected $q: ng.IQService,
            protected dealerService: IDealerService) {
            this.markers = new Array<any>();

            this.init();
        }

        init() {
            this.initializeMap();
            Foundation.libs.dropdown.settings.align = "top";
            Foundation.libs.dropdown.settings.is_hover = true;
        }

        // fetches the dealers from the dealerService checking for a search field.
        getDealers() {
            if (!this.$scope.dealerSearchForm.$valid) {
                return;
            }

            this.pagination.currentPage = 1;
            if ((typeof this.addressSearchField != "undefined") && (this.addressSearchField.trim())) {
                // resolve an address
                this.dealerService.getGeoCode(this.addressSearchField).then((geoCodingResult) => {
                    if (geoCodingResult.status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                        this.locationKnown = false;
                        return;
                    }

                    this.locationKnown = true;
                    var geoCodeResults = geoCodingResult.result;

                    if (typeof geoCodeResults[0].formatted_address != "undefined") {
                        // go ahead and make the input box nicer.
                        this.addressSearchField = geoCodeResults[0].formatted_address;
                    }
                    var coords: google.maps.LatLng = new google.maps.LatLng(
                        geoCodeResults[0].geometry.location.lat(),
                        geoCodeResults[0].geometry.location.lng());
                    this.dealerService.getDealerCollection(this.getFilter(coords)).then((result) => {
                        this.setMap(result);
                    });
                });
            } else {
                // get from the browser
                this.searchDealers();
            }
        }

        searchDealers() {
            this.getCoords().then(coords => {
                this.dealerService.getDealerCollection(this.getFilter(coords)).then((result) => {
                    this.setMap(result);
                });
            });
        }

        // retrieves the default geoLocation if one is not currently set
        getCoords(): ng.IPromise<google.maps.LatLng> {
            var deferred: ng.IDeferred<google.maps.LatLng> = this.$q.defer();

            if (this.center)
                deferred.resolve(this.center);
            else {
                this.dealerService.getGeoLocation().then(deferred.resolve);
            }

            return deferred.promise;
        }

        getFilter(coords: google.maps.LatLng) {
            this.center = coords;

            var filter: IDealerFilter = {
                name: this.storeName,
                latitude: coords.lat(),
                longitude: coords.lng()
            };
            if (this.pagination) {
                filter.pageSize = this.pagination.pageSize;
                filter.startPage = this.pagination.currentPage;
            }

            return filter;
        }

        // Creates the html for the marker pop-up 
        getMarkerPopupHtml(dealer: DealerModel) {
            var dealerInfo = "<div class='dealer-win'><div class='dealer-deetz'><div class='dealer-name'><a href='/DealerLocator/Dealer?dealerId=" + dealer.id + "'>" +
                dealer.name + "</a></div><div class='dealer-addy'>" + dealer.address1 + "<br />";

            if (dealer.address2) {
                dealerInfo += dealer.address2 + "<br />";
            }

            dealerInfo += dealer.city + ", " + dealer.state + " " + dealer.postalCode + "<br />" + dealer.phone + "</div>";

            if (dealer.htmlContent) {//TODO: this works in IE11 differently then in chrome or ff. Fix it?
                dealerInfo += "<div class='dealer-hours-map'><h4>Hours</h4><div>" + dealer.htmlContent + "</div></div>";
            }

            dealerInfo += "<a href='http://maps.google.com/maps?daddr=" + dealer.address1 + " " + dealer.address2 + ", " + dealer.city + ", "
            + dealer.state + " " + dealer.postalCode + "' class='dealer-directions'>Directions</a>";

            if (dealer.webSiteUrl) {
                dealerInfo += "<span><a href='" + dealer.webSiteUrl + "' class='dealer-www' target='_blank'>Website</a></span>";
            }

            if (dealer.distanceUnitOfMeasure === "Imperial") {
                dealerInfo += "<span class='dealer-distance miles'>" + (dealer.distance).toFixed(2) + " mi</span>";
            } else {
                dealerInfo += "<span class='dealer-distance kilometers'>" + (dealer.distance * 1.60934).toFixed(2) + " km</span>";
            }

            dealerInfo += "</div></div></div>";

            return dealerInfo;
        }

        // fetches the dealers from the dealerService after the Google maps api is initialized. 
        initializeMap() {
            this.$scope.$on("mapInitialized",() => { this.searchDealers(); });
        }

        // Adds the current location with special marker to the map. It's important that setHomeLocation is called before setMarkers 
        // in order to clear any existing markers from the map.
        setHomeLocation(address: string) {
            for (var m = 0; m < this.markers.length; m++) {
                this.markers[m].setMap(null);
            }
            var latlong = new google.maps.LatLng(this.center.lat(), this.center.lng());
            var markerOption: MarkerOptions = {
                position: latlong,
                map: this.$scope.map,
                flat: true,
                draggable: false,
                content: "<span class='home-marker'></span>"
            };

            var richMarker = new RichMarker(markerOption);
            google.maps.event.addListener(richMarker, "click",() => {
                if (this.infoWindow) {
                    this.infoWindow.close();
                }
                this.infoWindow = new google.maps.InfoWindow();
                this.infoWindow.setContent("Your current location.<br/>" + address);
                this.infoWindow.open(this.$scope.map, richMarker);
            });

            this.markers.push(richMarker);
        }

        // sets home/store markers, updates pagination and centers the map.
        setMap(result: DealerCollectionModel) {
            if ((typeof this.center === "undefined") || (this.center && this.center.lat() === 0 && this.center.lng() === 0)) {
                // this is the default lat lng
                this.center = new google.maps.LatLng(result.defaultLatitude, result.defaultLongitude);
            }

            this.pagination = result.pagination;
            this.$scope.map.setCenter(this.center);
            this.setHomeLocation(result.formattedAddress);
            var currentMarkers = this.setMarkers(result.dealers);
            this.addressSearchField = result.formattedAddress;
            this.dealers = result.dealers;
            this.distanceUnitOfMeasure = result.distanceUnitOfMeasure === "Metric" ? 1 : 0;
            this.fitBounds(currentMarkers);
        }


        // Creates the RichMarkers and generates the html for the marker pop-up
        setMarkers(dealers: Array<DealerModel>): Array<any> {
            var markers = new Array<any>();
            dealers.forEach((dealer, i) => {

                var markerOptions: MarkerOptions = {
                    position: new google.maps.LatLng(dealer.latitude, dealer.longitude),
                    map: this.$scope.map,
                    flat: true,
                    draggable: false,
                    content: "<span class='loc-marker'><span>" + this.getDealerNumber(i) + "</span></span>"
                };

                var richMarker = new RichMarker(markerOptions);
                google.maps.event.addListener(richMarker, "click",() => {
                    if (this.infoWindow) {
                        this.infoWindow.close();
                    }
                    this.infoWindow = new google.maps.InfoWindow();
                    this.infoWindow.setContent(this.getMarkerPopupHtml(dealer));
                    this.infoWindow.open(this.$scope.map, richMarker);
                });
                markers.push(richMarker);
                this.markers.push(richMarker);
            });
            return markers;
        }

        getDealerNumber(index: number): number {
            return index + 1 + (this.pagination.pageSize * (this.pagination.currentPage - 1));
        }

        fitBounds(currentMarkers: Array<any>): void {
            if (this.$scope.map != null) {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0, markersLength = currentMarkers.length; i < markersLength; i++) {
                    bounds.extend(currentMarkers[i].position);
                }

                // Extends the bounds when we have only one marker to prevent zooming in too far.
                if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                    var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.03, bounds.getNorthEast().lng() + 0.03);
                    var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.03, bounds.getNorthEast().lng() - 0.03);
                    bounds.extend(extendPoint1);
                    bounds.extend(extendPoint2);
                }

                if (bounds.getCenter().lat() === 0 && bounds.getCenter().lng() === -180) {
                    return;
                }

                this.$scope.map.setCenter(bounds.getCenter());
                this.$scope.map.fitBounds(bounds);
            }
        }

        openHours($event): void {
            $event.preventDefault();
        }
    }

    angular
        .module("insite")
        .controller("DealerCollectionController", DealerCollectionController);
}  