module insite.dealers {
    "use strict";

    declare function RichMarker(options: google.maps.MarkerOptions): void;

    export class MorscoDealerCollectionController extends DealerCollectionController {
        radius: number = 10000;
        locationType: string;

        radii = [
            { 'distance': 10000, 'label': "Within all " },
            { 'distance': 10, 'label': "Within 10 " },
            { 'distance': 25, 'label': "Within 25 " },
            { 'distance': 50, 'label': "Within 50 " }
        ];
        locationTypes = ["Plumbing", "Showroom", "Premier Showroom", "Appliances", "Hardware"];

        static $inject = [
            "$scope",
            "$q",
            "dealerService",
            "spinnerService"
        ];

        constructor(
            protected $scope: IDealersCollectionScope,
            protected $q: ng.IQService,
            protected dealerService: IDealerService,
            protected spinnerService: core.ISpinnerService) {
            super($scope, $q, dealerService);
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
                    this.spinnerService.show("mainLayout", false);
                    this.getDealerCollection(coords);
                });
            } else {
                // get from the browser
                this.searchDealers();
            }
        }

        searchDealers() {
            this.getCoords().then(coords => {
                this.spinnerService.show("mainLayout", false);
                this.getDealerCollection(coords);
            });

        }

        getDealerCollection(coords: google.maps.LatLng) {
            this.dealerService.getDealerCollection(this.getFilter(coords)).then((result) => {
                result.dealers.forEach((dealer, i) => {
                    if (dealer.properties['productCategories']) {
                        dealer['productCategories'] = dealer.properties['productCategories'].replace(/\s*,\s*/g, ",").split(',');
                    }
                    if (dealer.properties['images']) {
                        dealer['images'] = dealer.properties['images'].replace(/\s*,\s*/g, ",").split(',');
                    }
                });
                if (this.$scope.map) {
                    this.setMap(result);
                } else {
                    this.dealers = result.dealers;
                    setTimeout(function() {
                        $(".slide-number").find('span:first').html("1");
                        $(".slide-number").find('span:last').html($(".slides").length.toString());
                        $(document).foundation('orbit', 'reflow');
                    }, 1000);
                }
                this.spinnerService.hide("mainLayout");
            });
            
        }

        initializeMap() {
            var params = this.getUrlVars();
            if (params["type"]) {
                this.locationType = params["type"];
            }
            if (this.$scope.map) {
                super.initializeMap();
            } else {
                this.searchDealers();
            }
            
        }

        getUrlVars() {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }


        getFilter(coords: google.maps.LatLng) {
            this.center = coords;

            if (this.locationType != null) {
                var ltype = this.locationType.replace(new RegExp(" ", "g"), "");
            }

            var filter: IDealerFilter = {
                name: this.storeName,
                latitude: coords.lat(),
                longitude: coords.lng(),
                radius: this.radius
            };

            filter["category"] = ltype;

            if (this.pagination) {
                filter.pageSize = this.pagination.pageSize;
                filter.startPage = this.pagination.currentPage;
            } else if (!this.$scope.map) {
                //Get upto 100 dealers for locations widget
                filter.pageSize = 100;
                filter.startPage = 1;
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
                + dealer.state + " " + dealer.postalCode + "' class='dealer-directions' target='_blank'>Directions</a>";

            if (dealer.webSiteUrl) {
                dealerInfo += "<span><a href='" + dealer.webSiteUrl + "' class='dealer-www' target='_blank'>Website</a></span>";
            }

            dealerInfo += "<span class='dealer-distance miles'>" + (dealer.distance).toFixed(2) + " mi</span>";

            dealerInfo += "</div></div></div>";

            return dealerInfo;
        }
    }

    angular
        .module("insite")
        .controller("DealerCollectionController", MorscoDealerCollectionController)
        .filter('removeSpaces', [
            function () {
                return function (string) {
                    if (!angular.isString(string)) {
                        return string;
                    }
                    return string.replace(/[\s\&\.]/g, '');
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
