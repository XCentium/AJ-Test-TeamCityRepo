module insite.account {
    "use strict";

    export class MorscoRegistrationStepThreeController {

        accountInfo: IMorscoAccountInfo;
        isValid: boolean;
        returnUrl: string;
        createError: string;
        static $inject = [
            "$scope"
            , "$window"
            , "accountService"
            , "sessionService"
            , "morscoAccountService"
            , "coreService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected sessionService: ISessionService,
            protected morscoAccountService: IMorscoAccountService,
            protected coreService: core.ICoreService) {
            this.init();
        }

        init() {
            this.returnUrl = "/registrationstep3";
            var self = this;
            try {
                this.morscoAccountService.getAccountInfo().then(result => {
                    self.accountInfo = result
					$("#registration-terms-content").append($("#register_termsContent").html());
                });
            } catch (e) {
            }
        }

        createAccount() {
            this.createError = "";

            var valid = $("#createAccountForm").validate().form();
            if (!valid) {
                return;
            }
            this.accountInfo.accountModel.properties = {};
            
            this.accountInfo.accountModel.properties["A. ReportedAccount"] = this.accountInfo.accountNumber;
            this.accountInfo.accountModel.properties["B. ReportedCompanyName"] = this.accountInfo.companyName;
            this.accountInfo.accountModel.properties["C. ReportedAddress1"] = this.accountInfo.address1;
            this.accountInfo.accountModel.properties["D. ReportedAddress2"] = this.accountInfo.address2;
            this.accountInfo.accountModel.properties["E. ReportedCity"] = this.accountInfo.city;
            this.accountInfo.accountModel.properties["F. ReportedState"] = this.accountInfo.state;
            this.accountInfo.accountModel.properties["G. ReportedPostalCode"] = this.accountInfo.zip;
            this.accountInfo.accountModel.properties["H. ReportedCountry"] = this.accountInfo.country;
            this.accountInfo.accountModel.properties["I. ReportedPhone"] = this.accountInfo.phoneNumber;
            this.accountInfo.accountModel.properties["J. ReportedBranch"] = this.accountInfo.branch;
            this.accountInfo.accountModel.properties["K. ReportedSalesperson"] = this.accountInfo.salesman;
            this.accountInfo.accountModel.properties["IsNewRegistration"] = "True";

            var account = <AccountModel>{
                email: this.accountInfo.accountModel.userName, // email is their username
                userName: this.accountInfo.accountModel.userName,
                password: this.accountInfo.accountModel.password,
                isSubscribed: this.accountInfo.accountModel.isSubscribed,
                firstName: this.accountInfo.accountModel.firstName,
                lastName: this.accountInfo.accountModel.lastName,
                properties: this.accountInfo.accountModel.properties
            };

            this.morscoAccountService.setAccountInfo(this.accountInfo).then(result => {
                this.accountService.createAccount(account).success((account: AccountModel) => {
                    this.morscoAccountService.removeAccountInfo().then(result=> {
                    });
                    if (this.sessionService.isAuthenticated) {
                        this.sessionService.signOut();
                    }
                    this.$window.location.href = "/registrationconfirmation";
                }).error(error => {
                    this.createError = error.message;
                });
            });

        }
    }

    angular
        .module("insite")
        .controller("MorscoRegistrationStepThreeController", MorscoRegistrationStepThreeController);
}
