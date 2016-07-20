module insite_admin {
    "use strict";

    export class DropdownController {
        selectedEntityId: any;
        selectedEntityIdForDropDown: any;
        sortList: boolean;
        disabled: string;
        required: boolean;
        isValid: boolean = true;
        selectedItem: any;
        lookups: any;
        dataSource: kendo.data.DataSource;
        allowManualEntry: boolean;

        static $inject = ["lookupsService", "$scope", "$q", "$attrs", "$timeout"];

        constructor(
            protected lookupsService: ILookupsService,
            protected $scope: ng.IScope,
            protected $q: any,
            protected $attrs: ng.IAttributes,
            protected $timeout: ng.ITimeoutService
        ) {
            this.init();
        }

        init() {
            this.dataSource = new kendo.data.DataSource({
                serverFiltering: true,
                serverPaging: true,
                pageSize: 50,
                transport: {
                    read: (options) => {
                        this.getLookupsFor(options.data.filter && options.data.filter.filters.length > 0 ? options.data.filter.filters[0].value : "", 250).then(result => {
                            this.makeDropDownCaseInsensitive(result);
                            this.$timeout(() => options.success(result), 0);
                            this.afterGetLookupsFor();
                        });
                    }
                }
            });

            this.$scope["itemsDataSource"] = this.dataSource;
            this.selectedEntityIdForDropDown = this.selectedEntityId;

            this.$scope.$watch("sharedDropdownCtrl.selectedEntityIdForDropDown", (newValue, oldValue) => {
                this.onSelectedEntityIdForDropDownChange(newValue, oldValue);
            }, false);

            this.$scope.$watch("sharedDropdownCtrl.selectedEntityId", () => {
                this.selectedEntityIdForDropDown = this.selectedEntityId;
            }, false);
        }

        makeDropDownCaseInsensitive(result: any) {
            if (!result || !this.selectedEntityId) {
                return;
            }

            for (var x = 0, length = result.length; x < length; x++) {
                if (result[x].id && result[x].id.toLowerCase() === this.selectedEntityId.toLowerCase()) {
                    result[x].id = this.selectedEntityId;
                    break;
                }
            }
        }

        getLookupsFor(term: string = "", count: number = 250): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.lookups = [];
            deferred.resolve(this.lookups);
            return deferred.promise;
        }

        afterGetLookupsFor() {
        }

        onSelectedEntityIdForDropDownChange(newValue: string, oldValue: string) {
        }

        dataBound(e: any) {
            e.sender.input.on("click", () => {
                e.sender.open();
            });

            e.sender.input.on("blur", () => {
                var filteredLookups = this.lookups.filter(o => { return o.id; });
                if (filteredLookups.length === 1) {
                    this.selectedEntityIdForDropDown = filteredLookups[0].id;
                }

                this.$scope["sharedDropdownCtrl"].touched = true;
                this.$scope.$apply();
            });
        }

        checkValidity() {
            return !(this.selectedEntityIdForDropDown && this.lookups && !this.lookups.some((x) => { return x.id === this.selectedEntityIdForDropDown }) && !this.allowManualEntry);
        }
    }

    angular
        .module("insite-admin")
        .controller("DropdownController", DropdownController)
        .directive("isaDropdown", ["$q", "$http", () => {
            return {
                require: ["ngModel", "^form"],
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "@",
                name: "angularController",
                controllerAs: "sharedDropdownCtrl",
                scope: {
                    model: "="
                },
                bindToController: {
                    selectedEntityId: "=",
                    filter: "@",
                    display: "@",
                    route: "@",
                    sortList: "@",
                    disabled: "@",
                    required: "=",
                    id: "@",
                    label: "@",
                    allowManualEntry: "="
                },
                templateUrl: "sharedKendoDropDown",
                link: (scope, elem, attr, ctrls) => {
                    ctrls[0].$validators.dropDawnValidator = () => {
                        scope.sharedDropdownCtrl.isValid = scope.sharedDropdownCtrl.checkValidity();
                        return scope.sharedDropdownCtrl.isValid;
                    };

                    scope.sharedDropdownCtrl.form = ctrls[1];
                }
            }
        }]);
}