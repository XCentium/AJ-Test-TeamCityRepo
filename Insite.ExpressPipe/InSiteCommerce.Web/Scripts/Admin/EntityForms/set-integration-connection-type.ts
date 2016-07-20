module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("isaSetIntegrationConnectionType", [
            "$http", ($http: ng.IHttpService) => ({
                restrict: "A",
                scope: {
                    entityDetailsCtrl: "="
                },
                link($scope) {
                    $scope.$watch("entityDetailsCtrl.model.integrationConnectionOverrideId", () => {
                        if ($scope.entityDetailsCtrl.model.integrationConnectionOverrideId) {
                            $http.get(`/api/v1/admin/integrationConnections(${$scope.entityDetailsCtrl.model.integrationConnectionOverrideId})`).success(o => {
                                $scope.entityDetailsCtrl.integrationConnectionTypeName = (<any>o).typeName;
                            });
                        } else if ($scope.entityDetailsCtrl.model.jobDefinitionId) {
                            $http.get(`/api/v1/admin/jobDefinitions(${$scope.entityDetailsCtrl.model.jobDefinitionId})?$expand=integrationConnection`).success(o => {
                                $scope.entityDetailsCtrl.integrationConnectionTypeName = (<any>o).integrationConnection.typeName;
                            });
                        }
                    });
                }
            })]);
}