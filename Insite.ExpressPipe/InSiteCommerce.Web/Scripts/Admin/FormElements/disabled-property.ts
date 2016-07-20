module insite_admin.formElements {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaDisabledProperty", <any>function () {
            return {
                restrict: "A",
                link: (scope, element, attrs) => {
                    angular.forEach(element.find("input"), (value, key) => {
                        var valueElement = angular.element(value);
                        valueElement.attr("ng-disabled", `${attrs.linkedProperty}`);
                    });

                    var $injector = angular.injector(["ng"]);
                    $injector.invoke(["$compile", function ($compile) {
                        $compile(element)(scope);
                    }]);
                }
            }
        });
}