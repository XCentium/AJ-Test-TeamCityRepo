module insite.account {
    "use strict";

    export class AccountSettingsController {
        settings: AccountSettingsModel;
        account: AccountModel;
        changePasswordError = "";
        password = "";
        newPassword = "";

        static $inject = ["$scope", "accountService", "sessionService", "coreService"];

        constructor(
            protected $scope: ng.IScope,
            protected accountService: account.IAccountService,
            protected sessionService: account.ISessionService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.accountSettings;
            });
            
            this.accountService.getAccount().success(account => {
                this.account = account;
            });            
        }

        changePassword() {
            this.changePasswordError = "";

            if (!this.$scope["changePasswordForm"].$valid) {
                return;
            }

            var session: SessionModel = <any>{
                password: this.password,
                newPassword: this.newPassword
            };

            this.sessionService.changePassword(session).then(() => {
                (<any>angular.element("#changePasswordSuccess")).foundation("reveal", "open");
            }, error => {
                this.changePasswordError = error.message;
            });
        }

        changeSubscription() {
            if (!this.$scope["manageSubscriptionsForm"].$valid) {
                return;
            }

            this.accountService.updateAccount(this.account).success(result => {
                (<any>angular.element("#manageSubscriptionSuccess")).foundation("reveal", "open");
            }).error(result => {
                this.changePasswordError = result.message;
            });
        }

    }

    angular
        .module("insite")
        .controller("AccountSettingsController", AccountSettingsController);

}