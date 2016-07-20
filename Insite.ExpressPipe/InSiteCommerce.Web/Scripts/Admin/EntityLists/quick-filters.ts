module insite_admin {
    import QuickFilterModel = Insite.Admin.Models.QuickFilterModel;
    "use strict";

    export class QuickFiltersController {
        onChange: Function;
        availableQuickFilters: QuickFilterModel[];
        selectedQuickFilterProperty: QuickFilterModel;
        filtersCollection: ListFilterCollection;
        quickFilterValue: string;
        private quickFilterTimerId: number;
        private quickFilterTimeoutInMilliseconds = 500; 
        
        static $inject = [];

        applyQuickFilter() {
            clearTimeout(this.quickFilterTimerId);
            this.quickFilterTimerId = setTimeout(() => {
                this.filtersCollection.applyQuickFilter({
                    property: this.selectedQuickFilterProperty.name,
                    value: this.quickFilterValue,
                    operator: this.selectedQuickFilterProperty.operator,
                    propertyType: this.selectedQuickFilterProperty.propertyType,
                    lookupPluralizedName: this.selectedQuickFilterProperty.lookupPluralizedName,
                    dynamicDropdownDisplay: this.selectedQuickFilterProperty.dynamicDropdownDisplay
                });
                this.onChange();
            }, this.quickFilterTimeoutInMilliseconds);
        }

        restoreQuickFilter(): void {
            const quickFilter = this.filtersCollection.getQuickFilter();

            if (quickFilter !== null && quickFilter !== undefined) {
                for (var x = 0; x < this.availableQuickFilters.length; x++) {
                    if (this.availableQuickFilters[x].name === quickFilter.property) {
                        this.selectedQuickFilterProperty = this.availableQuickFilters[x];
                        this.quickFilterValue = quickFilter.value;
                    }
                }
            }

            if (!this.selectedQuickFilterProperty) {
                this.selectedQuickFilterProperty = this.availableQuickFilters[0];
            }
        }
    }

    var quickFilterDirective: ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            restrict: "E",
            controller: "quickFiltersController",
            controllerAs: "vm",
            scope: {
                onChange: "&",
                availableQuickFilters: "=",
                filtersCollection: "=",
                filtersLoaded: "="
            },
            bindToController: true,
            template: `<span class="quick-filter ng-cloak" ng-if="vm.filtersLoaded" ng-show="vm.availableQuickFilters.length">
                        <select ng-model="vm.selectedQuickFilterProperty"
                            ng-init="vm.restoreQuickFilter()" ng-change="vm.applyQuickFilter()"
                            ng-options="option as option.label for option in vm.availableQuickFilters"></select>
                        <span class="inline-label">
                            <input type="text" id="quick-filter" ng-model="vm.quickFilterValue" ng-change="vm.applyQuickFilter()" />
                            <span class="form-label remove-quick-filter">
                                <i class="icon icon-close" ng-show="vm.quickFilterValue" ng-click="vm.quickFilterValue = ''; vm.applyQuickFilter()"></i>
                            </span>
                            <span class="form-label"><i class="icon icon-search"></i></span>
                        </span>
                       </span>`
        };
        return directive;
    }

    angular
        .module("insite-admin")
        .controller("quickFiltersController", QuickFiltersController)
        .directive("isaQuickFilter", quickFilterDirective);
}