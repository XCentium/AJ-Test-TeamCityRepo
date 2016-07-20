module insite_admin {
    "use strict";

    export class JobDefinitionEntitiesController extends EntitiesController {
        importRecords() {
            angular.element("#hiddenFileUpload").data("_scope", this.$scope);
            $("#hiddenFileUpload").val(null).click();
        }

        exportRecords(): void {
            var selectedIds = encodeURIComponent(JSON.stringify(this.selectedIds));
            var filters = encodeURIComponent(JSON.stringify(this.filtersCollection.getFilters()));
            var uri = `/Admin/JobDefinition/JobDefinition.json?selectedIds=${selectedIds}&filters=${filters}`;
            $("#hiddenFileDownload").attr("href", uri);
            $("#hiddenFileDownload")[0].click();
        }

        setFile(arg) {
            if (arg.files.length <= 0) {
                return;
            }

            this.spinnerService.show();

            var formData = new FormData();
            formData.append("file", arg.files[0]);

            var config = {
                headers: { 'Content-Type': undefined }
            };

            this.$http.post(`/admin/JobDefinition/Import`, formData, config).then(() => {
                this.spinnerService.hide();
                this.reloadList();
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("JobDefinitionEntitiesController", JobDefinitionEntitiesController);
}