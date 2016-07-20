module insite.account {
    "use strict";

    export class MorscoRegistrationStepTwoController {

        accountInfo: IMorscoAccountInfo;
        warehouses: IMorscoWarehouses;
        isValid: boolean;
        country: CountryModel;
        createError: string;

        static $inject = [
            "$scope"
            , "$window"
            , "accountService"
            , "morscoAccountService"
            , "coreService"
            , "websiteService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected morscoAccountService: IMorscoAccountService,
            protected coreService: core.ICoreService,
            protected websiteService: websites.IWebsiteService) {
            this.init();
        }

        init() {
            this.isValid = true;
            var self = this;
            
            this.morscoAccountService.getAccountInfo().then(result => {
                self.accountInfo = result
                this.websiteService.getCountries("states").success(result => {
                    self.country = result.countries[0];
                });
                this.morscoAccountService.getWarehouses().success(warehouses => {
                    self.warehouses = warehouses;
                });
                
            });

        }

        nextStep(continueUri: string) {
            var valid = $("#createAccountForm").validate().form();
            if (!valid) {
                return;
            }
            this.$window.location.href = continueUri;
            this.morscoAccountService.setAccountInfo(this.accountInfo).then(result => {
                this.$window.location.href = continueUri;
            });
        }

    }

    angular
        .module("insite")
        .controller("MorscoRegistrationStepTwoController", MorscoRegistrationStepTwoController);
}
