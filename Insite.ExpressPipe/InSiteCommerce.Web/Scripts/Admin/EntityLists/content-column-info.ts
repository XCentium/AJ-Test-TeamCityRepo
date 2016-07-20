module insite_admin.formElements {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaContentColumnInfo", ["$http", <any>function ($http) {
            return {
                restrict: "E",
                link(scope: any, element, attrs) {
                    if (attrs.entityName !== "") {
                        var pluralizedName = attrs.entityName + "s";
                        if (attrs.entityName === "Category") {
                            pluralizedName = "Categories";
                        }

                        var uri = `/api/v1/admin/${pluralizedName}?$filter=(ContentManagerId eq ${attrs.id})`;
                        $http.get(uri).then((result: any) => {
                            if (result.data.value.length > 0) {
                                if (attrs.entityName === "Product") {
                                    scope.nameValue = result.data.value[0].erpNumber;
                                } else {
                                    scope.nameValue = result.data.value[0].name;
                                }
                            }
                        });
                    }
                },
                scope: true
            }
        }]);
}