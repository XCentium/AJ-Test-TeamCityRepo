module insite_admin {
    import JobListItemModel = Insite.Admin.Models.JobListItemModel;
    import JobListModel = Insite.Admin.Models.JobListModel;
    "use strict";

    export class JobListController {

        jobs: Array<JobListItemModel>;
        quickFilterValue: string;
        activeJobs: number;
        currentPage: number;
        totalItems: number;
        pageSize: number;
        numPages: number;
        sortColumn = "startDateTime";
        isSortAsc: boolean = true;
        reloadPromise: ng.IPromise<any>;

        static $inject = ["$scope", "spinnerService", "jobListService", "$location", "breadcrumbService", "$timeout", "$rootScope", "adminSessionService"];

        constructor(
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected jobListService: IJobListService,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService,
            protected $timeout: ng.ITimeoutService,
            protected $rootScope: ng.IRootScopeService,
            protected adminSessionService: IAdminSessionService
        ) {
            this.init();
        }

        init() {
            this.getJobList();

            this.$rootScope.$on("$routeChangeSuccess", () => {
                this.$timeout.cancel(this.reloadPromise);
            });
        }

        getJobList(pageSize?: number, page?: number, sort?: string): void
        {
            this.spinnerService.show();
            this.jobListService.getJobList(pageSize, page, sort).then((result: JobListModel) => {
                this.currentPage = result.currentPage;
                this.totalItems = result.totalItems;
                this.activeJobs = result.activeJobs;
                this.pageSize = result.pageSize;
                this.numPages = Math.ceil(result.totalItems / result.pageSize);
                this.jobs = result.jobs;
                this.proceedData();
            }).finally(() => { this.spinnerService.hide(); });
        }

        needsPager(): boolean {
            return this.numPages && this.numPages > 1;
        }

        selectPage(page: number): void {
            this.getJobList(this.pageSize, page, this.sortColumn + " " + (this.isSortAsc ? "asc" : "desc"));
        }

        sortBy(column: string): void
        {
            if (this.sortColumn === column)
            {
                this.isSortAsc = !this.isSortAsc;
            }
            else
            {
                this.sortColumn = column;
                this.isSortAsc = true;
            }

            this.getJobList(this.pageSize, this.currentPage, this.sortColumn + " " + (this.isSortAsc ? "asc" : "desc"));
        }

        applyQuickFilter(): void {
            if (this.quickFilterValue)
            {
                this.jobListService.findJob(this.quickFilterValue).then((result: any) => {
                    this.totalItems = result.totalItems;
                    this.activeJobs = result.activeJobs;
                    this.numPages = 1;
                    this.jobs = result.jobs;
                    this.proceedData();
                });
            }
            else
            {
                this.getJobList();
            }
        }

        sortAsc(column: string): boolean {
            return this.sortColumn === column && this.isSortAsc;
        }

        sortDesc(column: string): boolean {
            return this.sortColumn === column && !this.isSortAsc;
        }

        viewJob(item: JobListItemModel): void
        {
            if (item.isFailure) {
                this.deactivate(item);
            }

            if (item.isExport) {
                this.$location.url(`/export/${this.breadcrumbService.pluralize(item.exportObject)}/details/${item.id}`);
            }
            if (item.isImport) {
                this.$location.url(`/import/${this.breadcrumbService.pluralize(item.exportObject)}/details/${item.id}`);
            }
        }

        downloadFile(job: JobListItemModel): void {
            this.deactivate(job);
        }

        getAccessTokenQueryString() {
            return "access_token=" + this.adminSessionService.getAccessToken();
        }

        private reloadJobsInProcess(ids: string[]): void
        {
            this.reloadPromise = this.$timeout(() =>
            {
                this.jobListService.reloadJobs(ids).then((jobsList: Array<JobListItemModel>) => {
                    jobsList.forEach(job =>
                    {
                        for (var i = 0; i < this.jobs.length; i++)
                        {
                            if (this.jobs[i].id === job.id)
                            {
                                this.jobs[i] = job;
                                break;
                            }
                        }
                    });
                    this.proceedData();
                });
            }, 7000);
        }

        private deactivate(job: JobListItemModel): void {
            if (job.isActive)
            {
                job.isActive = !job.isActive;
                this.jobListService.deactivate(job.id).then(() => {
                    this.activeJobs--;
                });
            }
        }

        private proceedData(): void {
            var jobsInProcess = [];
            for (var i = 0; i < this.jobs.length; i++)
            {
                if (this.jobs[i].inProgress) {
                    jobsInProcess.push(this.jobs[i].id);
                }
            }
            this.$timeout.cancel(this.reloadPromise);
            if (jobsInProcess.length > 0)
            {
                this.reloadJobsInProcess(jobsInProcess);
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("JobListController", JobListController)
        .directive("isaJobPager", () => {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    currentPage: "=",
                    numPages: "="
                },
                templateUrl() {
                    return `customPager.html`;
                },
                link(scope) {
                    var theScope = <any>scope;
                    theScope.selectPage = (page) => {
                        theScope.$parent.jobListCtrl.selectPage(page);
                    };
                }
            }
        });
}