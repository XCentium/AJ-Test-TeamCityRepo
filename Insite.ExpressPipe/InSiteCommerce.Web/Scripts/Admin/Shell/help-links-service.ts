module insite_admin {
    "use strict";

    export class ViewType {
        static List = "List";
        static Detail = "Detail";
    }

    export class HelpLinksService {

        serviceUri: string;

        static $inject = ["$http", "$q", "$sessionStorage"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected $sessionStorage: insite.core.IWindowStorage) {
            this.serviceUri = `/api/v1/admin/`;

        }

        getLinks(url: string = "", activeTab: string = ""): ng.IPromise<any[]> {
            var deferred = this.$q.defer();
            var query = `url=${url}&activeTab=${activeTab}`;
            if (this.$sessionStorage.getObject("helpLinks:" + query)) {
                deferred.resolve(this.$sessionStorage.getObject("helpLinks:" + query));
            } else {
                this.$http.get(`/admin/helpmenu/gethelplinks?` + query)
                    .success(result => {
                        deferred.resolve(result);
                        this.$sessionStorage.setObject("helpLinks:" + query, result);
                    });
            }
            return deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("HelpLinksService", HelpLinksService);
}