module insite.account {
    "use strict";
    angular
        .module("insite")
        .directive("iscAddressField", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/AddressField"),
            scope: {
                fieldLabel: "@",
                fieldName: "@",
                isEmail: "@",
                isPhone: "@",
                fieldValue: "=",
                validation: "=",
                isReadOnly: "="
            }
        };
    }])
        .directive("iscAddressEdit", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/AddressEdit"),
            scope: {
                prefix: "@",
                showEmail: "@",
                address: "=",
                countries: "=",
                isReadOnly: "="
            }
        };
    }])
        .directive("iscAddressDisplay", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/AddressDisplay"),
            scope: {
                prefix: "@",
                showEmail: "@",
                address: "="
            }
        };
    }])
        .directive("iscSignIn", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/SignIn")
        };
    }])
        .directive("iscUsernamePassword", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/UserNamePassword")
        };
    }])
        .directive("iscRegister", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/Register")
        };
    }])
        .directive("iscSelectCustomerView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/SelectCustomerView"),
            controller: "SelectCustomerController",
            controllerAs: "vm",
            scope: {
                dashboardUrl: "@",
                addressesUrl: "@",
                homePageUrl: "@",
                checkoutAddressUrl: "@",
                reviewAndPayUrl: "@"
            },
            bindToController: true
        };
    }])
        .directive("iscChangePassword", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/ChangePassword")
        };
    }])
        .directive("iscForgotPasswordPopup", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/ForgotPasswordPopup")
        };
    }])
        .directive("iscSignInView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/SignInView"),
            controller: "SignInController",
            controllerAs: "vm",
            scope: {
                homePageUrl: "@",
                changeCustomerPageUrl: "@",
                dashboardUrl: "@",
                addressesUrl: "@",
                checkoutAddressUrl: "@",
                reviewAndPayUrl: "@"
            },
            bindToController: true
        };
    }])
        .directive("iscCreateAccountView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/CreateAccountView"),
            controller: "CreateAccountController",
            controllerAs: "vm"
        };
    }])
        .directive("iscSettingsView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/SettingsView"),
            controller: "AccountSettingsController",
            controllerAs: "vm"
        };
    }])
        .directive("iscMyAccountAddress", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/MyAccountAddressView"),
            controller: "MyAccountAddressController",
            controllerAs: "vm"
        };
    }])
        .directive("iscExternalProviders", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/ExternalProviders"),
            controller: "ExternalProvidersController",
            controllerAs: "vm",
            scope: {}
        };
    }]);
}
