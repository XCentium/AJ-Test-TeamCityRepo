module insite_admin {
    "use strict";

    export class FilePickerController {
        path: string;
        isValid: boolean = true;

        static $inject = ["$rootScope", "$http", "$scope"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope
        ) {
            this.init();
        }

        init() {
        }

        openPopup(): void {
            CKFinder.popup({
                selectActionFunction: (path, data) => {
                    this.path = path;
                    this.$scope.$apply();
                }
            });
        }

        protected validate() {
            var pattern = /^((http|https|ftp):\/\/)/i;
            var uri = !pattern.test(this.path) ? `${location.protocol}//${location.hostname}${this.path}` : this.path;

            this.$http.head(uri, { bypassErrorInterceptor: true }).success(() => {
                this.isValid = true;
            }).error(() => {
                this.isValid = false;
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("FilePickerController", FilePickerController)
        .directive("isaFilePicker", <any>function() {
            return {
                require: "ngModel",
                restrict: "E",
                replace: true,
                transclude: true,
                scope: {
                    path: "=ngModel"
                },
                controller: "FilePickerController",
                controllerAs: "filePickerCtrl",
                bindToController: true,
                templateUrl(elemnt, attrs) {
                    return `filePicker_${attrs.fieldId}`;
                }
            }
        });
}