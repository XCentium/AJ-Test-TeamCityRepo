module insite_admin {
    "use strict";

    export class ScheduleJobActionController {
        model: any;

        integrationJob: any;
        jobDefinitionParameters: any;
        jobDefinitionStepParameters: any;
        resultMessage: any;

        static $inject = ["$http", "$scope", "FoundationApi", "spinnerService", "$q", "notificationService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected spinnerService: ISpinnerService,
            protected $q: ng.IQService,
            protected notificationService: INotificationService
        ) {
            this.$scope.$on("AdminAction-Detail:ScheduleJob", (event, arg) => {
                this.model = arg.model;
                this.scheduleIntegrationJob();
            });
        }

        loadDefaultIntegrationJob() {
            if (!this.model || !this.model.id) {
                return;
            }

            this.$q.all([
                this.$http.get(`/api/v1/admin/integrationjobs/default?q=${new Date().getTime()}`),
                this.$http.get(`/api/v1/admin/jobdefinitions(${this.model.id})?$expand=jobdefinitionparameters,jobdefinitionsteps($expand=jobdefinitionstepparameters)`)
            ]).then(o => {
                this.integrationJob = o[0].data;
                this.integrationJob.scheduleDateTime = new Date(new Date().toUTCString()); // set as default on entity definition?

                var jobDefinition = o[1].data;
                this.jobDefinitionParameters = [];
                this.jobDefinitionStepParameters = [];

                jobDefinition.jobDefinitionParameters = jobDefinition.jobDefinitionParameters.sort((a, b) => (a.sequence.toString().localeCompare(b.sequence.toString(), { kn: true })));
                for (var x = 0; x < jobDefinition.jobDefinitionParameters.length; x++) {
                    var jobDefinitionParameter = jobDefinition.jobDefinitionParameters[x];
                    var integrationJobParameter = {
                        JobDefinitionParameterId: jobDefinitionParameter.id,
                        Prompt: jobDefinitionParameter.prompt || jobDefinitionParameter.name,
                        Value: this.getValueForValueType(jobDefinitionParameter.valueType, jobDefinitionParameter.defaultValue),
                        ValueType: jobDefinitionParameter.valueType
                    };

                    this.jobDefinitionParameters.push(integrationJobParameter);
                }

                for (var y = 0; y < jobDefinition.jobDefinitionSteps.length; y++) {
                    var jobDefinitionStep = jobDefinition.jobDefinitionSteps.sort((a, b) => (a.sequence.toString().localeCompare(b.sequence.toString(), { kn: true })))[y];
                    jobDefinitionStep.jobDefinitionStepParameters = jobDefinitionStep.jobDefinitionStepParameters.sort((a, b) => (a.sequence.toString().localeCompare(b.sequence.toString(), { kn: true })));
                    for (var z = 0; z < jobDefinitionStep.jobDefinitionStepParameters.length; z++) {
                        var jobDefinitionStepParameter = jobDefinitionStep.jobDefinitionStepParameters[z];
                        var integrationJobStepParameter = {
                            JobDefinitionStepSequence: jobDefinitionStep.sequence,
                            JobDefinitionStepName: jobDefinitionStep.name,
                            JobDefinitionStepParameterId: jobDefinitionStepParameter.id,
                            Prompt: jobDefinitionStepParameter.prompt || jobDefinitionStepParameter.name,
                            Value: this.getValueForValueType(jobDefinitionStepParameter.valueType, jobDefinitionStepParameter.defaultValue),
                            ValueType: jobDefinitionStepParameter.valueType
                        };

                        this.jobDefinitionStepParameters.push(integrationJobStepParameter);
                    }
                }
            });
        }

        getValueForValueType(valueType: any, value: any): any {
            if (valueType === "Number" || valueType === "RelativeDateTime") {
                return !isNaN(value) ? Number(value) : 0;
            } else if (valueType === "SpecificDateTime") {
                return !isNaN(Date.parse(value)) ? new Date(value).toISOString() : new Date().toISOString();
            } else if (valueType === "Boolean") {
                return value.toLowerCase() === "true" || value.toLowerCase() === "t" || value.toLowerCase() === "yes" || value.toLowerCase() === "y" || value === "1";
            } else {
                return value;
            }
        }

        scheduleIntegrationJob() {
            this.loadDefaultIntegrationJob();
            this.resultMessage = "";
            this.$foundationApi.publish("scheduleIntegrationJob", "open");
            this.$scope.$broadcast("repeatfinished"); // reevaluate table header width after modal is shown
        }

        saveIntegrationJob() {
            this.spinnerService.show();

            this.integrationJob.jobDefinitionId = this.model.id;
            this.integrationJob.status = "Queued"; // set as default on entity definition?
            
            this.integrationJob.integrationJobParameters = [];
            for (var x = 0; x < this.jobDefinitionParameters.length; x++) {
                this.integrationJob.integrationJobParameters.push({
                    jobDefinitionParameterId: this.jobDefinitionParameters[x].JobDefinitionParameterId,
                    value: this.jobDefinitionParameters[x].Value.toString()
                });
            }

            for (var y = 0; y < this.jobDefinitionStepParameters.length; y++) {
                this.integrationJob.integrationJobParameters.push({
                    jobDefinitionStepParameterId: this.jobDefinitionStepParameters[y].JobDefinitionStepParameterId,
                    value: this.jobDefinitionStepParameters[y].Value.toString()
                });
            }

            this.$http({
                method: "POST",
                url: "/Admin/JobDefinition/ScheduleJob",
                data: { integrationJob: this.integrationJob }
            }).success(integrationJob => {
                this.spinnerService.hide();
                this.loadDefaultIntegrationJob(); // reset the integration job
                this.$foundationApi.publish("scheduleIntegrationJob", "close");
                this.notificationService.show(NotificationType.Success, "Job Successfully Scheduled");
            }).error(integrationJob => {
                this.spinnerService.hide();
                this.loadDefaultIntegrationJob(); // reset the integration job
                this.$foundationApi.publish("scheduleIntegrationJob", "close");
                this.notificationService.show(NotificationType.Error, "Error Scheduling Job");
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("ScheduleJobActionController", ScheduleJobActionController)
        .directive("isaScheduleJobAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                templateUrl: "/admin/directives/ScheduleJobAction",
                controller: "ScheduleJobActionController",
                controllerAs: "vm",
                scope: { }
            }
        });
}