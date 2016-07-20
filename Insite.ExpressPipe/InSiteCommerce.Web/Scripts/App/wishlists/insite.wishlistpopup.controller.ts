module insite.wishlist {
    "use strict";

    export class WishListPopupController {

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
            "coreService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected wishListService: IWishListService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.productsToAdd = [];
            var settingsLoaded = false;

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.wishListSettings = data.wishListSettings;
                settingsLoaded = true;
            });
            
            this.$scope.$on("addToWishList",(event, data) => {
                
                if (settingsLoaded) {
                    if (!this.popupId) {
                        this.popupId = data.popupId != undefined ? "#" + data.popupId : "#popup-add-wishlist";
                    } else {
                        if (!this.popupId.match("^#")) {
                            this.popupId = "#" + this.popupId;
                        }
                    }

                    this.productsToAdd = data.products;
                    this.initialize();
                    this.showPopup();
                }
                
            });
        }

        initialize() {
            if (this.$scope["isAuthenticated"]) {
                this.clearMessages();
                this.newWishListName = "";
                if (this.wishListSettings.allowMultipleWishLists) {
                    // show dialog with wishlist options
                    this.wishListService.getWishListCollection().then(
                        result => { this.wishListCollection = result.wishListCollection; },
                        error => { this.errorMessage = error.message; });                    
                } else {
                    // just add to wishlist selected product
                    this.addWishList(this.newWishListName);
                }
            }
        }

        clearMessages() {
            this.successMessage = false;
            this.errorMessage = "";
            this.wishlistNameErrorMessage = false;
        }

        showPopup() {
            this.coreService.displayModal(angular.element(this.popupId));
        }

        changeWishList() {
            this.newWishListName = "";
            this.clearMessages();
        }

        addWishList(wishListName: string) {
            this.wishListService.addWishList(wishListName).then(newWishList => {

                this.addProductsToWishList(newWishList);
                
            }, error => {
                this.errorMessage = error.message;
            });
        }

        addLineToWishList(wishList: WishListModel) {
            this.wishListService.addWishListLine(wishList, this.productsToAdd[0]).then(() => {
                this.successMessage = true;
            }, error => {
                this.errorMessage = error.message;
            });
        }

        addLineCollectionToWishList(wishList: WishListModel) {
            this.wishListService.addWishListLineCollection(wishList, this.productsToAdd).then(() => {
                this.successMessage = true;
            }, error => {
                this.errorMessage = error.message;
            });
        }

        addToWishList() {
            this.clearMessages();
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
        }

        protected addProductsToWishList(wishList: WishListModel) {
            if (this.productsToAdd.length === 1) {
                this.addLineToWishList(wishList);
            } else {
                this.addLineCollectionToWishList(wishList);
            }
        }
    }

    angular
        .module("insite")
        .controller("WishListPopupController", WishListPopupController);
}
