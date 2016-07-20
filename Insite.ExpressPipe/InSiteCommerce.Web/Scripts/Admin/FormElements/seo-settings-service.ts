module insite_admin.formElements {
    "use strict";

    export interface ISeoSettingsService {
        getSeoSettings(websiteId: System.Guid): ng.IHttpPromise<any>;
        updateSeoSettings(websiteId: System.Guid, seoSettings: any): ng.IHttpPromise<any>;
    }

    export class SeoSettingsService implements ISeoSettingsService {
        serviceUri = "/admin/websiteseo/";

        static $inject = ["$http"];

        constructor(
            protected $http: ng.IHttpService) {
        }

        getSeoSettings(websiteId: System.Guid): ng.IHttpPromise<any> {
            return this.$http.get(this.serviceUri + "getwebsiteseosettings?websiteId=" + websiteId);
        }

        updateSeoSettings(websiteId: System.Guid, seoSettings: any): ng.IHttpPromise<any> {
            return this.$http.put(this.serviceUri + "updatewebsiteseosettings?websiteId=" + websiteId, seoSettings);
        }
    }

    angular
        .module("insite-admin")
        .service("seoSettingsService", SeoSettingsService);
}