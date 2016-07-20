module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaCustomControl", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "@",
                name: "angularController",
                controllerAs: "vm",
                scope: {
                    model: "="
                },
                bindToController: {
                    selectedEntityId: "=",
                    disabled: "@",
                    form: "=",
                    name: "@",
                    label: "@",
                    key: "@",
                    isDisplay: "@"
                },
                templateUrl(element, attrs) {
                    return attrs.templateUrl;
                }
            }
        });
}