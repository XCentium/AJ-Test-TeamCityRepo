module insite_admin {
    "use strict";

    export class CriteriaObjectDropdownController {
        selectedEntityId: any;
        disabled: string;
        form: any;
        name: string;
        label: string;
        key: string;
        visible = false;
        criteriatypes: any[];
        readOnlyValue: string;
        entityDefinitions: any[];
        options: any[];
        displayEmptyOption = true;

        static $inject = ["$scope", "$http", "entityDefinitionService"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected entityDefinitionService: EntityDefinitionService
        ) {
            this.init();
        }

        init() {
            this.entityDefinitionService.getAllDefinitions("name,pluralizedName,label").then((result: any) => {
                this.entityDefinitions = result.data.value;

                this.$http.get("/api/v1/admin/criteriatypes").then((result: any) => {
                    this.criteriatypes = result.data.value;
                    this.$scope.$watchGroup(["model.criteriaType"], () => {
                        this.modelChanged();
                    });

                    this.modelChanged();
                });
            });
        }

        modelChanged(): void {
            var criterias = this.criteriatypes.filter(x => x.name === this.$scope["model"].criteriaType);
            if (criterias.length === 1) {
                this.visible = criterias[0].requiresCriteriaObject || criterias[0].lookupObject;
                if (!this.visible) {
                    this.$scope["model"].criteriaObject = "";
                    return;
                }

                if (criterias[0].lookupObject) {
                    this.$scope["model"].criteriaObject = criterias[0].lookupObject;
                }

                this.readOnlyValue = this.$scope["model"].criteriaObject;
                if (criterias[0].requiresCriteriaObject && !this.readOnlyValue) {
                    this.options = [];
                    for (var i = 0; i < this.entityDefinitions.length; i++) {
                        var name = this.entityDefinitions[i].name[0].toUpperCase() + this.entityDefinitions[i].name.substring(1);
                        this.options.push({ value: name, label: this.entityDefinitions[i].label });
                    }
                }
            } else {
                this.visible = false;
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("CriteriaObjectDropdownController", CriteriaObjectDropdownController);
}