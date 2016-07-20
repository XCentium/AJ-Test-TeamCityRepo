module insite_admin {
    "use strict";

    export class CancelIntegrationJobActionController {
        model: any;

        integrationJob: any;
        jobDefinitionParameters: any;
        jobDefinitionStepParameters: any;
        resultMessage: any;

        static $inject = ["$http", "$scope", "FoundationApi", "spinnerService", "$q", "notificationService", "$route"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected spinnerService: ISpinnerService,
            protected $q: ng.IQService,
            protected notificationService: INotificationService,
            protected $route: any
        ) {
            this.$scope.$on("AdminAction-Detail:CancelIntegrationJob", (event, arg) => {
                this.model = arg.model;
                this.cancelIntegrationJob();
            });
        }

        cancelIntegrationJob() {
            this.resultMessage = "";
            this.$foundationApi.publish("cancelIntegrationJob", "open");
            this.$scope.$broadcast("repeatfinished"); // reevaluate table header width after modal is shown
        }

        saveIntegrationJob() {
            this.spinnerService.show();

            this.$http({
                method: "POST",
                url: "/Admin/IntegrationJob/CancelIntegrationJob",
                data: { integrationJobId: this.model.id }
            }).success((result: any) => {
                this.spinnerService.hide();
                this.$foundationApi.publish("cancelIntegrationJob", "close");
                this.$route.reload();

                if (result.JobCanceled === true) {
                    this.notificationService.show(NotificationType.Success, "Job Successfully Canceled");
                } else {
                    this.notificationService.show(NotificationType.Error, "Error Cancelling Job.  Job must be queued or in progress to cancel");
                }
            }).error(() => {
                this.spinnerService.hide();
                this.$foundationApi.publish("cancelIntegrationJob", "close");
                this.notificationService.show(NotificationType.Error, "Error Cancelling Job");
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("CancelIntegrationJobActionController", CancelIntegrationJobActionController)
        .directive("isaCancelIntegrationJobAction", () => {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                templateUrl: "/admin/directives/CancelIntegrationJobAction",
                controller: "CancelIntegrationJobActionController",
                controllerAs: "vm",
                scope: { }
            }
        });
}