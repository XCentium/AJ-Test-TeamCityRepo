module insite_admin {
    "use strict";

    export interface IImportEntitiesService {
        getImportInfo(pluralizedName: string): ng.IPromise<any>;
        getImportJob(jobId: string): ng.IPromise<any>;
        cancelImportJob(jobId: string): ng.IPromise<any>;
    }

    export class ImportEntitiesService implements IImportEntitiesService {
        static $inject = ["$http", "$q"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService)
        {
        }

        getImportInfo(pluralizedName: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.$http.get(`/admin/import/${pluralizedName}/importinfo`).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }

        getImportJob(jobId: string) {
            var deferred = this.$q.defer();
            this.$http.get(`/admin/import/getjobinfo/${jobId}`).success(result => {
                deferred.resolve(result);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }

        cancelImportJob(jobId: string) {
            var deferred = this.$q.defer();
            this.$http.post(`/admin/import/cancel/${jobId}`, {}).success(result => {
                return this.getImportJob(jobId);
            });
            return <ng.IHttpPromise<any>>deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("importEntitiesService", ImportEntitiesService);
}