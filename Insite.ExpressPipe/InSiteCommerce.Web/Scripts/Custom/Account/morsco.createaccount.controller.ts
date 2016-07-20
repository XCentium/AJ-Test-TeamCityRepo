module insite.account {
    "use strict";

    export class MorscoCreateAccountController extends CreateAccountController {

        accountInfo: IMorscoAccountInfo;
        
        static $inject = [
            "$scope"
            , "$window"
            , "accountService"
            , "sessionService"
            , "coreService"
            , "morscoAccountService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected sessionService: ISessionService,
            protected coreService: core.ICoreService,
            protected morscoAccountService: IMorscoAccountService) {

            super($scope, $window, accountService, sessionService, coreService);
        }

        init() {
            this.returnUrl = this.coreService.getQueryStringParameter("returnUrl", true);

            this.$scope.$on("settingsLoaded",(event, data) => {

                this.settings = data.accountSettings;
                this.morscoAccountService.getAccountInfo().then(result => {
                    this.accountInfo = result;
                });
            });
            

        }

        createAccount() {
            this.createError = "";

            var valid = $("#createAccountForm").validate().form();
            if (!valid) {
                return;
            }

            var account = <AccountModel>{
                email: this.accountInfo.accountModel.userName, // email is their username
                userName: this.accountInfo.accountModel.userName,
                password: this.accountInfo.accountModel.password,
                isSubscribed: this.accountInfo.accountModel.isSubscribed,
                firstName: this.accountInfo.accountModel.firstName,
                lastName: this.accountInfo.accountModel.lastName
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
        .controller("CreateAccountController", MorscoCreateAccountController);
}
