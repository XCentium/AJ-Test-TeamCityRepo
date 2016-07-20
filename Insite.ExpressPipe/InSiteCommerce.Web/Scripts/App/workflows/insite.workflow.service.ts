/// <reference path="../_typelite/insite.models.d.ts" />
import ModuleCollection = Insite.Workflows.WebApi.V1.ApiModels.ModuleCollection;
import ModuleModel = Insite.Workflows.WebApi.V1.ApiModels.ModuleModel;
import ServiceModel = Insite.Workflows.WebApi.V1.ApiModels.ServiceModel;

module insite.workflow {
    "use strict";

    export interface IWorkflowSevice {
        getWorkflow(serviceName: string): ng.IHttpPromise<ModuleModel>;
        getWorkflows(): ng.IHttpPromise<ModuleCollection>;
        bootstrapService(url: string): ng.IHttpPromise<ModuleCollection>;
    }

    export class WorkflowService implements IWorkflowSevice {

        serviceUri = "/api/v1/workflows";
        static $inject = ["$http", "$q"];

        constructor(protected $http: ng.IHttpService, protected $q: ng.IQService) {

        }

        getWorkflow(serviceName: string): ng.IHttpPromise<ModuleModel> {
            var deferred = this.$q.defer();
            return this.$http.get(this.serviceUri + "/" + serviceName)
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
        }

        getWorkflows(): ng.IHttpPromise<ModuleCollection> {
            var deferred = this.$q.defer();
            return this.$http.get(this.serviceUri)
                .success(result => deferred.resolve(result))
                .error(deferred.reject);;
        }

        bootstrapService(url: string): ng.IHttpPromise<ModuleCollection> {
            var deferred = this.$q.defer();
            return this.$http.get(url)
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
        }
    }

    angular
        .module("insite")
        .service("workflowService", WorkflowService);
}