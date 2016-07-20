module insite_admin {
    "use strict";

    export class TranslationPropertyBaseValueController {
        entityDetailsCtrl: any;
        parentTable: string;
        parentId: System.Guid;
        field: string;
        value: string;

        static $inject = [
            "$http",
            "$scope"
        ];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope
        ) {
            this.entityDetailsCtrl = (<any>$scope.$parent).entityDetailsCtrl;
            if (this.entityDetailsCtrl.isReady) {
                this.loadBaseValue(this.entityDetailsCtrl.model.parentTable, this.entityDetailsCtrl.model.parentId, this.entityDetailsCtrl.model.name);
            }
        }

        loadBaseValue(parentTable: string, parentId: System.Guid, field: string) {
            if (parentTable && field) {
                this.$http.get(`/api/v1/admin/translationbasevalues?parentTable=${parentTable}&parentId=${parentId}&field=${field}`).success((result: string) => {
                    this.value = result;
                });
            }
        }

        loadModelOverride(): ng.IPromise<any> {
            return this.entityDetailsCtrl.loadModel().then(() => {
                this.loadBaseValue(this.entityDetailsCtrl.model.parentTable, this.entityDetailsCtrl.model.parentId, this.entityDetailsCtrl.model.name);
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("TranslationPropertyBaseValueController", TranslationPropertyBaseValueController)
        .directive("isaTranslationPropertyBaseValue", () => <ng.IDirective>{
            restrict: "E",
            controller: "TranslationPropertyBaseValueController",
            controllerAs: "vm",
            replace: true,
            scope: {
            },
            bindToController: true,
            template: `<div><div class="grid-block form-control"><div class="medium-3 grid-block"><label>Base Value</label></div><div class="medium-9 grid-block vertical form-control__control-padding"><input type="text" class="medium" readonly="readonly" ng-model="vm.value"></input></div></div></div>`
        });
}