module insite_admin {
    "use strict";

    export class ImportDetailsViewModel {
        isValidation: boolean;
        jobId: string;
        jobNumber: number;
        jobStartTime: string;
        jobErrors: number;
        jobRecordsCount: number;
        jobRecordsAdded: number;
        jobRecordsModified: number;
        jobRecordsImported: number;
        fileLocation: string;
        isStarted: boolean;
        isFinished: boolean;
        isCanceled: boolean;
        isFailed: boolean;
        hasErrors: boolean;
        isBeingCancelled: boolean;
    }

    export class ImportDetailsController {
        pluralizedEntityName: string;
        pluralizedEntityLabel: string;

        jobId: string;
        job: ImportDetailsViewModel;

        refreshPromise: ng.IPromise<any>;

        static $inject = ["$scope", "$rootScope", "$interval", "$http", "$location", "importEntitiesService", "adminSessionService", "jobListService"];
        constructor(
            protected $scope: ng.IScope,
            protected $rootScope: ng.IRootScopeService,
            protected $interval: ng.IIntervalService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected importEntitiesService: IImportEntitiesService,
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
            return this.importEntitiesService.getImportJob(this.jobId).then((result: any) => {
                this.job = result;
                if (result.isFinished || result.isCanceled) {
                    this.$interval.cancel(this.refreshPromise);
                }
                this.$rootScope.$broadcast("jobNumberChanged");
            });
        }

        return() {
            this.$location.url(`/data/${this.pluralizedEntityName.toLowerCase()}`);
        }

        navigateToAllJobs() {
            this.$location.url(`/joblist`);
        }

        cancel() {
            this.job.isBeingCancelled = true;

            this.importEntitiesService.cancelImportJob(this.jobId).then(() => {
                this.$interval.cancel(this.refreshPromise);
                this.job.isCanceled = true;
                this.job.isBeingCancelled = false;
            });
        }

        destroy() {
            this.$interval.cancel(this.refreshPromise);
        }

        getAccessTokenQueryString() {
            return "access_token=" + this.adminSessionService.getAccessToken();
        }

        setActiveToFalse() {
            this.jobListService.deactivate(this.jobId);
        }

    }

    function importDetailsDirective() {
        return {
            restrict: "E",
            controller: "ImportDetailsController",
            controllerAs: "vm",
            scope: {},
            bindToController: {
                pluralizedEntityName: "@",
                pluralizedEntityLabel: "@",
                jobId: "@"
            },
            templateUrl: "importDetails"
        };
    }

    angular
        .module("insite-admin")
        .controller("ImportDetailsController", ImportDetailsController)
        .directive("isaImportDetails", <any>importDetailsDirective);
}