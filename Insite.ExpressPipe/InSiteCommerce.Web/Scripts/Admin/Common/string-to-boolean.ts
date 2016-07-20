module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("stringToBoolean", () => {
            return {
                require: "ngModel",
                link: (scope, element, attrs, ngModel) => {
                    ngModel.$formatters.push(value => {
                        if (typeof value === "string") {
                            var boolString = value.toLowerCase();

                            if (boolString === "yes" || boolString === "true" || boolString === "1") {
                                return true;
                            } else {
                                return false;
                            }
                        }

                        return value;
                    });
                }
            };
        });
}