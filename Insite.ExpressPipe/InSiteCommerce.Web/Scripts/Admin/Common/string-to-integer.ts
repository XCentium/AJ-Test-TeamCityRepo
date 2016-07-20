module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("stringToInteger", () => {
            return {
                require: "ngModel",
                link: (scope, element, attrs, ngModel) => {
                    ngModel.$formatters.push(value => parseInt(value));
                }
            };
        });
}