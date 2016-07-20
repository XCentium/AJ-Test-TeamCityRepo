module insite.wishlist {
    "use strict";

    angular
        .module("insite")
        .directive("iscWishListView", ["coreService", coreService => {
        return {
            restrict: "E",
            replace: true, 
            templateUrl: coreService.getApiUri("/Directives/WishList/WishListView"),
            controller: "WishListController",
            controllerAs: "vm"
        };
    }]);
}