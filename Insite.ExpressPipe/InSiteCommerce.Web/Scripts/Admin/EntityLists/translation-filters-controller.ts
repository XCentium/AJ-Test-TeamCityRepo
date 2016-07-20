module insite_admin {
    "use strict";

    export class TranslationFilterController {
        entityListCtrl: EntitiesController;
        missingTranslations: boolean;
        missingTranslationsProperty = "custom-missing-translations";
        fieldName: string;

        static $inject = ["$scope"];
        constructor(protected $scope: ng.IScope) {
            this.entityListCtrl = (<any>$scope.$parent).entityListCtrl;
        }

        updateFilters() {
            this.entityListCtrl.filtersCollection.replace(this.entityListCtrl.filtersCollection.getFilters().filter(f => {
                return f.property !== this.missingTranslationsProperty;
            }));

            if (this.missingTranslations) {
                var filter = new ListFilter();
                filter.property = this.missingTranslationsProperty;
                filter.raw = `${this.fieldName} eq ''`;
                this.entityListCtrl.filtersCollection.add(filter);   
            }

            this.entityListCtrl.reloadList();
        }
    }

    angular
        .module("insite-admin")
        .controller("TranslationFilterController", TranslationFilterController)
        .directive("isaTranslationFilters", () => <ng.IDirective>{
            restrict: "E",
            controller: "TranslationFilterController",
            controllerAs: "vm",
            replace: true,
            scope: {
                fieldName: "@"
            },
            bindToController: true,
            template: 
               `<div id="translationDictionaryFilters">
                    <span class="filter-label">Only Show Missing Translations</span>
                    <div class="flip-switch">
                        <input type="checkbox" id="missingTranslations" ng-model="vm.missingTranslations" ng-change="vm.updateFilters()" />
                        <label for="missingTranslations">
                            <div class="switch-inner">
                                <span class="switch-on"><i class="icon icon-check-circle"></i> ON</span>
                                <span class="switch-off"><i class="icon icon-check-circle"></i> OFF</span>
                            </div>
                        </label>
                    </div>
                </div>`
        });
}