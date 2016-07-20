module insite.account {
    "use strict";

    export class MorscoRegistrationStepOneController {

        accountInfo: IMorscoAccountInfo;
        isValid: boolean;
        errors: string[] = [];
        hasAccount: boolean;

        static $inject = [
            "$scope"
            , "$window"
            , "accountService"
            , "morscoAccountService"
            , "coreService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected morscoAccountService: IMorscoAccountService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.isValid = true;
            this.hasAccount = false;
            var self = this;
            this.morscoAccountService.getAccountInfo().then(result => {
                self.accountInfo = result;
                if (!self.accountInfo) {
                    var accountModel = <AccountModel>{};
                    self.accountInfo = <IMorscoAccountInfo>{ accountModel: <AccountModel> {} };
                    self.accountInfo.state = "CA";
                    self.accountInfo.branch = "";
                }
            });
        }

        nextStep(continueUri: string, skipAccountSearch) {
            var self = this;
            this.errors = [];
            this.accountInfo.existingAccount = false;
            if (this.hasAccount && !skipAccountSearch) {
                this.morscoAccountService.getCustomer(this.accountInfo.accountNumber).success(result => {
                    if (result.customerNumber) {
                        this.accountInfo.companyName = result.companyName;
                        this.accountInfo.address1 = result.address1;
                        this.accountInfo.address2 = result.address2;
                        this.accountInfo.city = result.city;
                        this.accountInfo.state = result.state;
                        this.accountInfo.zip = result.postalCode;
                        this.accountInfo.country = result.country;
                        this.accountInfo.existingAccount = true;
                        this.setInfoAndContinue(continueUri);
                    } else {
                        this.errors.push("Your account was not found.");
                    }
                }).error(error => {
                    this.errors.push("Your account was not found.");
                });
            } else {
                this.setInfoAndContinue(continueUri); 
            }
        }

        setInfoAndContinue(continueUri: string) {
            this.morscoAccountService.setAccountInfo(this.accountInfo).then(result => {
                this.$window.location.href = continueUri;
            });
        }

    }

    angular
        .module("insite")
        .controller("MorscoRegistrationStepOneController", MorscoRegistrationStepOneController);
}
