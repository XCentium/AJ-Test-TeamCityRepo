/// <reference path="../_typelite/insite.models.d.ts" />
/// <reference path="../../typings/google.maps/google.maps-plus.d.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
import DealerModel = Insite.Dealers.WebApi.V1.ApiModels.DealerModel;
import DealerCollectionModel = Insite.Dealers.WebApi.V1.ApiModels.DealerCollectionModel;

module insite.dealers {
    "use strict";
    
    export interface IDealerService {
        getGeoCodeFromLatLng(lat: number, lng: number): ng.IPromise<google.maps.GeocoderResult[]>;
        getGeoCode(addressSearch: string): ng.IPromise<IGeoCodingResult>;
        getGeoLocation(): ng.IPromise<google.maps.LatLng>;
        getDealerCollection(filter: IDealerFilter): ng.IPromise<DealerCollectionModel>;
        getDealer(dealerId: System.Guid): ng.IPromise<DealerModel>;
    }

    export interface IDealerFilter {
        name: string;
        radius?: number;
        latitude: number;
        longitude: number;
        startPage?: number;
        pageSize?: number;
    }

    export interface IGeoCodingResult {
        result: google.maps.GeocoderResult[];
        status: google.maps.GeocoderStatus;
    }

    export class DealerService implements IDealerService {

        serviceUri = "/api/v1/dealers";

        static $inject = ["$http", "$q"];

        constructor(protected $http: ng.IHttpService, protected $q: ng.IQService) {
        }

        getGeoCodeFromLatLng(lat: number, lng: number): ng.IPromise<google.maps.GeocoderResult[]> {
            var deferredGeo = this.$q.defer();
            var latlng: google.maps.LatLng = new google.maps.LatLng(lat, lng);
            var geocoder: google.maps.Geocoder = new google.maps.Geocoder();

            geocoder.geocode({ address: "", latLng : latlng }, deferredGeo.resolve);
            return deferredGeo.promise;
        }

        getGeoCode(addressSearch: string): ng.IPromise<IGeoCodingResult>{
            var deferredGeo = this.$q.defer();

            if (typeof addressSearch != "undefined") {
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: addressSearch },
                    (result: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => deferredGeo.resolve({
                        result: result,
                        status: status
                    }));
            }

            return deferredGeo.promise;
        }

        getGeoLocation(): ng.IPromise<google.maps.LatLng> {
            var deferredGeo = this.$q.defer();
            var response: google.maps.LatLng = new google.maps.LatLng (0, 0);

            // ok no geoCoder so grab the geolocation from the browser if available.
            if (!navigator.geolocation) {
                deferredGeo.resolve(response);
                return deferredGeo.promise;
            }

            var defaultLocationTimer = setTimeout(function() {
                deferredGeo.resolve(response);
            }, 250);

            navigator.geolocation.getCurrentPosition((position: Position) => {
                clearTimeout(defaultLocationTimer);
                response = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                deferredGeo.resolve(response);
            }, () => {
                clearTimeout(defaultLocationTimer);
                deferredGeo.resolve(response);
            });

            return deferredGeo.promise;
        }

        getDealerCollection(filter: IDealerFilter): ng.IPromise<DealerCollectionModel> {
            var deferred = this.$q.defer();
            var uri = this.serviceUri;
            // add filters
            if (filter) {
                uri += "?";
                for (var property in filter) {
                    if (filter.hasOwnProperty(property)) {
                        if (filter[property]) {
                            uri += property + "=" + filter[property] + "&";
                        }
                    }
                }
            }
            this.$http.get(uri)
                .success(function(result: DealerCollectionModel) {
                var latlng: google.maps.LatLng = new google.maps.LatLng(result.defaultLatitude, result.defaultLongitude);

                var geocoder: google.maps.Geocoder = new google.maps.Geocoder();

                    geocoder.geocode({ address: "", latLng: latlng }, function(geoResults, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            result.formattedAddress = geoResults[0].formatted_address;
                            return deferred.resolve(result);
                        }
                    });
                    //return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getDealer(dealerId: System.Guid): ng.IPromise<DealerModel> {
            var deferred = this.$q.defer();
            var uri = this.serviceUri + "/" + dealerId;
            this.$http.get(uri)
                .success(function (result: DealerModel) { 
                    var latlng = new google.maps.LatLng(result.latitude, result.longitude);
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: "", latLng: latlng }, function (geoResults, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            return deferred.resolve(result);
                        }
                        return deferred.reject(result);
                    });
                })
                .error(function (result, status, headers, config) {
                    return deferred.reject(status);
                });
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("dealerService", DealerService);
} 
