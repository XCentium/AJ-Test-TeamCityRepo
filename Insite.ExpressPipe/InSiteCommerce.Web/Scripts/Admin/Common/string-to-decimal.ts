module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("stringToDecimal", () => {
            return {
                require: "ngModel",
                link: (scope, element, attrs, ngModel) => {
                    ngModel.$formatters.push(value => parseFloat(value));
                }
            };
        });
}