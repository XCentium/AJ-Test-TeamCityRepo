module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaSetMultipleSaleQty", <any>function() {
            return {
                restrict: "A",
                scope: {
                    model: "="
                },
                link($scope: any) {
                    $scope.$watch("model.roundingRule", () => {
                        if ($scope.model.roundingRule !== "Multiple Only") {
                            $scope.model.multipleSaleQty = 0;
                        }
                    });
                }
            }
        });
}