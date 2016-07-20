module insite.cart {
    "use strict";

    export class AddToCartPopupController {

        //TODO: HP: Global valiable - should be set from settings
        cartPopupTimeout = 3000;
        isAddAll: boolean;
        isQtyAdjusted: boolean;
        productSettings: ProductSettingsModel;

        static $inject = [
            "$scope",
            "coreService"
        ];

        constructor(protected $scope: ICartScope, protected coreService: core.ICoreService) {
            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded", (event, data) => {
                this.productSettings = data.productSettings;
            });

            this.$scope.$on("showAddToCartPopup", (event, data) => {
                this.isAddAll = false;
                if (data && data.isAddAll) {
                    this.isAddAll = data.isAddAll;
                }

                this.isQtyAdjusted = false;
                if (data && data.isQtyAdjusted) {
                    this.isQtyAdjusted = data.isQtyAdjusted;
                }

                var showPopup = this.productSettings.showAddToCartConfirmationDialog || this.isQtyAdjusted;
                if (!showPopup) {
                    return;
                }

                var popupSelector = "#popup-productaddedtocart";
                var $popup = angular.element(popupSelector);
                if ($popup.length <= 0) {
                    return;
                }

                this.coreService.displayModal($popup);
                setTimeout(() => {
                    this.coreService.closeModal(popupSelector);
                }, this.cartPopupTimeout);
            });
        }
    }

    angular
        .module("insite")
        .controller("AddToCartPopupController", AddToCartPopupController);
}