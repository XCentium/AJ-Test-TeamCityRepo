module insite_admin {
    "use strict";

    export class LookupDropdownController extends DropdownController {
        keys: string[];
        expands: string[];

        static $inject = ["displayNameService", "lookupsService", "$scope", "$q", "$attrs", "$timeout"];

        constructor(
            protected displayNameService: IDisplayNameService,
            protected lookupsService: ILookupsService,
            protected $scope: ng.IScope,
            protected $q: any,
            protected $attrs: ng.IAttributes,
            protected $timeout: ng.ITimeoutService
        ) {
            super(lookupsService, $scope, $q, $attrs, $timeout);
        }

        getLookupsFor(term: string = "", count: number = 250): ng.IPromise<any> {
            this.keys = this.keys ? this.keys : this.displayNameService.getDisplayNameFormatKeys(this.$attrs["pluralizedEntityName"]);
            this.expands = this.expands ? this.expands : this.displayNameService.getDisplayNameFormatExpands(this.$attrs["pluralizedEntityName"]);

            var filter = term.length > 0 ? `&$filter=contains(${this.getFilterQuery()},'${term}')` : "";
            var orderBy = this.keys.length > 0 && this.sortList ? `&$orderby=${this.keys.join(",")}` : "";
            var uri = `/api/v1/admin/${this.$attrs["pluralizedEntityName"]}?&archiveFilter=${ArchiveFilter.Active}&$skip=0&$top=${count}&$count=true${orderBy}${filter}&$select=id,${this.keys.join(",")}&$expand=${this.expands.join(",")}`;
            var deferred = this.$q.defer();
            this.lookupsService.getLookupsForLookupDropDown(this.$attrs["pluralizedEntityName"], uri).then(result => {
                if (typeof (this.$attrs["nullOptionText"]) !== "undefined") {
                    result.unshift({ id: null, name: this.$attrs["nullOptionText"] });
                }
                this.addCurrentValueListOption(result, term).then(o => {
                    this.lookups = o;
                    deferred.resolve(o);
                });
            });
            return deferred.promise;
        }

        onSelectedEntityIdForDropDownChange(newValue: string, oldValue: string) {
            if (newValue === undefined && oldValue !== undefined) {
                return;
            } else if (newValue === undefined) {
                this.selectedEntityIdForDropDown = "";
            }

            this.selectedEntityIdForDropDown = (this.selectedEntityIdForDropDown === "00000000-0000-0000-0000-000000000000") ? "" : this.selectedEntityIdForDropDown;
            var isGuid = this.displayNameService.isGuid(this.selectedEntityIdForDropDown);
            // checkValidity won't trigger if user will press tab
            this.$scope["sharedDropdownCtrl"].isValid = !(this.selectedEntityIdForDropDown && !isGuid);
            this.selectedEntityId = (this.selectedEntityIdForDropDown === "" || !isGuid) ? this.getEmptyValue() : this.selectedEntityIdForDropDown;
        }

        private getEmptyValue(): any {
            if (this.required) {
                return "";
            } else {
                return !this.selectedEntityId ? this.selectedEntityId : null;
            }
        }

        private addCurrentValueListOption(currentLookups: any, term: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            if (!this.selectedEntityId || term || this.selectedEntityId === "00000000-0000-0000-0000-000000000000" ||
                currentLookups.filter(l => { return l.id === this.selectedEntityId; }).length > 0 || !this.displayNameService.isGuid(this.selectedEntityId)) {
                deferred.resolve(currentLookups);
                return deferred.promise;
            }

            var uri = `/api/v1/admin/${this.$attrs["pluralizedEntityName"]}?&$filter=id eq ${this.selectedEntityId}&$select=id,${this.keys.join(",")}&$expand=${this.expands.join(",")}`;
            this.lookupsService.getLookupsForLookupDropDown(this.$attrs["pluralizedEntityName"], uri).then(result => {
                currentLookups.push(result[0]);
                deferred.resolve(currentLookups);
            });
            return deferred.promise;
        }

        private getFilterQuery(): string {
            var parts = this.displayNameService.getDisplayNameFormat(this.$attrs["pluralizedEntityName"]).split(/[{}]+/);
            var result = "", index = 0;
            for (var key in parts) {
                if (parts.hasOwnProperty(key)) {
                    var current = parts[key];
                    if (current) {
                        current = this.keys.indexOf(current) === -1 ? `'${current}'` : current;
                        result = index > 0 ? `concat(${result}, ${current})` : result + current;
                        index++;
                    }
                }
            }

            return result;
        }
    }

    angular
        .module("insite-admin")
        .controller("LookupDropdownController", LookupDropdownController);
}