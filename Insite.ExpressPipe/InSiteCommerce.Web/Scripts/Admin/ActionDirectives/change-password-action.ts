module insite_admin {
    "use strict";

    export class ChangePasswordActionController {
        passwordResetDialog: any;

        static $inject = ["$rootScope", "$scope", "FoundationApi"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $foundationApi: any
        ) {
            this.$scope.$on("AdminAction-Detail:ChangePassword", (event, arg) => {
                this.$foundationApi.publish("changePasswordModal", "open");
                this.$rootScope.$broadcast("resetPasswordForm", { userName: arg.model.userName });
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("ChangePasswordActionController", ChangePasswordActionController)
        .directive("isaChangePasswordAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                controller: "ChangePasswordActionController",
                controllerAs: "vm",
                scope: { }
            }
        });
}