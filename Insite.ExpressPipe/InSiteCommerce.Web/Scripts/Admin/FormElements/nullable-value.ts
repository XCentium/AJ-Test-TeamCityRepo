module insite_admin.formElements {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaNullableValue", <any>function () {
            return {
                restrict: "A",
                link: (scope, element, attrs) => {
                    element.find("input").before(`<a class='button nullable-value-button' ng-if="!entityDetailsCtrl.model.isCustomProperty" ng-click='${attrs.isaNullableValue} = null'>Reset</a>`);

                    var $injector = angular.injector(["ng"]);
                    $injector.invoke(["$compile", function ($compile) {
                        $compile(element)(scope);
                    }]);
                }
            }
        });
}