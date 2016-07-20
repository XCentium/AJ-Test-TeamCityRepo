module insite_admin {
    "use strict";

    // TODO 4.2 this could be switched to use a directive
    export interface IDeleteConfirmationAttributes extends ng.IAttributes {
        pluralizedEntityName: string;
    }

    export class DeleteConfirmationController {
        ids: string[];
        isArchivable: boolean;
        archiveFilter: ArchiveFilter;
        pluralizedEntityName: string;
        pluralizedEntityLabel: string;
        serviceUri: string;

        static $inject = ["$scope", "$attrs", "FoundationApi", "deleteEntityService", "notificationService", "ModalFactory", "$sce", "customErrorState"];
        constructor(
            protected $scope: ng.IScope,
            protected $attrs: IDeleteConfirmationAttributes,
            protected $foundationApi: any,
            protected deleteEntityService: IDeleteEntityService,
            protected notificationService: INotificationService,
            protected modalFactory: any,
            protected $sce: any,
            protected customErrorState: CustomErrorState

        ) {
            this.init();
        }

        init() {
            this.$scope.$on("showDeleteConfirmation", (event: ng.IAngularEvent, isArchivable: any, pluralizedEntityName: string,
                pluralizedEntityLabel: string, ids: any, archiveFilter: ArchiveFilter) => {
                this.isArchivable = isArchivable === true || isArchivable === "true" || isArchivable === "1";
                this.pluralizedEntityName = pluralizedEntityName;
                this.pluralizedEntityLabel = pluralizedEntityLabel;
                this.ids = ids instanceof Array ? ids : [ids];
                this.archiveFilter = archiveFilter;
                this.$foundationApi.publish("deleteConfirmation", "open");
            });
            this.ids = [];
        }

        delete() {
            this.deleteEntityService.delete(this.pluralizedEntityName, this.ids).then((result) => {
                this.finish(result, true);
            });
        }

        archive() {
            this.deleteEntityService.archive(this.pluralizedEntityName, this.ids).then((result) => {
                this.finish(result, false);
            });
        }

        finish(result: any, isDelete: boolean) {
            // TODO 4.2 this should be label
            var needsFailureModal = false;

            var message = "";
            if (result.successful > 0) {
                message = `Successfully ${isDelete ? "deleted" : "archived"} ${result.successful} ${this.pluralizedEntityLabel} <br/></br/>`;
            }
            if (result.failed.length > 0) {
                needsFailureModal = true;
                message += `Failed to ${isDelete ? "delete" : "archive"} ${result.failed.length} ${this.pluralizedEntityLabel}. Some records cannot be deleted because they are referenced by other data in the system.`;
                if (this.customErrorState.shouldDisplayDetails()) {
                    message += "<br/></br/>Technical Details:<br/><br/>";
                    for (var x = 0; x < result.failed.length; x++) {
                        var failure = <any>result.failed[x];
                        message += failure.id && failure.failureMessage ? `Id: ${failure.id}<br/>Message: ${failure.failureMessage}<br/></br/>` : failure.message + "<br/></br/>";
                    }
                }
            }

            if (!needsFailureModal) {
                this.notificationService.show(NotificationType.Success, message);
            } else {
                var errorDialog = new this.modalFactory({
                    id: new Date().getTime(),
                    class: "modal--medium errorDialog",
                    templateUrl: "simpleModalDialog",
                    contentScope: {
                        modalDialogHtml: this.$sce.trustAsHtml(message),
                        modalDialogTitle: "Failure Deleting Records",
                        cancelButtonName: "Close"
                    }
                });

                errorDialog.activate();
            }

            if (result.successful > 0) {
                this.$scope.$emit(`deleteOrArchiveFinished-${this.pluralizedEntityName}`);
            }
            this.$foundationApi.publish("deleteConfirmation", "close");
        }
    }

    angular
        .module("insite-admin")
        .controller("DeleteConfirmationController", DeleteConfirmationController);
}