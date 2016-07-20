module insite_admin.formElements {
    "use strict";

    export interface RoleDto {
        id: System.Guid;
        roleName: string;
        isReadonly: boolean;
    }

    export class UserRolesSelectorController {
        showFilterRoles: boolean;
        filterRoles: string;
        pluralizedEntityName: string;
        initialModel: any;
        model: any;

        assignedRoles: RoleDto[];
        availableRoles: RoleDto[];

        static $inject = ["$http"];

        constructor(protected $http: ng.IHttpService) {
            this.init();
        }

        init() {
            this.$http.get(`/api/v1/admin/roles`).success((result: any) => {
                var allRoles = result.value;
                if (this.pluralizedEntityName === "messages") {
                    this.loadMessageTargetRoles(allRoles);
                } else {
                    this.loadUserProfileRoles(allRoles);
                }
            });
        }

        removeFromAssigned(role: RoleDto) {
            this.moveRole(role, this.assignedRoles, this.availableRoles);
            this.model.assignedRoles = this.assignedRoles.map(o => o.roleName);
        }

        removeAllFromAssigned($event) {
            this.removeAllAssigned();
            $event.preventDefault();
            return false;
        }

        addToAssigned(role: RoleDto) {
            this.moveRole(role, this.availableRoles, this.assignedRoles);
            this.model.assignedRoles = this.assignedRoles.map(o => o.roleName);
        }

        addAllToAssigned($event) {
            var rolesToMove = this.availableRoles.filter(o => !o.isReadonly);
            this.assignedRoles = this.assignedRoles.concat(rolesToMove).sort(this.roleComparer);
            this.availableRoles = this.availableRoles.filter(o => o.isReadonly).sort(this.roleComparer);
            this.model.assignedRoles = this.assignedRoles.map(o => o.roleName);
            $event.preventDefault();
            return false;
        }

        roleComparer(a: RoleDto, b: RoleDto) {
            return +(a.roleName > b.roleName) || +(a.roleName === b.roleName) - 1;
        }

        moveRole(role: RoleDto, from: RoleDto[], to: RoleDto[]) {
            var removeIndex = from.indexOf(role);
            from.splice(removeIndex, 1);

            to.push(role);
            to.sort(this.roleComparer);
        }

        changeFilter(): void {
            if (this.filterRoles === "all") {
                this.removeAllAssigned();
            }
        }

        private removeAllAssigned(): void {
            var rolesToMove = this.assignedRoles.filter(o => !o.isReadonly);
            this.availableRoles = this.availableRoles.concat(rolesToMove).sort(this.roleComparer);
            this.assignedRoles = this.assignedRoles.filter(o => o.isReadonly).sort(this.roleComparer);
            this.model.assignedRoles = this.assignedRoles.map(o => o.roleName);
        }

        private initModel(allRoles: RoleDto[], roles: string[]): void {
            this.assignedRoles = allRoles.filter((role) => {
                return roles.indexOf(role.roleName) !== -1;
            });

            this.availableRoles = allRoles.filter((role) => {
                return this.assignedRoles.map(o => o.roleName).indexOf(role.roleName) === -1;
            });

            this.initialModel.assignedRoles = angular.copy(this.assignedRoles.map(o => o.roleName));
            this.model.assignedRoles = this.assignedRoles.map(o => o.roleName);
        }

        private loadMessageTargetRoles(allRoles: RoleDto[]): void {
            this.$http.get(`/api/v1/admin/messages(${this.model.id})/messagetargets?$filter=targettype eq 'Role'&$select=targetkey,id`).then((result: any) => {
                var roles: string[] = [];
                var ids = {};
                for (var i = 0; i < result.data.value.length; i++) {
                    roles.push(result.data.value[i].targetKey);
                    ids[result.data.value[i].targetKey] = result.data.value[i].id;
                }

                this.showFilterRoles = true;
                this.filterRoles = roles.length > 0 ? "selected" : "all";
                this.initModel(allRoles, roles);

                var assignedRoleIds = [ids];
                this.initialModel.assignedRoleIds = angular.copy(assignedRoleIds);
                this.model.assignedRoleIds = assignedRoleIds;
            });
        }

        private loadUserProfileRoles(allRoles: any[]): void {
            this.$http.get(`/api/v1/admin/userProfiles(${this.model.id})/roles`).then((result: any) => {
                this.initModel(allRoles, result.data.value);
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("UserRolesSelectorController", UserRolesSelectorController)
        .directive("isaUserRolesSelector", () => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "UserRolesSelector",
                controller: "UserRolesSelectorController",
                controllerAs: "vm",
                bindToController: true,
                scope: {
                    initialModel: "=",
                    pluralizedEntityName: "=",
                    model: "="
                }
            }
        });

}