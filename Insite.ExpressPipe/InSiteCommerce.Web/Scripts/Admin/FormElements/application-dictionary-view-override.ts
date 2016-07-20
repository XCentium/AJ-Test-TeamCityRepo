module insite_admin.formElements {
    "use strict";

    export class ApplicationDictionaryViewOverrideController {
        definition: any;
        entityName: string;
        fields: any;
        modelType: any;
        model: any;

        uri: string;

        static $inject = ["$http", "spinnerService"];

        constructor(
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService
        ) {
            this.init();
        }

        init() {
            if (this.modelType === "EntityModelType") {
                this.uri = `/admin/ApplicationDictionary/EntityDefinition?name=${this.model.name}`;
                this.loadDefinition();
            } else if (this.modelType === "PropertyModelType") {
                this.loadPropertyDefinition();
            }
        }

        splitCamelCase(string: string): string {
            return string.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        loadPropertyDefinition() {
            var entityConfigurationUri = `/api/v1/admin/EntityConfigurations(${this.model.entityConfigurationId})?q=${new Date().getTime()}`;

            this.spinnerService.show();

            return this.$http.get(entityConfigurationUri)
                .success((entityConfiguration: any) => {
                    this.uri = `/admin/ApplicationDictionary/PropertyDefinition?entityName=${entityConfiguration.name}&propertyName=${this.model.name}`;
                    this.loadDefinition();
                })
                .finally(() => {
                    this.spinnerService.hide();
                });
        }

        loadDefinition() {
            this.spinnerService.show();

            return this.$http.get(this.uri)
                .success((definition: any) => {
                    this.definition = definition;
                })
                .finally(() => {
                    this.spinnerService.hide();
                });
        }
    }

    angular
        .module("insite-admin")
        .controller("ApplicationDictionaryViewOverrideController", ApplicationDictionaryViewOverrideController)
        .directive("isaApplicationDictionaryViewOverride", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "ApplicationDictionaryViewOverride",
                controller: "ApplicationDictionaryViewOverrideController",
                controllerAs: "vm",
                bindToController: {
                    entityName: "@",
                    fields: "@",
                    model: "=",
                    modelType: "@"
                },
                scope: {}
            }
        });
}