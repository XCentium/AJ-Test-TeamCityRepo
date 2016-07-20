module insite_admin {
    "use strict";

    export class JobParametersController {
        selectedEntityId: any;
        disabled: string;

        jobDefinitionParameters: any;
        jobDefinitionStepParameters: any;

        static $inject = ["$scope", "$http", "$q"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService
        ) {
            this.$scope.$watch("model.id", () => {
                this.loadEntities();
            });
        }

        loadEntities() {
            if (!this.$scope["model"].id) {
                return;
            }

            // optimally we would be able to expand the jobdefinitionstepparameter and jobdefinitionstep. however, we are currently fighting with wcf serialization for the WIS
            this.$q.all([
                this.$http.get("/api/v1/admin/jobdefinitionparameters"),
                this.$http.get("/api/v1/admin/jobdefinitionstepparameters"),
                this.$http.get("/api/v1/admin/jobdefinitionsteps"),
                this.$http.get(`/api/v1/admin/integrationjobparameters?$filter=integrationjobid eq ${this.$scope["model"].id}`)
            ]).then(o => {

                var jobDefinitionParameters = o[0].data.value;
                var jobDefinitionStepParameters = o[1].data.value;
                var jobDefinitionSteps = o[2].data.value;
                var integrationJobParameters = o[3].data.value;

                this.jobDefinitionParameters = [];
                this.jobDefinitionStepParameters = [];

                var integrationJobDefinitionParameters = integrationJobParameters.filter(p => { return p.jobDefinitionParameterId; });
                for (var x = 0; x < integrationJobDefinitionParameters.length; x++) {
                    var jobDefinitionParameter = jobDefinitionParameters.filter(p => { return p.id === integrationJobDefinitionParameters[x].jobDefinitionParameterId; })[0];
                    this.jobDefinitionParameters.push({
                        Prompt: jobDefinitionParameter.prompt || jobDefinitionParameter.name,
                        Value: this.getValueForValueType(jobDefinitionParameter.valueType, integrationJobDefinitionParameters[x].value),
                        Sequence: jobDefinitionParameter.sequence
                    });
                }
                this.jobDefinitionParameters = this.jobDefinitionParameters.sort((a, b) => (a.Sequence.toString().localeCompare(b.Sequence.toString(), { kn: true })));

                var integrationJobDefinitionStepParameters = integrationJobParameters.filter(p => { return p.jobDefinitionStepParameterId; });
                for (var y = 0; y < integrationJobDefinitionStepParameters.length; y++) {
                    var jobDefinitionStepParameter = jobDefinitionStepParameters.filter(p => { return p.id === integrationJobDefinitionStepParameters[y].jobDefinitionStepParameterId; })[0];
                    var step = jobDefinitionSteps.filter(p => { return p.id === jobDefinitionStepParameter.jobDefinitionStepId; })[0];
                    this.jobDefinitionStepParameters.push({
                            JobDefinitionStepName: step.name,
                            Prompt: jobDefinitionStepParameter.prompt || jobDefinitionStepParameter.name,
                            Value: this.getValueForValueType(jobDefinitionStepParameter.valueType, integrationJobDefinitionStepParameters[y].value),
                            Sequence: jobDefinitionStepParameter.sequence
                        });
                }
                this.jobDefinitionStepParameters = this.jobDefinitionStepParameters.sort((a, b) => (a.Sequence.toString().localeCompare(b.Sequence.toString(), { kn: true })));
            });
        }

        getValueForValueType(valueType: any, value: any): any {
            if (valueType === "SpecificDateTime") {
                return !isNaN(Date.parse(value)) ? new Date(value).toLocaleString() : value;
            } else {
                return value;
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("JobParametersController", JobParametersController);
}