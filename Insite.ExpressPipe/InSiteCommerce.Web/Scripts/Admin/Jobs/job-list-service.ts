module insite_admin {
    import JobListItemModel = Insite.Admin.Models.JobListItemModel;
    import JobListModel = Insite.Admin.Models.JobListModel;
    "use strict";

    export interface IJobListService {
        getJobList(pageSize?: number, page?: number, sort?: string, endDate?: Date): ng.IPromise<JobListModel>;
        findJob(job: string): ng.IPromise<any>;
        reloadJobs(ids: string[]): ng.IPromise<Array<JobListItemModel>>;
        deactivate(jobId: System.Guid): ng.IPromise<any>;
    }

    export class JobListService implements IJobListService {
        static $inject = ["$http", "$q"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService) {
        }

        getJobList(pageSize?: number, page?: number, sort?: string, endDate?: Date): ng.IPromise<JobListModel> {
            var deferred = this.$q.defer();
            var params = { pageSize: pageSize, page: page, sort: sort, endDate: endDate };

            this.$http({ url: "/admin/job/list", method: "GET", params: params })
                .success(result => { return deferred.resolve(result); })
                .error(deferred.reject);

            return deferred.promise;
        }

        findJob(job: string): ng.IPromise<any> {
            var deferred = this.$q.defer();

            var params = { job: job };
            this.$http({ url: "/admin/job/search", method: "GET", params: params })
                .success(result => { return deferred.resolve(result); })
                .error(deferred.reject);

            return deferred.promise;
        }

        reloadJobs(ids: string[]): ng.IPromise<Array<JobListItemModel>> {
            var deferred = this.$q.defer();
            this.$http.post("/admin/job/reload", { ids: ids })
                .success(result => { return deferred.resolve(result); })
                .error(deferred.reject);

            return deferred.promise;
        }

        deactivate(jobId: System.Guid): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.$http.post("/admin/job/deactivate", { jobId: jobId })
                .success(result => { return deferred.resolve(result); })
                .error(deferred.reject);

            return deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("jobListService", JobListService);
}