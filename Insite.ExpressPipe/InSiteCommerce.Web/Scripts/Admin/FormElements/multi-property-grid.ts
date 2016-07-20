module insite_admin.formElements {
    "use strict";

    export class MultiPropertyGridController {
        model: any;
        entityDefinition: any;
        label: string;
        propertyDefinitionNames: string;

        propertyNames: any;
        propertyValues: any;
        propertyLabels: any;

        selectedIndexes: any = [];

        static $inject = ["$scope", "$timeout"];

        constructor(
            protected $scope: ng.IScope,
            protected $timeout: ng.ITimeoutService) {

            this.$scope.$watchGroup(["multiPropertyGridCtrl.model", "multiPropertyGridCtrl.entityDefinition", "multiPropertyGridCtrl.propertyDefinitionNames"], () => {
                this.setupGrid();
            });
        }

        setupGrid() {
            if (!this.model || !this.entityDefinition || !this.propertyDefinitionNames) {
                return;
            }

            // names of the properties on the model that contain comma delimited lists / arrays
            this.propertyNames = this.propertyDefinitionNames.split(",");

            // get labels for property names
            this.propertyLabels = [];
            for (var w = 0; w < this.propertyNames.length; w++) {
                var entityDefinitionProperty = this.entityDefinition.properties.filter(o => o.name === this.propertyNames[w]);
                this.propertyLabels.push(entityDefinitionProperty[0].label);
            }

            // get number of rows
            var numberOfRows = 99999;
            for (var x = 0; x < this.propertyNames.length; x++) {
                if (this.model[this.propertyNames[x]].split(",").length < numberOfRows) {
                    numberOfRows = this.model[this.propertyNames[x]].split(",").length;
                }
            }

            // populate row data
            this.propertyValues = [];
            for (var y = 0; y < numberOfRows; y++) {
                var rowValues = [];
                for (var z = 0; z < this.propertyNames.length; z++) {
                    rowValues.push({value: this.model[this.propertyNames[z]].split(",")[y]});
                }
                this.propertyValues.push(rowValues);
            }
        }

        addRecord() {
            // add to properties directly on model then setup grid again
            for (var x = 0; x < this.propertyNames.length; x++) {
                this.model[this.propertyNames[x]] = this.model[this.propertyNames[x]] + ",";
            }

            this.setupGrid();
        }

        deleteRecord() {
            // remove the properties from the array, then set the property on the model, then setup grid again

            // make sure to sort numerically descending
            this.selectedIndexes = this.selectedIndexes.sort((a, b) => (b - a));

            // remove the records at the selected indexes
            for (var x = 0; x < this.selectedIndexes.length; x++) {
                this.propertyValues.splice(this.selectedIndexes[x], 1);
            }

            // update the properties on the model
            for (var y = 0; y < this.propertyNames.length; y++) {
                var propertyValues = [];
                for (var z = 0; z < this.propertyValues.length; z++) {
                    propertyValues.push(this.propertyValues[z][y]);
                }
                this.model[this.propertyNames[y]] = propertyValues.map(elem => elem.value).join();
            }

            this.selectedIndexes = [];
            this.setupGrid();
        }

        onColumnChange() {
            for (var y = 0; y < this.propertyNames.length; y++) {
                var propertyValues = [];
                for (var z = 0; z < this.propertyValues.length; z++) {
                    propertyValues.push(this.propertyValues[z][y]);
                }
                this.model[this.propertyNames[y]] = propertyValues.map(elem => elem.value).join();
            }
        }

        isSelected(index: string): boolean {
            return this.selectedIndexes.indexOf(index) >= 0;
        }

        updateSelected($event, index): void {
            var checkbox = $event.target;
            if (checkbox.checked) {
                this.selectedIndexes.push(index);
            } else {
                this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
            }
        }

        areNoneSelected(): boolean {
            return this.selectedIndexes.length === 0;
        }

        selectAll(): void {
            this.selectedIndexes = [];
            for (var x = 0; x < this.propertyValues.length; x++) {
                this.selectedIndexes.push(x);
            }
        }

        unselectAll(): void {
            this.selectedIndexes = [];
        }
    }

    angular
        .module("insite-admin")
        .controller("MultiPropertyGridController", MultiPropertyGridController)
        .directive("isaMultiPropertyGrid", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "MultiPropertyGridController",
                controllerAs: "multiPropertyGridCtrl",
                scope: {},
                bindToController: {
                    model: "=",
                    entityDefinition: "=",
                    label: "@",
                    propertyDefinitionNames: "@"
                },
                templateUrl: "MultiPropertyGrid"
            }
        });
}