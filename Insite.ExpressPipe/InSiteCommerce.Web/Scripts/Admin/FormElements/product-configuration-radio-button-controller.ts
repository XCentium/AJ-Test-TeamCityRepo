module insite_admin.formElements {
    "use strict";

    // this is a custom radio button for the product configuration tab which sets other settings and shows and hides other controls
    export class ProductConfigurationRadioButtonController {
        public model: any;        
        public configurationType: string;
        public detailsController: EntityDetailsController;


        constructor() {
            this.init();
        }

        init() {
            if (this.model.configurationObjectId != null) {
                this.configurationType = "Advanced";
            }
            else if (this.model.isFixedConfiguration && this.model.isConfigured) {
                this.configurationType = "Fixed";
            }
            else if (this.model.isConfigured) {
                this.configurationType = "Standard";
            } else {
                this.configurationType = "None";
            }
            this.setParentControllerConfigurationState();
        }

        setParentControllerConfigurationState() {
            // this property on the controller is used to show and hide productKitSections and configurationObjectId controls with ng-if Html Tag Attributes
            (<any>this.detailsController).configurationType = this.configurationType;
        }

        changedRadio() {
            this.setParentControllerConfigurationState();

            if (this.configurationType == "Advanced") {
                this.model.isFixedConfiguration = false;
                this.model.isConfigured = false;
                // show advanced
            } else if (this.configurationType == "Fixed") {
                this.model.isFixedConfiguration = true;
                this.model.isConfigured = true;
                this.model.configurationObjectId = null;
                // show products
            } else if (this.configurationType == "Standard") {
                this.model.isFixedConfiguration = false;
                this.model.isConfigured = true;
                this.model.configurationObjectId = null;
                // show products
            } else {
                this.model.isFixedConfiguration = false;
                this.model.isConfigured = false;
                this.model.configurationObjectId = null;
                
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("ProductConfigurationRadioButtonController", ProductConfigurationRadioButtonController)
        .directive("isaProductConfigurationRadioButton", <any>function () {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "ProductConfigurationRadioButton",
                controller: "ProductConfigurationRadioButtonController",
                controllerAs: "vm",
                bindToController: {
                    model: "=",
                    detailsController: "="
                },
                scope: {}
            }
        });
}