module insite.core {
    "use strict";

    export class ApiErrorPopupController {

        errorMessage: string;

        static $inject = [
            "$scope",
            "coreService"
        ];

        constructor(protected $scope: ng.IScope, protected coreService: core.ICoreService) {
            this.init();
        }

        init() {
            this.$scope.$on("showApiErrorPopup",(event, message) => {
                var $popup = angular.element("#apiErrorPopup");
                if ($popup.length > 0) {
                    this.errorMessage = JSON.stringify(message, null, "<br/>");
                    this.coreService.displayModal($popup);
                }
            });
        }
    }

    angular
        .module("insite")
        .controller("ApiErrorPopupController", ApiErrorPopupController);
} 