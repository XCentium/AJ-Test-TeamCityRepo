module insite_admin {
    "use strict";

    export class StandardDropdownController extends DropdownController {
        allLookups: any;

        getLookupsFor(term: string = "", count: number = 250): ng.IPromise<any> {
            var deferred = this.$q.defer();

            if (!this.allLookups) {
                var listOptions = this.$attrs["listOptions"].split("||");
                var currentLookups = [];
                for (var x = 0; x < listOptions.length; x++) {
                    var parts = listOptions[x].split("|");
                    currentLookups.push({ id: parts.length > 1 ? parts[1] : parts[0], name: parts[0] });
                }
                this.allLookups = currentLookups;
                this.lookups = this.allLookups.filter(o => { return o.name.toLowerCase().indexOf(term.toLowerCase()) >= 0; });
                deferred.resolve(this.lookups);
            } else {
                this.lookups = this.allLookups.filter(o => { return o.name.toLowerCase().indexOf(term.toLowerCase()) >= 0; });
                deferred.resolve(this.lookups);
            }

            return deferred.promise;
        }

        onSelectedEntityIdForDropDownChange(newValue: string, oldValue: string) {
            if (newValue === undefined && oldValue !== undefined) {
                this.selectedEntityIdForDropDown = oldValue;
                return;
            }

            if (this.selectedEntityIdForDropDown) {
                this.selectedEntityId = this.selectedEntityIdForDropDown;
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("StandardDropdownController", StandardDropdownController);
}