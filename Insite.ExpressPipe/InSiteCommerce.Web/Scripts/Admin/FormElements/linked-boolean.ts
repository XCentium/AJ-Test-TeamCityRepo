module insite_admin.formElements {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaLinkedBoolean", <any>function () {
            return {
                restrict: "EAC",
                link: (scope, element, attrs) => {
                    scope.$watch(() => scope.sourceProperty, () => {
                        if (scope.sourceProperty) {
                            scope.targetProperty = true;
                        }
                    }, true);
                },
                scope: {
                    sourceProperty: "=",
                    targetProperty: "="
                }
            }
        });
}