module insite_admin.formElements {
    "use strict";

    export class ApplicationDictionaryPropertyAttributesController {
        additionalDirtyChecks: { dirtyCheckName: string, checker(model: any, initialModel: any): boolean; }[] = [];
        model: any;
        modelChanged: boolean;
        propertyType: string;

        isModelDirty = false;

        properties: Array<any>;
        displayProperties: Array<any>;
        initialProperties: Array<any>;

        propertiesServiceUri: string = `/api/v1/admin/PropertyAttributeConfigurations`;

        static $inject = ["$http", "$scope", "$q", "spinnerService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $q: ng.IQService,
            protected spinnerService: ISpinnerService
        ) {
            this.init();
        }

        init() {
            this.$scope.$on("EntitySaved", () => {
                var dirtyProperties = this.getDirtyProperties();
                if (dirtyProperties.length > 0) {
                    this.savePropertyAttributes(dirtyProperties).then(() => {
                        this.loadProperties();
                    });
                } else {
                    this.loadProperties();
                }
            });

            for (var index = this.additionalDirtyChecks.length - 1; index >= 0; index--) {
                if (this.additionalDirtyChecks[index].dirtyCheckName === "AppDictPropertiesChecker") {
                    this.additionalDirtyChecks.splice(index, 1);
                }
            }

            this.additionalDirtyChecks.push({
                dirtyCheckName: "AppDictPropertiesChecker",
                checker: () => {
                    return this.dirtyCheckPropertyAttributes(this.initialProperties, this.properties);
                }
            });

            this.$scope.$watch(() => this.properties, () => {
                this.modelChanged = true;
            }, true);

            this.loadProperties();
        }

        loadProperties() {
            var uri = "";
            if (this.propertyType === "Control Type") {
                uri = `/admin/ApplicationDictionary/ControlTypeProperties?entityConfigurationId=${this.model.entityConfigurationId}&propertyName=${this.model.name}&controlType=${this.model.controlType}`;
            } else if (this.propertyType === "Data Validator") {
                uri = `/admin/ApplicationDictionary/DataValidatorProperties?entityConfigurationId=${this.model.entityConfigurationId}&propertyName=${this.model.name}&propertyType=${this.model.propertyType}`;
            }

            this.spinnerService.show();

            return this.$http.get(uri)
                .success((properties: Array<any>) => {
                    if (properties != null) {
                        // TODO until we can properly support default values for custom properties, don't give the illusion that we support it.
                        if (this.model.isCustomProperty) {
                            for (var x = properties.length - 1; x >= 0; x--) {
                                if (properties[x].name === "DefaultValue") {
                                    properties.splice(x, 1);
                                }
                            }
                        }
                        this.properties = angular.copy(properties);
                        this.displayProperties = angular.copy(this.properties);
                        this.initialProperties = angular.copy(this.properties);
                    } else {
                        this.properties = null;
                        this.displayProperties = null;
                        this.initialProperties = null;
                    }
                })
                .finally(() => {
                    this.spinnerService.hide();
                });
        }

        savePropertyAttributes(dirtyProperties: Array<any>) {
            var deferred = this.$q.defer();
            
            var currentIndex = 0;
            var nextProperty = () => {
                this.spinnerService.show();

                if (currentIndex === dirtyProperties.length) {
                    this.spinnerService.hide();
                    return deferred.resolve();
                } else {
                    var property = dirtyProperties[currentIndex++];

                    var propertiesUri = this.propertiesServiceUri;

                    var propertiesMethod = "POST";
                    if (property.hasOwnProperty("id") && property.id !== undefined && property.id !== null) {
                        propertiesMethod = "PATCH";
                        propertiesUri += `(${property.id})`;
                    }

                    if (property.value === null) {
                        propertiesMethod = "DELETE";
                    }

                    this.$http({
                        method: propertiesMethod,
                        url: propertiesUri,
                        data: property
                    }).success(model => {
                        if (model.hasOwnProperty("id")) {
                            var newProperty = <any>model;
                            this.getProperty(newProperty.name).id = newProperty.id;
                        }

                        nextProperty();
                    }).error(model => {
                        // TODO 4.2 how do we deal with errors? this is a quick version
                        var state = model.modelState;
                        for (var property in state) {
                            //this.modelErrors = this.modelErrors.concat(state[property]);
                        }

                        nextProperty();
                    });
                }
            }

            nextProperty();

            return deferred.promise;
        }

        dirtyCheckPropertyAttributes(oldValue: any, newValue: any): boolean {
            return this.getDirtyProperties().length > 0;
        }

        private getDirtyProperties(): Array<any> {
            var data: Array<any> = [];
            for (var index in this.properties) {
                if (this.properties.hasOwnProperty(index)) {
                    var baseProperty = this.initialProperties[index];
                    var overrideProperty = this.properties[index];

                    if (baseProperty.overrideValue !== overrideProperty.overrideValue || baseProperty.isOverridden !== overrideProperty.isOverridden) {
                        var dirtyProperty = {
                            propertyConfigurationId: this.model.id,
                            name: baseProperty.name,
                            value: overrideProperty.overrideValue !== null && overrideProperty.isOverridden ? overrideProperty.overrideValue.toString() : null
                        };

                        if (baseProperty.id !== null) {
                            dirtyProperty["id"] = baseProperty.id;
                        }

                        data.push(dirtyProperty);
                    }
                }
            }

            return data;
        }

        private getProperty(name: string): any {
            for (var index in this.properties) {
                if (this.properties.hasOwnProperty(index)) {
                    if (this.properties[index].name === name) {
                        return this.properties;
                    }
                }
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("ApplicationDictionaryPropertyAttributesController", ApplicationDictionaryPropertyAttributesController)
        .directive("isaApplicationDictionaryPropertyAttributes", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "ApplicationDictionaryPropertyAttributes",
                controller: "ApplicationDictionaryPropertyAttributesController",
                controllerAs: "vm",
                bindToController: {
                    additionalDirtyChecks: "=",
                    model: "=",
                    modelChanged: "=",
                    propertyType: "@"
                },
                scope: { }
            }
        });
}