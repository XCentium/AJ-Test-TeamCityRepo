module insite.account {
    "use strict";
    angular
        .module("insite")
        .directive("iscRegistrationStepOneView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/RegistrationStepOneView"),
            controller: MorscoRegistrationStepOneController,
            controllerAs: "vm"
        };
    }])
        .directive("iscRegistrationStepTwoView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/RegistrationStepTwoView"),
            controller: MorscoRegistrationStepTwoController,
            controllerAs: "vm",
            link: function (scope, element, attrs) {
                $('.masked-zipcode').mask('99999');
            }
        };
    }])
        .directive("iscRegistrationStepThreeView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/RegistrationStepThreeView"),
            controller: "MorscoRegistrationStepThreeController",
            controllerAs: "vm",
            link: function (scope, element, attrs) {
                $('.masked-phone').mask('999-999-9999');
            }
        };
    }])
        .directive("iscRegistrationConfirmationView", ["coreService", function (coreService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Account/RegistrationConfirmationView"),
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
    }]);
}