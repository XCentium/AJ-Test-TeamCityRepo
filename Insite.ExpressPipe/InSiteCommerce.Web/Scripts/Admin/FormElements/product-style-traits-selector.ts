module insite_admin.formElements {
    "use strict";

    export class ProductStyleTraitsSelectorController {
        public initialModel: any;
        public model: any;
        additionalDirtyChecks: { dirtyCheckName: string, checker(model: any, initialModel: any): boolean; }[] = [];
        public modelChanged: boolean;

        public styleClass: any;
        public selectedStyleTrait: any;
        public styleParent: any;
        public styleTraitValues: any;

        serviceUri: string;

        static $inject = ["$http", "$scope", "spacelessFilter"];

        constructor(protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spacelessFilter: any) {
            this.init();
        }

        init() {
            this.serviceUri = `/api/v1/admin/`;
            this.additionalDirtyChecks.push({
                dirtyCheckName: "styleTraitsDirtyChecker",
                checker: (model, initialModel) => {
                    return this.compareCurrentStyleTraitValuesWithInitial(this.currentStyleTraitValues());
                }
            });
            if (this.model.styleParentId) {
                this.$http.get(`${this.serviceUri}products(${this.model.id})?$expand=StyleTraitValues,StyleParent($expand=StyleClass)`)
                    .success((object: any) => {
                        this.styleTraitValues = object.styleTraitValues;
                        this.styleParent = object.styleParent;
                        this.$http.get(`${this.serviceUri}StyleClasses(${this.styleParent.styleClass.id})?$expand=StyleTraits($expand=StyleTraitValues)`)
                            .success((object: any) => {
                                this.styleParent.styleClass = object;
                                this.styleClass = object;
                                this.prepareDropDowns();
                            });
                    });
            }
            this.$scope.$on("EntitySaved", (event: ng.IAngularEvent, key: string) => {
                this.saveReference();
            });
        }

        prepareDropDowns() {
            this.selectedStyleTrait = {};
            this.styleClass.styleTraits.forEach(t => {
                var dataSource = new kendo
                    .data.DataSource({
                    data: t.styleTraitValues.map((v) => { return { "name": v.value, "id": v.id } })
                });
                this.$scope["itemsDataSource" + this.spacelessFilter(t.name)] = dataSource;
                this.$scope.$watch("vm.selectedStyleTrait['" + t.name + "']", (newValue) => {
                    if (this.selectedStyleTrait[t.name] === "" || this.selectedStyleTrait[t.name] === "00000000-0000-0000-0000-000000000000") {
                        this.selectedStyleTrait[t.name] = null;
                    }
                    var currentTraitValues = this.currentStyleTraitValues();
                    if (this.compareCurrentStyleTraitValuesWithInitial(currentTraitValues)) {
                        this.modelChanged = true;
                    }
                }, false);
            });
            this.selectInitialModel();
        }

        selectInitialModel() {
            this.styleClass.styleTraits.forEach(t => {
                var currentTraitValue = this.styleTraitValues.find((x) => { return x.styleTraitId == t.id });
                this.selectedStyleTrait[t.name] = currentTraitValue ? currentTraitValue.id : null;
            });
        }

        currentStyleTraitValues(): any[] {
            var result = [];
            if (this.styleClass) {
                this.styleClass.styleTraits.forEach(t => {
                    if (this.selectedStyleTrait[t.name] !== null) {
                        result.push(t.styleTraitValues.find(x => x.id == this.selectedStyleTrait[t.name]));
                    }
                });
            }
            return result;
        }

        compareCurrentStyleTraitValuesWithInitial(current: any[]): boolean {
            if (current.some(c => this.styleTraitValues.every(s => s.id != c.id)))
                return true;
            if (this.styleTraitValues.some(c => current.every(s => s.id != c.id)))
                return true;
            return false;
        }

        saveReference(): any {
            var current = this.currentStyleTraitValues();
            var referenceToUpdate: any = {};
            referenceToUpdate.name = "styleTraitValues";
            referenceToUpdate.deleteUrl = `${this.serviceUri}products(${this.model.id})/StyleTraitValues/$ref`;
            referenceToUpdate.deleteData = { value: this.styleTraitValues ? this.styleTraitValues.map(x => x.id) : [] };
            referenceToUpdate.createUrl = `${this.serviceUri}products(${this.model.id})/StyleTraitValues/$ref`;
            referenceToUpdate.createData = { "value": current.map(x => x.id) };

            this.$http.delete(referenceToUpdate.deleteUrl, {
                data: referenceToUpdate.deleteData,
                headers: { "Content-Type": "application/json;charset=utf-8" }
            }).success(() => {
                this.$http.put(referenceToUpdate.createUrl, referenceToUpdate.createData)
                    .success(() => {
                        var current = this.currentStyleTraitValues();
                        this.styleTraitValues = current;
                    });
            });

            return referenceToUpdate;
        }
    }

    angular
        .module("insite-admin")
        .controller("ProductStyleTraitsSelectorController", ProductStyleTraitsSelectorController)
        .directive("isaProductStyleTraitsSelector", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "ProductStyleTraitsSelector",
                controller: "ProductStyleTraitsSelectorController",
                controllerAs: "vm",
                bindToController: {
                    initialModel: "=",
                    model: "=",
                    additionalDirtyChecks: "=",
                    modelChanged: "="
                },
                scope: {}
            }
        });
}