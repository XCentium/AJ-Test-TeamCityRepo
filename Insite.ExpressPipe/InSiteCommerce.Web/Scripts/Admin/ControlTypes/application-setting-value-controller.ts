module insite_admin {
    "use strict";

    export class ApplicationSettingValueController {
        disabled: string;
        form: any;
        name: string;
        label: string;
        key: string;
        isDisplay: boolean;
        shouldMasked = false;

        static $inject = ["$scope"];

        constructor(
            protected $scope: ng.IScope
        ) {
            if (this.isDisplay) {
                this.checkIsEncryptedSetting(this.$scope["model"].name);
            } else {
                this.$scope.$watch("model.name", (newValue) => {
                    this.checkIsEncryptedSetting(newValue);
                });
            }
        }

        checkIsEncryptedSetting(settingName: string): void {
            this.shouldMasked = !!settingName && settingName.length >= 5 && settingName.indexOf("_enc") === settingName.length - 4;
        }
    }

    angular
        .module("insite-admin")
        .controller("ApplicationSettingValueController", ApplicationSettingValueController);
}