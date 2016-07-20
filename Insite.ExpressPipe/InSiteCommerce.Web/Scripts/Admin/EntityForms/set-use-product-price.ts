module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaSetUseProductPrice", <any>function() {
            return {
                restrict: "A",
                scope: {
                    model: "="
                },
                link($scope: any) {
                    $scope.$watch("model.productId", () => {
                        if ($scope.model.productId == null) {
                            $scope.model.useProductPrice = false;
                        }
                    });
                }
            }
        });
}