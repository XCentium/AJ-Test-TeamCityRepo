module insite_admin {
    "use strict";

    export class CriteriaPropertyDropdownController {
        selectedEntityId: any;
        disabled: string;
        form: any;
        name: string;
        label: string;
        key: string;
        visible = false;
        criteriatypes: any;
        options: any[];

        static $inject = ["$scope", "$http", "entityDefinitionService"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected entityDefinitionService: EntityDefinitionService
        ) {
            this.init();
        }

        init() {
            this.$http.get("/api/v1/admin/criteriatypes").then((result: any) => {
                this.criteriatypes = result.data.value;
                this.$scope.$watchGroup(["model.criteriaType", "model.criteriaObject"], () => {
                    this.modelChanged();
                });

                // edit init
                this.modelChanged();
            });
        }

        modelChanged(): void {
            var criterias = this.criteriatypes.filter(x => x.name === this.$scope["model"].criteriaType);
            if (criterias.length === 1) {
                this.visible = criterias[0].requiresCriteriaProperty && this.$scope["model"].criteriaObject;
                if (!this.visible) {
                    this.$scope["model"].criteriaProperty = "";
                    return;
                }
                if (this.$scope["model"].criteriaType === "CustomProperty") {
                    this.loadCustomProperties();
                } else {
                    this.loadObjectProperties();
                }
            } else {
                this.visible = false;
            }
        }

        private loadCustomProperties(): void {
            this.$http.get(`/api/v1/admin/customproperties?$filter=parentTable eq '${this.$scope["model"].criteriaObject}'&$select=name`).then((result: any) => {
                var props = {};
                for (var i = 0; i < result.data.value.length; i++) {
                    props[result.data.value[i].name] = true;
                }
                this.options = [{ value: "All Properties", label: "All Properties" }];
                for (var key in props) {
                    if (props.hasOwnProperty(key)) {
                        this.options.push({ value: key, label: key });
                    }
                }
                this.setAllProperties();
            });
        }

        private loadObjectProperties(): void {
            var criteriaObject = this.$scope["model"].criteriaObject[0].toLowerCase() + this.$scope["model"].criteriaObject.substring(1);
            this.entityDefinitionService.getDefinition(criteriaObject, "name").then((result: any) => {
                this.options = [{ value: "All Properties", label: "All Properties" }];
                for (var prop in result.properties) {
                    if (result.properties.hasOwnProperty(prop) && result.properties[prop].canBeDisplayedInGrid && result.properties[prop].name) {
                        var value = result.properties[prop].name[0].toUpperCase() + result.properties[prop].name.substring(1);
                        this.options.push({
                            value: value,
                            label: result.properties[prop].label
                        });
                    }
                }
                this.setAllProperties();
            });
        }

        private setAllProperties(): void {
            var found = false;
            for (var i = 0; i < this.options.length; i++) {
                if (this.options[i].value === this.$scope["model"].criteriaProperty) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.$scope["model"].criteriaProperty = this.options[0].value;
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("CriteriaPropertyDropdownController", CriteriaPropertyDropdownController);
}