/// <reference path="../_typelite/insite.models.d.ts" />
/// <reference path="../core/insite.core.service.ts"/>

import IJobQuoteService = insite.jobquote.IJobQuoteService;
import JobQuoteModel = Insite.JobQuote.WebApi.V1.ApiModels.JobQuoteModel;
import JobQuoteLineModel = Insite.JobQuote.WebApi.V1.ApiModels.JobQuoteLineModel;

module insite.jobquote {

    "use strict";

    export interface IJobQuoteService {
        getJobQuotes(): any;
        getJobQuote(jobQuoteId): any;
        patchJobQuote(jobQuoteId, jobQuoteInfo): any;
    }

    export class JobQuoteService implements IJobQuoteService {
        jobQuoteServiceUri = this.coreService.getApiUri("/api/v1/jobquotes/");
        
        static $inject = ["$http", "$q", "coreService"];
        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getJobQuotes(): any {
            return this.$http.get(this.jobQuoteServiceUri);
        }

        getJobQuote(jobQuoteId): any {
            var uri = this.jobQuoteServiceUri + jobQuoteId;
            var deferred = this.$q.defer();
            this.$http.get(uri)
                .success((result: any) => {
                return deferred.resolve(result);
            })
                .error(deferred.reject);
            return deferred.promise;
        }

        patchJobQuote(jobQuoteId, quoteInfo): any {
            var uri = this.jobQuoteServiceUri + jobQuoteId;
            var jsQuoteInfo = angular.toJson(quoteInfo);
            var deferred = this.$q.defer();
            this.$http({ method: "PATCH", url: uri, data: jsQuoteInfo })
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("jobQuoteService", JobQuoteService);
}