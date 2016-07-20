module insite.useradministration {
    "use strict";

    export class UserDetailController {

        user: AccountModel = null;
        retrievalError = false;
        isSubmitted = false;
        isNewUser = true;
        generalError = "";

        static $inject = [
            "$scope",
            "accountService",
            "coreService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected accountService: account.IAccountService,
            protected coreService: core.ICoreService)
        {
            this.init();
        }

        init() {
            var id = this.coreService.getQueryStringParameter("userId", true);
            this.accountService.expand = "approvers,roles";
            this.accountService.getAccount(id).success((result: AccountModel) => {
                this.user = result;
                if (!id) {
                    this.user.email = "";
                    this.user.userName = "";
                    this.user.firstName = "";
                    this.user.lastName = "";
                    this.user.role = "";
                    this.user.approver = "";
                    this.user.isApproved = true;
                }
                this.coreService.refreshUiBindings();
                if (this.user.userName) {
                    this.isNewUser = false;
                }

                this.retrievalError = false;
            }).error(() => {
                this.retrievalError = true;
            });
        }

        createUser(redirectUri: string) {
            if (this.$scope["usersetupform"].$valid) {
                this.accountService.createAccount(this.user).success(() => {
                    window.location.href = redirectUri;
                }).error(data => {
                    if (data.message) {
                        this.generalError = data.message;
                    }
                });
            }

            this.isSubmitted = true;
        }

        updateUser(redirectUri: string) {
            if (this.$scope["usersetupform"].$valid) {
                this.accountService.updateAccount(this.user, this.user.id).success(() => {
                    window.location.href = redirectUri;
                }).error(data => {
                    if (data.message) {
                        this.generalError = data.message;
                    }
                });
            }

            this.isSubmitted = true;
        }
    }

    angular
        .module("insite")
        .controller("UserDetailController", UserDetailController);
}
