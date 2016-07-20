module insite_admin {
    import PropertyItem = ExportViewModel.PropertyItem;
    import ExportViewModel = Insite.Admin.Models.ExportViewModel;
    "use strict";

    export class ExportEntitiesController {
        selectedIds: string[];
        pluralizedName: string;
        pluralizedLabel: string;
        assignments: string[];
        exporting: Array<PropertyItem> = [];
        notExporting: Array<PropertyItem> = [];
        exportingReverse: boolean = false;
        notExportingReverse: boolean = false;
        exportAssignment: string;
        exportSelect: string;
        archiveFilter = ArchiveFilter.Active;
        exportFilter = "";
        saved: boolean;

        static $inject = ["$scope", "spinnerService", "exportEntitiesService", "$sessionStorage", "$location", "entityDefinitionService"];

        constructor(
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected exportEntitiesService: IExportEntitiesService,
            protected $sessionStorage: insite.core.IWindowStorage,
            protected $location: ng.ILocationService,
            protected entityDefinitionService: EntityDefinitionService
        ) {
            this.init();
        }

        init() {
            this.selectedIds = this.$sessionStorage.getObject(this.pluralizedName + "_SelectedRecords", []);
            var exportInfo = this.$sessionStorage.getObject(this.pluralizedName + "_ExportInfo", {});
            if (exportInfo) {
                if (<ArchiveFilter>exportInfo.archiveFilter) {
                    this.archiveFilter = <ArchiveFilter>exportInfo.archiveFilter;
                }
                if (exportInfo.filter) {
                    var filterParam = "$filter=";
                    var index = exportInfo.filter.indexOf(filterParam);
                    if (index !== -1) {
                        this.exportFilter = exportInfo.filter.substring(index + filterParam.length);
                    }
                }
            }

            this.exportAssignment = this.pluralizedName;
            this.exportSelect = this.selectedIds.length > 0 ? "selected" : "all";

            this.getExportInfo();
        }

        getExportInfo(): void {
            var name = this.exportAssignment.toLocaleLowerCase();

            this.spinnerService.show();
            this.exporting = [];
            this.notExporting = [];
            this.saved = false;

            this.exportEntitiesService.getExportInfo(name).then((result: ExportViewModel) => {
                var colLength = result.exportColumns ? result.exportColumns.length : 0;
                var propLength = result.properties ? result.properties.length : 0;
                var i = 0, j = 0;
                var exportColValue = null;

                if (this.exportAssignment === this.pluralizedName) {
                    this.assignments = result.assignments;
                }

                //Add exporting properties
                for (i = 0; i < colLength; i++) {
                    exportColValue = result.exportColumns[i];

                    for (j = 0; j < propLength; j++) {
                        if (result.properties[j].value === exportColValue) {
                            this.exporting.push(result.properties[j]);
                            break;
                        }
                    }
                }

                //Now take care not exporting...
                for (i = 0; i < propLength; i++) {
                    var propVal = result.properties[i].value;

                    if (!result.exportColumns || !(~result.exportColumns.indexOf(propVal))) {
                        this.notExporting.push(result.properties[i]);
                    }
                }
            }).finally(() => { this.spinnerService.hide(); });
        }

        saveDefaultSelections(): void {
            var columns = [];
            for (var i = 0; i < this.exporting.length; i++) {
                columns.push(this.exporting[i].value);
            }
            this.exportEntitiesService.saveExportColumns(this.exportAssignment.toLowerCase(), columns).then(() => {
                this.saved = true;
            });
        }

        moveToNotExporting(value: string): void {
            var index = this.findIndexByValue(value, this.exporting);
            var item = this.exporting[index];
            this.notExporting.push(item);
            this.exporting.splice(index, 1);
            this.saved = false;
        }

        moveAllToNotExporting($event): void {
            $event.preventDefault();
            this.notExporting = this.notExporting.concat(this.exporting);
            this.exporting = [];
            this.saved = false;
        }

        moveToExporting(value: string): void {
            var index = this.findIndexByValue(value, this.notExporting);
            var item = this.notExporting[index];
            this.exporting.push(item);
            this.notExporting.splice(index, 1);
            this.saved = false;
        }

        moveAllToExporting($event): void {
            $event.preventDefault();
            this.exporting = this.exporting.concat(this.notExporting);
            this.notExporting = [];
            this.saved = false;
        }

        changeSort(sort: string): void
        {
            if (sort === "exporting")
            {
                this.exportingReverse = !this.exportingReverse;

                if (this.exportingReverse) {
                    this.exporting.sort(function (a, b) {
                        return (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0;
                    });
                } else {
                    this.exporting.sort(function (a, b) {
                        return (b.label < a.label) ? -1 : (b.label > a.label) ? 1 : 0;
                    });
                }
            }
            else
            {
                this.notExportingReverse = !this.notExportingReverse;
            }
        }

        cancel(): void {
            this.$location.url(`/data/${this.pluralizedName}`);
        }

        export(): void {
            var ids = this.exportSelect === "all" ? [] : this.selectedIds;
            var properties = [];
            for (var i = 0; i < this.exporting.length; i++) {
                properties.push(this.exporting[i].value);
            }
            this.spinnerService.show();

            var loadRelations = this.exportAssignment.toLowerCase() !== this.pluralizedName.toLowerCase();

            this.entityDefinitionService.getDefinition(this.pluralizedName).then(result => {
                var entityDefinition = result;

                var query = "";
                if (ids.length > 0) {
                    for (var j = 0; j < ids.length; j++) {
                        ids[j] = loadRelations ? `(${this.pluralizedName}/any(${entityDefinition.name}: ${entityDefinition.name}/id eq ${ids[j]}))` : `(id eq ${ids[j]})`;
                    }
                    query = ids.join(" or ");
                    if (ids.length > 1) {
                        query = `(${query})`;
                    }
                } else {
                    if (!loadRelations && this.exportFilter) {
                        query += this.exportFilter;
                    }

                    if (this.archiveFilter !== ArchiveFilter.Both) {
                        if (loadRelations && entityDefinition && this.hasProperty(entityDefinition.properties, "isActive")) {
                            query += query ? " and " : "";
                            query += `(${this.pluralizedName}/any(${entityDefinition.name}: ${entityDefinition.name}/isActive eq ${this.archiveFilter === ArchiveFilter.Active}))`;
                        }
                        if (!loadRelations) {
                            query += query ? "" : "true";
                            query += `&archiveFilter=${this.archiveFilter}`;
                        }
                    }
                }

                this.exportEntitiesService.sendExportJob(this.pluralizedName, {
                    Assignment: this.exportAssignment,
                    Properties: properties,
                    ExportQuery: query
                }).then((result: any) => {
                    this.$location.url(`/export/${this.pluralizedName}/details/${result.id}`);
                }, () => {
                     this.spinnerService.hide();
                });
            }, () => {
                 this.spinnerService.hide();
            });
        }

        private hasProperty(properties: any[], propertyName: string): boolean {
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].name === propertyName) {
                    return true;
                }
            }
            return false;
        }

        private findIndexByValue(value: string, columns: Array<PropertyItem>): number {
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].value === value) {
                    return i;
                }
            }
            return -1;
        }
    }

    angular
        .module("insite-admin")
        .controller("ExportEntitiesController", ExportEntitiesController)
        .directive("isaExport", <any>function () {
            return {
                restrict: "E",
                templateUrl: "export",
                controller: "ExportEntitiesController",
                controllerAs: "vm",
                bindToController: {
                    pluralizedName: "@",
                    pluralizedLabel: "@"
                },
                scope: {}
            }
        });
}