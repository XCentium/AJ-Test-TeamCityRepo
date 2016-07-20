module insite_admin {
    "use strict";

    export class EditTraitsController {
        collectionName: string;
        childrenColumn: string;
        model: any;
        displayName: string;

        public styleClass: any;
        public selectedStyleTrait: any;
        public styleParent: any;
        public styleTraitValues: any;
        public modelIsDirty: boolean;

        serviceUri: string;

        hasChangedAssignments: boolean;
        popupOpened = false;

        static $inject = [
            "$rootScope",
            "$http",
            "$scope",
            "FoundationApi",
            "spinnerService",
            "entityDefinitionService",
            "spacelessFilter",
            "notificationService"];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected spinnerService: ISpinnerService,
            protected entityDefinitionService: EntityDefinitionService,
            protected spacelessFilter: any,
            protected notificationService: INotificationService
        ) {
            this.serviceUri = `/api/v1/admin/`;
            var name = `editEvent-${this.collectionName}-${this.childrenColumn}`;
            this.$scope.$on(name, (event: ng.IAngularEvent, data: any) => {
                this.model = data.model;
                this.popupOpened = true;
                this.$http.get(`${this.serviceUri}products(${this.model.id})?$expand=StyleTraitValues,StyleParent($expand=StyleClass)`)
                    .success((object: any) => {
                        this.styleTraitValues = object.styleTraitValues;
                        this.styleParent = object.styleParent;
                        this.$http.get(`${this.serviceUri}StyleClasses(${this.styleParent.styleClass.id})?$expand=StyleTraits($expand=StyleTraitValues)`)
                            .success((object: any) => {
                                this.styleParent.styleClass = object;
                                this.styleClass = object;
                                this.prepareDropDowns();
                                this.modelIsDirty = false;
                            });
                    });
                this.$foundationApi.publish(`editTraits-${this.collectionName}-${this.childrenColumn}-modal`, "open");
            });
        }

        prepareDropDowns() {
            this.selectedStyleTrait = {};
            this.styleClass.styleTraits.forEach(t => {
                var dataSource = new kendo.data.DataSource({
                    data: t.styleTraitValues.map((v) => { return { "name": v.value, "id": v.id } })
                });
                this.$scope[`itemsDataSource${this.collectionName}${this.childrenColumn}` + this.spacelessFilter(t.name)] = dataSource;
                this.$scope.$watch("vm.selectedStyleTrait['" + t.name + "']", (newValue) => {
                    if (this.selectedStyleTrait[t.name] === "" || this.selectedStyleTrait[t.name] === "00000000-0000-0000-0000-000000000000") {
                        this.selectedStyleTrait[t.name] = null;
                    }
                    var currentTraitValues = this.currentStyleTraitValues();
                    if (!this.compareCurrentStyleTraitValuesWithInitial(currentTraitValues)) {
                        this.modelIsDirty = true;
                    } else {
                        this.modelIsDirty = false;
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
            this.styleClass.styleTraits.forEach(t => {
                if (this.selectedStyleTrait[t.name] !== null) {
                    result.push(t.styleTraitValues.find(x => x.id == this.selectedStyleTrait[t.name]));
                }
            });
            return result;
        }

        compareCurrentStyleTraitValuesWithInitial(current: any[]): Boolean {
            if (current.some(c => this.styleTraitValues.every(s => s.id != c.id)))
                return false;
            if (this.styleTraitValues.some(c => current.every(s => s.id != c.id)))
                return false;
            return true;
        }

        save() {
            var current = this.currentStyleTraitValues();
            this.$http.delete(`${this.serviceUri}products(${this.model.id})/StyleTraitValues/$ref`, {
                data: { value: this.styleTraitValues.map(x => x.id) },
                headers: { "Content-Type": "application/json;charset=utf-8" }
            }).success(() => {
                this.$http.put(`${this.serviceUri}products(${this.model.id})/StyleTraitValues/$ref`, { "value": current.map(x => x.id) })
                    .success(() => {
                        this.modelIsDirty = false;
                        this.styleTraitValues = current;

                        this.$foundationApi.publish(`editTraits-${this.collectionName}-${this.childrenColumn}-modal`, "close");
                        this.notificationService.show(NotificationType.Success, `Saved trait ${this.model.shortDescription}`);
                    });
            });
        }

        reset() {
            this.selectInitialModel();
            this.modelIsDirty = false;
        }
    }

    function editTraitsDirective() {
        return {
            restrict: "E",
            controller: "EditTraitsController",
            controllerAs: "vm",
            scope: {},
            bindToController: {
                collectionName: "@",
                childrenColumn: "@",
                displayName: "="
            },
            templateUrl(elemnt, attrs) {
                return `edit-traits-${attrs.collectionName}-${attrs.childrenColumn}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("EditTraitsController", EditTraitsController)
        .directive("isaEditTraits", <any>editTraitsDirective);
}