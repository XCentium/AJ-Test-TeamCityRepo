module insite_admin {
    "use strict";

    export class RoleDetailsController extends EntityDetailsController {
        save(afterSave: any): void {
            if (!afterSave && this.isNew) {
                afterSave = () => {
                    this.$location.path("/data/roles");
                };
            }

            super.save(afterSave);
        }
    }

    angular
        .module("insite-admin")
        .controller("RoleDetailsController", RoleDetailsController);
}