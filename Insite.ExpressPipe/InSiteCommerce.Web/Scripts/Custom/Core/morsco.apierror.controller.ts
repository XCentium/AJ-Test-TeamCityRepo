module insite.core {
    "use strict";

    export class MorscoApiErrorPopupController extends ApiErrorPopupController{

        init() {
            this.$scope.$on("showApiErrorPopup",(event, message) => {
                var $popup = angular.element("#apiErrorPopup");
                if ($popup.length > 0) {
                    this.errorMessage = message;
                    this.coreService.displayModal($popup);
                }
            });
        }
    }

    angular
        .module("insite")
        .controller("ApiErrorPopupController", MorscoApiErrorPopupController);
} 