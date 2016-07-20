module insite_admin {
    import ExportViewModel = Insite.Admin.Models.ExportViewModel;
    "use strict";

    export interface IExportEntitiesService {
        getExportInfo(pluralizedName: string): ng.IPromise<any>;
        sendExportJob(pluralizedName: string, job: any): ng.IPromise<any>;
        getExportJob(jobId: string): ng.IPromise<any>;
        cancelExportJob(jobId: string): ng.IPromise<any>;
        saveExportColumns(pluralizedName: string, columns: string[]): ng.IPromise<any>;
    }

    export class ExportEntitiesService implements IExportEntitiesService {
        static $inject = ["$http", "$q"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService)
        {
        }

        getExportInfo(pluralizedName: string): ng.IPromise<ExportViewModel> {
            var deferred = this.$q.defer();
            this.$http.get(`/admin/export/${pluralizedName}/exportinfo`).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<ExportViewModel>>deferred.promise;
        }

        sendExportJob(pluralizedName: string, job: any): ng.IPromise<any> {
            var deferred = this.$q.defer();
            job.dateTimeOffset = new Date().getTimezoneOffset() / -60;
            this.$http.post(`/admin/export/${pluralizedName}/exportjob`, job).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }

        getExportJob(jobId: string) {
            var deferred = this.$q.defer();
            this.$http.get(`/admin/export/getjobinfo/${jobId}`).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }

        cancelExportJob(jobId: string) {
            var deferred = this.$q.defer();
            this.$http.post(`/admin/export/cancel/${jobId}`, {}).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }

        saveExportColumns(pluralizedName: string, columns: string[]): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.$http.post(`/admin/export/${pluralizedName}/saveexportcolumns`, { columns: columns }).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("exportEntitiesService", ExportEntitiesService);
}