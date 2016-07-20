module insite.cart {
    "use strict";

    export class AddressErrorPopupController {

        isAddressEditAllowed: boolean;

        static $inject = [
            "$scope",
            "coreService"
        ];

        constructor(protected $scope: ICartScope, protected coreService: core.ICoreService) {
            this.init();
        }

        init() {

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.isAddressEditAllowed = data.customerSettings.allowBillToAddressEdit && data.customerSettings.allowShipToAddressEdit;
            });

            this.$scope.$on("showAddressErrorPopup",() => {
                var $popup = angular.element("#cartAddressErrorPopup");
                if ($popup.length > 0) {
                    this.coreService.displayModal($popup);
                }
            });
        }    
    }


    angular
        .module("insite")
        .controller("AddressErrorPopupController", AddressErrorPopupController);
} 