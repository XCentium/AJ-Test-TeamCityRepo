module insite.wishlist {
    "use strict";

    export class MorscoWishListPopupController extends WishListPopupController {

        errorMessage: string;
        newWishListName: string;
        selectedWishList: WishListModel;
        successMessage: boolean;
        wishListCollection: WishListModel[];
        wishlistNameErrorMessage: boolean;
        wishListSettings: WishListSettingsModel;
        popupId: string;
        productsToAdd: ProductDto[]; // products being added as a collection

        static $inject = [
            "$scope",
            "WishListService",
            "coreService",
			"spinnerService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected wishListService: IWishListService,
            protected coreService: core.ICoreService,
			protected spinnerService: core.ISpinnerService) {

            super($scope, wishListService, coreService);
        }

        addLineToWishList(wishList: WishListModel) {
            var self = this;
            this.wishListService.addWishListLine(wishList, this.productsToAdd[0]).then(() => {
                this.successMessage = true;
                this.spinnerService.hide();
                setTimeout(function () {
                    self.coreService.closeModal('#popup-add-wishlist');
                }, 3000);
            }, error => {
					this.errorMessage = error.message;
					this.spinnerService.hide();
				});
        }

        addLineCollectionToWishList(wishList: WishListModel) {
            var self = this;
            this.wishListService.addWishListLineCollection(wishList, this.productsToAdd).then(() => {
                this.successMessage = true;
                this.spinnerService.hide();
                setTimeout(function () {
                    self.coreService.closeModal('#popup-add-wishlist');
                }, 3000);
            }, error => {
					this.errorMessage = error.message;
					this.spinnerService.hide();
				});
        }

        addToWishList() {
            window.console.log('add to wish list');
            window.console.log(this.successMessage);
            this.clearMessages();
			//this.spinnerService.show("mainLayout", true);
            if (this.selectedWishList) {
                this.addProductsToWishList(this.selectedWishList);
            }
            else {
                if (this.newWishListName && this.newWishListName.trim().length > 0) {
                    this.addWishList(this.newWishListName);
                } else {
                    this.wishlistNameErrorMessage = true;
                }
            }

            if (this.successMessage) {
                window.console.log('close modal');
                setTimeout(function () {
                    this.coreService.closeModal($('#popup-add-wishlist'));
                }, 3000);
            }
        }

    }

    angular
        .module("insite")
        .controller("WishListPopupController", MorscoWishListPopupController);
}
