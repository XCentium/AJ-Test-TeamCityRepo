module insite.workflow {
    "use strict";

    export interface IWorkflowScope extends ng.IScope {
        workflows: ModuleCollection;
        noHandlerCount: number;
    }

    export class WorkflowController {

        static $inject = [
            "$scope",
            "workflowService"
        ];

        constructor(
            protected $scope: IWorkflowScope,
            protected workflowService: workflow.IWorkflowSevice) {

            this.init();
        }

        init() {
            this.getWorkflows();
        }

        getWorkflows() {
            this.workflowService.getWorkflows().then((result) => {

                this.$scope.workflows = result.data;
                this.$scope.noHandlerCount = 0;
                result.data.modules.forEach((module) => {
                    module.services.forEach((service) => {
                        if (service.handlers.length > 1) {
                            this.$scope.noHandlerCount++;
                        }
                    });
                });
            })
        }

    }
    angular
        .module("insite")
        .controller("WorkflowController", WorkflowController);
}