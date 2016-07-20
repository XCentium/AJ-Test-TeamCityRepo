module insite_admin {
    "use strict";

    export class ImpersonateActionController {
        passwordResetDialog: any;

        static $inject = ["$http", "$scope", "spinnerService", "notificationService", "sessionService", "adminSessionService", "ipCookie"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected notificationService: INotificationService,
            protected sessionService: ISessionService,
            protected adminSessionService: IAdminSessionService,
            protected ipCookie: any
        ) {
            this.$scope.$on("AdminAction-Detail:Impersonate", (event, arg) => {
                this.clearCookies(["CKFinder_Check"]);
                this.$http.post("/admin/account/impersonate", { userName: arg.model.userName }).success((error: string) => {
                    if (error) {
                        this.notificationService.show(NotificationType.Error, error);
                        return;
                    }
                    this.spinnerService.show();
                    this.clearCookies(["CKFinder_Check", ".AspNet.ApplicationCookie", "ImpersonatedBy"]);
                    this.sessionService.clearLocalInformation();
                    window.open("/", "_blank");
                    this.spinnerService.hide();
                });
            });
        }

        clearCookies(except) {
            var cookies = this.ipCookie();
            angular.forEach(cookies, (v, k) => {
                if (!except.some(c => c === k)) {
                    document.cookie = k + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                }
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("ImpersonateActionController", ImpersonateActionController)
        .directive("isaImpersonateAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                controller: "ImpersonateActionController",
                controllerAs: "vm",
                scope: { }
            }
        });
}