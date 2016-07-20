module insite_admin {
    "use strict";
    export class LayoutController {
        static $inject = ["adminSessionService"];
        constructor(
            protected adminSessionService: IAdminSessionService
        ) {

        }

        isAuthenticated(): boolean {
            return this.adminSessionService.isAuthenticated();
        }
    }

    angular
        .module("insite-admin")
        .controller("LayoutController", LayoutController);
}