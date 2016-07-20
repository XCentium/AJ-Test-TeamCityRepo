module insite_admin {
    "use strict";

    export class EditColumnsController {
        selectedProperties = new Array<string>();
        lockedProperties = new Array<string>();
        unselectedProperties = new Array<string>();

        private formName: string;
        private allLabels = new Array<string>();
        private entityDefinition: any;
        private allProperties = new Array();
        private userProfileId: string;
        private columnPreferenceName: string;
        private userProfilePreferenceId: string;
        private defaultColumns: string;
        private templateName: string;
        private templateId: string;

        static $inject = ["$scope", "FoundationApi", "entityDefinitionService", "$rootScope", "spinnerService", "$http"];
        constructor(
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected entityDefinitionService: EntityDefinitionService,
            protected $rootScope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected $http: ng.IHttpService
        ) {
            this.$scope.$on("editColumns", (event: ng.IAngularEvent, data: any) => {
                this.$foundationApi.publish("editColumns", "open");
                this.formName = data.formName;
                if (!this.formName) {
                    this.formName = data.pluralizedEntityName;
                }
                if (data.templateName || data.templateId) {
                    this.templateName = data.templateName;
                    this.templateId = data.templateId;
                }
                var lockedColumns = typeof (data.lockedColumns) === "undefined" ? [] : data.lockedColumns;
                var columns = data.columns.split(",").filter((o) => lockedColumns.indexOf(o) === -1);
                this.columnPreferenceName = this.formName + "_GridColumns";

                this.$http.get(`/api/v1/admin/forms('${this.formName}')?$select=gridColumns`).success((model) => {
                    this.defaultColumns = (<any>model).gridColumns;
                });

                this.$http.get("/api/v1/admin/userProfiles/current?$select=id").success((model) => {
                    this.userProfileId = (<any>model).id;
                    this.$http.get(`/api/v1/admin/userProfilePreferences?$filter=userProfileId eq ${this.userProfileId} and name eq '${this.columnPreferenceName}'`).success((model) => {
                        var theModel = <any>model;
                        if (theModel.value.length > 0) {
                            this.userProfilePreferenceId = theModel.value[0].id;
                        } else {
                            this.userProfilePreferenceId = "";
                        }
                    });
                });

                this.entityDefinitionService.getDefinition(data.pluralizedEntityName).then(result => {
                    this.entityDefinition = result;
                    this.allProperties = $.map(this.entityDefinition.properties, o => { return { label: o.label, name: o.name, canBeDisplayedInGrid: o.canBeDisplayedInGrid, isHidden: o.isHidden } }).filter(o => o.canBeDisplayedInGrid && !o.isHidden);
                    var availableNames = this.allProperties.map(o => o.name);
                    this.allLabels = this.allProperties.map(o => o.label);
                    this.lockedProperties = lockedColumns.filter((o) => o.toLowerCase() !== "id").map(o => this.allProperties.filter(p => p.name === o)[0].label);
                    this.selectedProperties = columns.filter((o) => o.toLowerCase() !== "id" && availableNames.indexOf(o) !== -1).map(o => this.allProperties.filter(p => p.name === o)[0].label);
                    this.setUnselectedProperties();
                });
            });
        }

        isSelected(columnName: string): boolean {
            if (this.selectedProperties) {
                return this.selectedProperties.indexOf(columnName.toLowerCase()) !== -1;
            } else {
                return true;
            }
        }

        isUnselected(columnName: string, assignment: string): boolean {
            return !this.isSelected(columnName);
        }

        save() {
            var columns = this.selectedProperties.map(sp => this.allProperties.filter(p => p.label === sp)[0].name).join(",");
            var sameAsDefault = columns.toLowerCase() === this.defaultColumns.toLowerCase();
            var uri = "/api/v1/admin/userProfilePreferences";

            var method = "POST";
            var data = {
                value: columns,
                name: this.columnPreferenceName,
                userProfileId: this.userProfileId
            }

            var finish = () => {
                this.$rootScope.$broadcast("EntityListStateChanged", {
                    templateName: this.templateName,
                    templateId: this.templateId
                });
                this.$foundationApi.publish("editColumns", "close");
            }

            if (this.userProfilePreferenceId === "" && sameAsDefault) {
                finish();
                return;
            }

            if (this.userProfilePreferenceId !== "") {
                uri += `(${this.userProfilePreferenceId})`;
                method = "PATCH";

                if (sameAsDefault) {
                    method = "DELETE";
                    data = null;
                }
            }
            
            this.$http({
                method: method,
                url: uri,
                data: data
            }).success(() => {
                finish();
            });
        }

        reset() {
            var allNames = this.allProperties.map(o => o.name);
            this.selectedProperties = this.defaultColumns.split(",").filter((o) => o.toLowerCase() !== "id" && allNames.indexOf(o) >= 0).map(o => {
                var filteredProps = this.allProperties.filter(p => p.name === o || p.name === o + "Id");
                return filteredProps && filteredProps.length > 0 ? filteredProps[0].label : "";
            });
            this.setUnselectedProperties();
        }
        
        move(item: string, $event) {
            $event.preventDefault();
            var index = this.unselectedProperties.indexOf(item);
            if (index > -1) {
                this.unselectedProperties.splice(index, 1);
                this.selectedProperties.push(item);
                return false;
            }
            index = this.selectedProperties.indexOf(item);
            if (index > -1) {
                this.selectedProperties.splice(index, 1);
                this.unselectedProperties.push(item);
                return false;
            }
        }

        moveAllToSelected($event) {
            this.selectedProperties = this.selectedProperties.concat(this.unselectedProperties);
            this.unselectedProperties = new Array<string>();
            $event.preventDefault();
            return false;
        }

        moveAllToUnselected($event) {
            this.unselectedProperties = this.unselectedProperties.concat(this.selectedProperties);
            this.selectedProperties = new Array<string>();
            $event.preventDefault();
            return false;
        }

        private setUnselectedProperties(): void {
            this.unselectedProperties = this.allLabels.filter((o) => this.selectedProperties.indexOf(o) === -1 && this.lockedProperties.indexOf(o) === -1 && o.toLowerCase() !== "id");
        }
    }

    angular
        .module("insite-admin")
        .controller("EditColumnsController", EditColumnsController);
}