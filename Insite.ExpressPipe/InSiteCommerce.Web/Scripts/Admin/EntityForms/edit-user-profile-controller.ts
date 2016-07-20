module insite_admin {
    "use strict";

    export class EditUserProfileController extends EntityDetailsController {
        save(afterSave: any): void {
            delete this.dirtyProperties["assignedRoles"];

            var newRoles = this.model.assignedRoles.filter((role: string) => {
                return this.initialModel.assignedRoles.indexOf(role) === -1;
            });
            var deletedRoles = this.initialModel.assignedRoles.filter((role: string) => {
                return this.model.assignedRoles.indexOf(role) === -1;
            });

            var extendedAfterSave = afterSave;

            if (Object.keys(this.dirtyProperties).length === 0) {
                this.saveRoles(newRoles, deletedRoles);
            } else {
                extendedAfterSave = () => {
                    this.saveRoles(newRoles, deletedRoles);

                    if (typeof (afterSave) === "function") {
                        afterSave();
                    }
                }
            }

            super.save(extendedAfterSave);
        }

        saveRoles(newRoles, deletedRoles): void {
            var rolesUrl = `${this.serviceUri}(${this.model.id})/roles`;
            if (newRoles.length > 0) {
                this.$http.post(rolesUrl, { value: newRoles });
            }
            if (deletedRoles.length > 0) {
                this.$http.delete(rolesUrl, { data: { value: deletedRoles }, headers: { "Content-Type": "application/json;charset=utf-8" } });
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("EditUserProfileController", EditUserProfileController);
}