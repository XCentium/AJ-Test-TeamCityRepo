module insite.account {
    "use strict";

    export class CreateAccountController {

        createError: string;
        email: string;
        isSubscribed: boolean;
        password: string;
        returnUrl: string;
        settings: AccountSettingsModel;
        userName: string;

        static $inject = [
            "$scope"
            ,"$window"
            , "accountService"
            , "sessionService"
            , "coreService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected sessionService: ISessionService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.returnUrl = this.coreService.getQueryStringParameter("returnUrl", true);

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.accountSettings;
            });
        }

        createAccount() {
            this.createError = "";

            var valid = $("#createAccountForm").validate().form();
            if (!valid) {
                return;
            }

            var account = <AccountModel>{
                email: this.email,
                userName: this.userName,
                password: this.password,
                isSubscribed: this.isSubscribed
            };

            this.accountService.createAccount(account).success((account: AccountModel) => {
                this.sessionService.getAccessToken(this.userName, this.password).success(result => {
                    this.sessionService.setAccessToken(result.access_token);
                    var currentContext = this.sessionService.getContext();
                    currentContext.billToId = account.billToId;
                    currentContext.shipToId = account.shipToId;
                    this.sessionService.setContext(currentContext);
                    this.$window.location.href = this.returnUrl;
                }).error(error => {
                    this.createError = error.message;
                });
            }).error(error => {
                this.createError = error.message;
            });
        }
    }

    angular
        .module("insite")
        .controller("CreateAccountController", CreateAccountController);
}
