module insite.wishlist {
    "use strict";

    angular
        .module("insite")
        .directive("iscAddWishlistPopup", ["sessionService", "coreService", (sessionService, coreService) => {
        return {
            restrict: "E",
            replace: true,
            scope: {
                popupId: "@"
            },
            templateUrl: coreService.getApiUri("/Directives/WishList/AddWishListPopup"),
            link: $scope => {
                $scope.isAuthenticated = sessionService.isAuthenticated();
            },
            controller: "WishListPopupController", 
            controllerAs: "vm",
            bindToController: true
        };
    }]);
}
