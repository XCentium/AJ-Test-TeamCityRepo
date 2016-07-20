module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaSetRestrictionGroupDescription", [
            "$http", ($http: ng.IHttpService) => ({
                restrict: "A",
                scope: {
                    model: "="
                },
                link($scope: any) {
                    var restrictionGroups;
                    $http.get("/api/v1/admin/restrictiongroups?select=name,description").then((result: any) => {
                        restrictionGroups = result.data.value || [];
                    });

                    $scope.$watch("model.name", (name) => {
                        if (!restrictionGroups) {
                            return;
                        }

                        $scope.model.description = restrictionGroups.filter(rg => rg.name === name)[0].description;
                    });
                }
            })]);
}