module insite_admin {
    import ExportDetailsViewModel = Insite.Admin.Models.ExportDetailsViewModel;
    "use strict";

    export class ExportDetailsController {
        pluralizedEntityName: string;
        pluralizedEntityLabel: string;

        jobId: string;
        job: ExportDetailsViewModel;

        refreshPromise: ng.IPromise<any>;

        static $inject = ["$scope", "$rootScope", "$interval", "$http", "$location", "exportEntitiesService", "adminSessionService", "jobListService"];
        constructor(
            protected $scope: ng.IScope,
            protected $rootScope: ng.IRootScopeService,
            protected $interval: ng.IIntervalService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected exportEntitiesService: IExportEntitiesService,
            protected adminSessionService: IAdminSessionService,
            protected jobListService: IJobListService
        ) {
            this.init();
        }

        init() {
            this.loadJobInfo().then(() => {
                this.refreshPromise = this.$interval(() => {
                    this.loadJobInfo();
                }, 3000);
            });

            this.$scope.$on("$locationChangeStart", () => {
                this.destroy();
            });
        }

        loadJobInfo(): ng.IPromise<any> {
            return this.exportEntitiesService.getExportJob(this.jobId).then((result: any) => {
                this.job = result;
                if (result.isFinished || result.isCanceled) {
                    this.$interval.cancel(this.refreshPromise);
                }
                this.$rootScope.$broadcast("jobNumberChanged");
            });
        }

        navigateToAllJobs() {
            this.$location.url(`/joblist`);
        }

        return() {
            this.$location.url(`/data/${this.pluralizedEntityName.toLowerCase()}`);
        }

        setActiveToFalse() {
            if (this.job.isActive) {
                this.jobListService.deactivate(this.jobId);
            }
        }

        cancel() {
            this.exportEntitiesService.cancelExportJob(this.jobId).then(() => {
                this.$interval.cancel(this.refreshPromise);
                this.job.isCanceled = true;
            });
        }

        destroy() {
            this.$interval.cancel(this.refreshPromise);
        }

        getFileLocationQueryString() {
            if (this.job) {
                return `?file=${this.job.fileLocation}&access_token=${this.adminSessionService.getAccessToken()}`;
            } else {
                return "";
            }
        }
    }

    function exportDetailsDirective() {
        return {
            restrict: "E",
            controller: "ExportDetailsController",
            controllerAs: "vm",
            scope: {},
            bindToController: {
                pluralizedEntityName: "@",
                pluralizedEntityLabel: "@",
                jobId: "@"
            },
            templateUrl: "exportDetails"
        };
    }

    angular
        .module("insite-admin")
        .controller("ExportDetailsController", ExportDetailsController)
        .directive("isaExportDetails", <any>exportDetailsDirective);
}