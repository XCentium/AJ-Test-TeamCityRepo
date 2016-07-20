module insite_admin {
    "use strict";

    export class EnumDropdownController extends DropdownController {
        allLookups: any;

        static $inject = ["lookupsService", "$scope", "$q", "$attrs", "$timeout"];

        constructor(
            protected lookupsService: ILookupsService,
            protected $scope: ng.IScope,
            protected $q: any,
            protected $attrs: ng.IAttributes,
            protected $timeout: ng.ITimeoutService
        ) {
            super(lookupsService, $scope, $q, $attrs, $timeout);
        }

        getLookupsFor(term: string = "", count: number = 250): ng.IPromise<any> {
            var deferred = this.$q.defer();

            if (!this.allLookups) {
                var uri = `/admin/Enums?type=${this.$attrs["enumClassName"]}`;
                this.lookupsService.getLookupsForEnumDropDown(uri, "Value", "Name").then(result => {
                    this.allLookups = this.sortList ? result.sort((a, b) => (a.name.localeCompare(b.name))) : result;
                    this.lookups = this.allLookups.filter(o => { return o.name.toLowerCase().indexOf(term.toLowerCase()) >= 0; });
                    deferred.resolve(this.lookups);
                });
            } else {
                this.lookups = this.allLookups.filter(o => { return o.name.toLowerCase().indexOf(term.toLowerCase()) >= 0; });
                deferred.resolve(this.lookups);
            }

            return deferred.promise;
        }

        onSelectedEntityIdForDropDownChange(newValue: string, oldValue: string) {
            if (newValue === undefined && oldValue !== undefined) {
                return;
            }

            this.selectedEntityId = this.selectedEntityIdForDropDown;
        }
    }

    angular
        .module("insite-admin")
        .controller("EnumDropdownController", EnumDropdownController);
}