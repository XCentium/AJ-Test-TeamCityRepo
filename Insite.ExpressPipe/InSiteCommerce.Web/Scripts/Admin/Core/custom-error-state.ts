module insite_admin {
    "use strict";

    export class CustomErrorState {
        isCustomErrorEnabled: boolean;

        constructor() {
            this.isCustomErrorEnabled = angular.element("html").attr("data-isCustomErrorEnabled").toLowerCase() === "true";
        }

        shouldDisplayDetails(): boolean {
            return !this.isCustomErrorEnabled;
        }

        static serviceName = "customErrorState";
    }

    angular
        .module("insite-admin")
        .service(CustomErrorState.serviceName, CustomErrorState);
}