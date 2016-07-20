module insite.dashboard {
    "use strict";

    export class DashboardMyListsController {
        wishListCollection: WishListModel[] = [];

        static $inject = ["$scope", "WishListService"];

        constructor(protected $scope: ng.IScope, protected wishListService: wishlist.WishListService) {
            this.init();
        }

        init() {
            this.wishListService.getWishListCollection().then((result) => {
                this.mapData(result);
            });
        }

        mapData(data: any): void {
            var wishListCount = data.wishListCollection.length;
            if (wishListCount > 0) {
                this.wishListCollection = data.wishListCollection;
            }
        }
    }

    angular
        .module("insite")
        .controller("DashboardMyListsController", DashboardMyListsController);
} 