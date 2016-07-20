module insite.workflow {

    angular.module("insite")
        .directive("iscWorkflowListView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "WorkflowController",
            //controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/Workflow/WorkflowListView")
        }
        return directive;
    }])
        .directive("iscWorkflowDetailView", ["coreService", function (coreService: core.ICoreService) {
        var directive: ng.IDirective = {
            controller: "WorkflowDetailController",
            //controllerAs: "vm",
            replace: true,
            restrict: "E",
            scope: {
            },
            templateUrl: coreService.getApiUri("/Directives/Workflow/WorkflowDetailView")
        }
        return directive;
    }]);
} 