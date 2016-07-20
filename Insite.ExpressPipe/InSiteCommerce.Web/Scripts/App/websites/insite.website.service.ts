/// <reference path="../_typelite/insite.models.d.ts" />
import WebsiteModel = Insite.Websites.WebApi.V1.ApiModels.WebsiteModel;
import CountryCollectionModel = Insite.Websites.WebApi.V1.ApiModels.CountryCollectionModel;

module insite.websites {
    "use strict";

    export interface IWebsiteService {
        getWebsite(expand: string): ng.IHttpPromise<WebsiteModel>;
        getCountries(expand: string): ng.IHttpPromise<CountryCollectionModel>;
    }

    export class WebsiteService implements IWebsiteService {

        serviceUri = this.coreService.getApiUri("/api/v1/websites/current");
        languageId: System.Guid;

        static $inject = ["$http", "coreService", "sessionService"];

        constructor(
            protected $http: ng.IHttpService,
            protected coreService: core.ICoreService,
            protected sessionService: account.ISessionService) {

            this.init();
        }

        init() {
            var context = this.sessionService.getContext();
            if (context) {
                this.languageId = context.languageId;
            } else {
                // if called before context is set, just set to empty, this is only used to vary the cache by language and not server side
                this.languageId = "00000000-0000-0000-0000-000000000000";
            }
        }

        getWebsite(expand: string): ng.IHttpPromise<WebsiteModel> {
            // language id is added to querystring to make caching vary by language
            var uri = this.serviceUri + "?languageId=" + this.languageId;
            if (expand) {
                uri += "&expand=" + expand;
            }
            return this.$http.get(uri);
        }

        getCountries(expand: string): ng.IHttpPromise<CountryCollectionModel>{
            // language id is added to querystring to make caching vary by language
            var uri = this.serviceUri + "/countries" + "?languageId=" + this.languageId;
            if (expand) {
                uri += "&expand=" + expand;
            }
            return this.$http.get(uri);
        }
    }

    angular
        .module("insite")
        .service("websiteService", WebsiteService);
}