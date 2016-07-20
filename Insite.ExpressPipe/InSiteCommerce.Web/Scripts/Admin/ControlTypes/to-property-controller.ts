module insite_admin {
    "use strict";

    export class ToPropertyController {
        selectedEntityId: any;
        disabled: string;
        isDisplay: boolean;

        allPossibleLookups: any;
        lookups: any;

        static $inject = ["$scope", "$http"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService
        ) {
            this.init();
        }

        init() {
            this.$scope.$watchGroup(["model.id", "model.fieldType"], () => {
                this.getAllLookups();
            });
        }

        getAllLookups() {
            if (!this.allPossibleLookups) {
                var isNew = !this.$scope["model"].id || this.$scope["model"].id === "00000000-0000-0000-0000-000000000000";
                var uri = isNew ? `/api/v1/admin/jobdefinitionsteps(${this.$scope["model"].jobDefinitionStepId})`
                    : `/api/v1/admin/jobdefinitionstepfieldmaps(${this.$scope["model"].id})?$expand=jobdefinitionstep`;
                this.$http.get(uri).success(object => {
                    var objectName = isNew ? (<any>object).objectName
                        : (<any>object).jobDefinitionStep.objectName;
                    var uri2 = `/api/v1/admin/entitydefinitions('${objectName}')/properties`;
                    this.$http.get(uri2).success(entityDefinition => {
                        var currentLookups = [];
                        var properties = (<any>entityDefinition).value
                            .filter(p => { return p.canEdit === true; })
                            .filter(p => { return p.name !== "customProperties"; })
                            .sort((a, b) => (a.label.localeCompare(b.label)));
                        for (var x = 0; x < properties.length; x++) {
                            var id = properties[x].name.charAt(0).toUpperCase() + properties[x].name.slice(1);
                            if (id.toLowerCase() === this.selectedEntityId.toLowerCase() && id !== this.selectedEntityId) {
                                id = this.selectedEntityId;
                            }
                            currentLookups.push({ id: id, name: properties[x].label, propertyType: properties[x].propertyTypeDisplay || "", collectionEntity: this.getEntityForCollection(properties[x].propertyTypeDisplay || "") });
                        }
                        this.allPossibleLookups = currentLookups;
                        this.filterManyToManyCollections(objectName);
                        this.filterLookupsByFieldType();
                    });
                });
            }

            this.filterLookupsByFieldType();
        }

        filterManyToManyCollections(objectName: any) {
            var collectionLookups = this.allPossibleLookups.filter(l => { return l.propertyType.indexOf("Insite.Data.Entities.") >= 0 });
            for (var x = 0, length = collectionLookups.length; x < length; x++) {
                var uri = `/api/v1/admin/entitydefinitions?$filter=name eq '${this.getEntityForCollection(collectionLookups[x].propertyType)}'&$select=name,properties&$expand=properties`;
                this.$http.get(uri).success(entityDefinition => {
                    if (!entityDefinition || !(<any>entityDefinition).value || !(<any>entityDefinition).value[0] || !(<any>entityDefinition).value[0].properties) {
                        return;
                    }
                    if ((<any>entityDefinition).value[0].properties.filter(o => {
                        return o.propertyTypeDisplay.indexOf("System.Collections.Generic.ICollection") >= 0
                            && o.propertyTypeDisplay.toLowerCase().indexOf(`Insite.Data.Entities.${objectName}`.toLowerCase()) >= 0;
                    }).length === 0) {
                        this.allPossibleLookups = this.allPossibleLookups.filter(o => { return o.collectionEntity.toLowerCase() !== (<any>entityDefinition).value[0].name.toLowerCase(); });
                        this.filterLookupsByFieldType();
                    }
                });
            }
        }

        getEntityForCollection(propertyTypeDisplay: any) {
            var index = propertyTypeDisplay.indexOf("Insite.Data.Entities.");
            if (index === 1) {
                return propertyTypeDisplay;
            }

            var entityName = propertyTypeDisplay.substr(index).substr("Insite.Data.Entities.".length, propertyTypeDisplay.substr(index).indexOf(",") - "Insite.Data.Entities.".length);
            return entityName.substr(0, 1).toLowerCase() + entityName.substr(1);
        }

        filterLookupsByFieldType() {
            if (!this.allPossibleLookups) {
                return;
            }

            if (this.$scope["model"].fieldType === "Lookup") {
                this.lookups = this.allPossibleLookups.filter(l => { return l.propertyType.indexOf("Insite.Data.Entities") >= 0 });
            } else if (this.$scope["model"].fieldType === "ChildCollection") {
                this.lookups = this.allPossibleLookups.filter(l => { return l.propertyType.indexOf("System.Collections.Generic.ICollection") >= 0 });
            } else if (this.$scope["model"].fieldType === "Content") {
                this.lookups = this.allPossibleLookups.filter(l => { return l.propertyType.indexOf("Insite.Data.Entities.ContentManager") >= 0 });
            } else {
                this.lookups = this.allPossibleLookups.filter(l => { return l.propertyType.indexOf("Insite.Data.Entities") === -1 && l.propertyType.indexOf("System.Collections.Generic.ICollection") === -1 });
            }
        }

        getLabelForSelectedEntityId(): string {
            return !this.selectedEntityId || !this.allPossibleLookups || this.allPossibleLookups.filter(l => { return l.id === this.selectedEntityId }).length === 0
                ? this.selectedEntityId
                : this.allPossibleLookups.filter(l => { return l.id === this.selectedEntityId })[0].name;
        }
    }

    angular
        .module("insite-admin")
        .controller("ToPropertyController", ToPropertyController);
}