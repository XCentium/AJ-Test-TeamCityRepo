module insite_admin {
    "use strict";

    export class ImagePickerController extends FilePickerController {
        fieldId: string;
        canEdit: boolean;

        static $inject = ["$rootScope", "$http", "$scope"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope
        ) {
            super($rootScope, $http, $scope);
        }

        init() {
            super.init();
        }

        preview(): void {
            this.$rootScope.$broadcast("showImagePickerPreview", { path: this.path });
        }

        isAllowPreview(): boolean {
            return this.path && this.path.length > 0 && this.isValid;
        }
    }

    angular
        .module("insite-admin")
        .controller("FilePickerController", ImagePickerController)
        .directive("isaImagePicker", ["$q", "$http", <any>function ($q, $http) {
            return {
                require: "ngModel",
                restrict: "E",
                replace: true,
                transclude: true,
                scope: {
                    path: "=ngModel",
                    fieldId: "@",
                    canEdit: "=",
                    storageProvider: "@" // FileSystem/Azure/AmazonS3
                },
                controller: "FilePickerController",
                controllerAs: "filePickerCtrl",
                bindToController: true,
                templateUrl: "imagePicker",
                link: (scope, elem, attr, ngModel) => {

                    ngModel.$asyncValidators.imagePathValidator = function(modelValue, viewValue) {
                        var def = $q.defer();

                        if (ngModel.$isEmpty(modelValue)) {
                            // consider empty model valid
                            scope.filePickerCtrl.isValid = true;
                            return $q.when();
                        }

                        var pattern = /^((http|https|ftp):\/\/)/i;
                        var uri = !pattern.test(modelValue) ? `${location.protocol}//${location.hostname}${modelValue}` : modelValue;

                        var method = "HEAD";
                        if (attr.storageProvider === "AmazonS3" || attr.storageProvider === "Azure") {
                            def.resolve();
                            scope.filePickerCtrl.isValid = true;
                            return def.promise;
                        }

                        $http({ method: method, url: uri, bypassErrorInterceptor: true }).success(() => {
                            def.resolve();
                            scope.filePickerCtrl.isValid = true;
                        }).error(() => {
                            def.reject();
                            scope.filePickerCtrl.isValid = false;
                        });

                        return def.promise;
                    };
                }
            }
        }]);

}