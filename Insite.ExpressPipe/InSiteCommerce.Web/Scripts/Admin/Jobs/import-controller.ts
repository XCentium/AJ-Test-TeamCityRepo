module insite_admin {
    "use strict";

    export class ImportController {
        pluralizedEntityName: string;
        pluralizedEntityLabel: string;

        validateBefore = false;
        ignoreBlankCells = true;
        updateExistingRecords = true;
        ignoreModifiedDate = false;

        importFileInfo: File;
        isSelectedFileValid = true;
        isImportButtonEnabled = false;
        showUploadError = false;
        uploadCanceler: ng.IDeferred<any>;

        preValidationErrorMessage: string;
        fieldsInError: string;

        static $inject = ["$http", "$q", "$scope", "FoundationApi", "$location"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected $location: ng.ILocationService) {
            this.init();
        }

        init() {
            angular.element("#importFile").bind("change", (changeEvent: any) => {
                this.$scope.$apply(() => {
                    this.showUploadError = false;
                    this.importFileInfo = changeEvent.target.files[0];
                    this.isSelectedFileValid = !!this.importFileInfo && /\.xls$|\.xlsx$/.test(this.importFileInfo.name);
                    this.isImportButtonEnabled = this.isSelectedFileValid;
                });

                if (!this.isSelectedFileValid) {
                    angular.element("#importFile").val('');
                    return;
                }

                this.$foundationApi.publish("uploadModal", "open");

                var formData = new FormData();
                formData.append("file", this.importFileInfo);

                this.uploadCanceler = this.$q.defer();
                var config = {
                    headers: { 'Content-Type': undefined },
                    timeout: this.uploadCanceler.promise
                };

                this.$http.post(`/admin/import/${this.pluralizedEntityName.toLowerCase()}/prevalidate`, formData, config).success((result: any) => {
                    this.uploadCanceler = null;
                    
                    if (result.errorMessage && result.errorMessage.length > 0) {
                        this.preValidationErrorMessage = result.errorMessage;
                        this.fieldsInError = result.fieldsInError;
                        this.showUploadError = true;
                        this.isSelectedFileValid = false;
                        this.isImportButtonEnabled = false;
                        angular.element("#importFile").val('');
                    } else {
                        this.$foundationApi.publish("uploadModal", "close");
                    }
                }).error(() => {
                    this.uploadCanceler = null;
                });
            });
        }

        import() {
            var formData = new FormData();
            formData.append("file", this.importFileInfo);
            formData.append("validateBefore", this.validateBefore);
            formData.append("ignoreBlankCells", this.ignoreBlankCells);
            formData.append("updateExistingRecords", this.updateExistingRecords);
            formData.append("ignoreModifiedDate", this.ignoreModifiedDate);
            formData.append("localTimeOffset", new Date().getTimezoneOffset() / -60);

            var config = {
                headers: { 'Content-Type': undefined }
            };

            this.$http.post(`/admin/import/${this.pluralizedEntityName.toLowerCase()}/importjob`, formData, config).success((result: any) => {
                this.$location.url(`/import/${this.pluralizedEntityName}/details/${result.id}`);
            });
        }

        cancel() {
            this.$location.url(`/data/${this.pluralizedEntityName.toLowerCase()}`);
        }

        cancelUpload() {
            if (this.uploadCanceler) {
                this.uploadCanceler.resolve();
                this.isSelectedFileValid = undefined;
                this.isImportButtonEnabled = false;
                this.showUploadError = false;
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("ImportController", ImportController)
        .directive("isaImport", <any>function() {
            return {
                restrict: "E",
                templateUrl: "import",
                controller: "ImportController",
                controllerAs: "vm",
                bindToController: {
                    pluralizedEntityName: "@",
                    pluralizedEntityLabel: "@"
                },
                scope: {}
            }
        });
}