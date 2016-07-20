module insite_admin {
    "use strict";

    export class PropertyConfigurationDetailsController extends EntityDetailsController {
        save(afterSave: any): void {
            this.spinnerService.show();
            this.checkUniqueStandardProperty().then(() => {
                super.save(afterSave);
            }, () => {
                var elementName = `${this.entityName}_label`;
                if (this.form[elementName]) {
                    this.form[elementName].$setValidity("duplicateRecordField", false);
                    this.form[elementName].$setTouched();
                }

                var unWatch = this.$scope.$watch(`entityDetailsCtrl.model.label`, (newValue, oldValue) => {
                    if (newValue === oldValue) {
                        return;
                    }

                    var elementName = `${this.entityName}_label`;
                    if (this.form[elementName]) {
                        this.form[elementName].$setValidity("duplicateRecordField", true);
                    }
                    unWatch();
                });

                this.form.$valid || this.notificationService.show(NotificationType.Error, "Please correct all errors below before saving your changes.");
                this.spinnerService.hide();
            });
        }

        private checkUniqueStandardProperty(): ng.IPromise<any> {
            var defer = this.$q.defer();
            if (!this.model || !this.model.label) {
                defer.resolve();
            } else {
                this.$http.get(`/api/v1/admin/entityConfigurations(${this.model.entityConfigurationId})`)
                    .then((confResult: any) => {
                        this.$http.get(`/api/v1/admin/entityDefinitions?$filter=name eq '${confResult.data.name}'&$select=properties&$expand=properties($filter=id ne ${this.model.id} or isCustomProperty eq false;$select=label)`).then((result: any) => {
                            var properties = result.data.value[0].properties;
                            for (var key in properties) {
                                if (properties.hasOwnProperty(key) && properties[key].label && properties[key].label.toUpperCase() === this.model.label.toUpperCase()) {
                                    defer.reject(properties[key]);
                                    return;
                                }
                            }

                            defer.resolve();
                        });
                    });
            }

            return defer.promise;
        }
    }

    angular
        .module("insite-admin")
        .controller("PropertyConfigurationDetailsController", PropertyConfigurationDetailsController);
}