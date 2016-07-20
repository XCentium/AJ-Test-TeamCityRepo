module insite_admin {
    "use strict";

    export class ResetPasswordActionController {
        passwordResetDialog: any;

        static $inject = ["$rootScope", "$http", "$scope", "FoundationApi", "spinnerService", "notificationService", "sessionService", "ModalFactory"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected spinnerService: ISpinnerService,
            protected notificationService: INotificationService,
            protected sessionService: ISessionService,
            protected modalFactory: any
        ) {
            this.$scope.$on("AdminAction-Detail:ResetPassword", (event, arg) => {
                var submitAction = () => {
                    this.passwordResetDialog.deactivate();
                    this.spinnerService.show();
                    this.$http.post("/admin/account/resetPassword", { userName: arg.model.userName }).success((newPassword: string) => {
                        this.spinnerService.hide();
                        this.newPasswordDialogShow(newPassword);
                    }).error(() => {
                        this.spinnerService.hide();
                        this.notificationService.show(NotificationType.Error, "Error occurred during resetting password");
                    });
                };

                this.passwordResetDialog = this.passwordResetDialog || new this.modalFactory({
                    id: "passwordResetDialog",
                    class: "modal--medium",
                    templateUrl: "simpleModalDialog",
                    contentScope: {
                        modalDialogText: "Are you sure you want to reset the Password?",
                        modalDialogTitle: "Reset password",
                        submitButtonName: "Yes",
                        cancelButtonName: "No",
                        modalSubmitAction: submitAction
                    }
                });

                this.passwordResetDialog.activate();
            });
        }

        newPasswordDialogShow(newPassword: string) {
            var config = {
                id: "newPasswordDialog",
                class: 'modal--medium',
                templateUrl: "simpleModalDialog",
                contentScope: {
                    "modalDialogText": "Your password changed to " + newPassword,
                    "modalDialogTitle": "New password",
                    "cancelButtonName": "Ok"
                }
            }
            var modal = new this.modalFactory(config);
            this.$foundationApi.subscribe(config.id, (msg) => {
                if (msg === "close" || msg === "hide") {
                    modal.destroy();
                }
            });
            modal.activate();
        }
    }

    angular
        .module("insite-admin")
        .controller("ResetPasswordActionController", ResetPasswordActionController)
        .directive("isaResetPasswordAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                controller: "ResetPasswordActionController",
                controllerAs: "vm",
                scope: { }
            }
        });
}