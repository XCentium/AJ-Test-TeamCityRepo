var insite = insite || {};

insite.GoogleMap = function(mapId) {
    "use strict";

    this.map = null;
    this.mapId = mapId;
    this.locations = [];
    this.infowindow = new google.maps.InfoWindow({
        pixelOffset: new google.maps.Size(0, -30)
    });

    this.setupMap = function (lat, lng) {
        this.map = new google.maps.Map(document.getElementById(this.mapId), {
            zoom: 12,
            scrollwheel: false,
            center: new google.maps.LatLng(lat, lng)
        });
    }

    this.clearMarkers = function () {
        for (var i = 0; i < this.locations.length; i++) {
            this.locations[i].marker.setMap(null);
        }
        this.locations.length = 0;
    };

    this.setLocation = function (lat, lng) {
        if (this.map === null) {
            this.setupMap(lat, lng);
        } else {
            this.map.setCenter(new google.maps.LatLng(lat, lng));
        }
    };

    this.setHomeLocation = function (lat, lng) {
        if (this.map === null) {
            this.setupMap(lat, lng);
        }

        var latlong = new google.maps.LatLng(lat, lng);
        var richMarker = new RichMarker({ position: latlong, map: this.map, flat: true, content: "<span class='home-marker'></span>" });
        var location = { marker: richMarker };
        this.locations.push(location);
        this.map.setCenter(latlong);
    };

    this.addLocation = function (lat, lng, info, markerText) {
        if (this.map === null) {
            this.setupMap(lat, lng);
        }

        var latlong = new google.maps.LatLng(lat, lng);
        var richMarker = new RichMarker({position: latlong, map: this.map, flat: true, content: "<span class='loc-marker'><span>" + markerText + "</span></span>"});
        var location = { marker: richMarker, info: info };

        this.locations.push(location);
        if (location.info) {
            var map = this.map;
            var infowindow = this.infowindow;
            google.maps.event.addListener(location.marker, "click", function () {
                infowindow.setContent(location.info);
                infowindow.open(map, location.marker);
            });
        }

        this.map.setCenter(latlong);
    };

    this.zoomAndCenterMap = function () {
        if (this.map != null) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0, markersLength = this.locations.length; i < markersLength; i++) {
                bounds.extend(this.locations[i].marker.position);
            }

            // Extends the bounds when we have only one marker to prevent zooming in too far.
            if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.03, bounds.getNorthEast().lng() + 0.03);
                var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.03, bounds.getNorthEast().lng() - 0.03);
                bounds.extend(extendPoint1);
                bounds.extend(extendPoint2);
            }

            this.map.setCenter(bounds.getCenter());
            this.map.fitBounds(bounds);
        }
    }
};