module insite_admin {
    "use strict";
    
    export interface IWebsiteService {
        loadWebsites(): ng.IHttpPromise<any>;
        getWebsiteUrl(domainName: string, currentDomainName: string): string;
        cleanDomainName(domainName: string): string;
        splitDomainName(domainName: string): string[];
        checkDomainNameForDuplicates(websiteId: string, domainName: string, microSiteIdentifiers: string): ng.IPromise<any>;
    }

    export class WebsiteService implements IWebsiteService {
        static $inject = ["$http", "$q"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService) {
        }

        loadWebsites() {
            return this.$http.get("/api/v1/admin/websites/?$orderby=name&$select=name,domainName,microSiteIdentifiers");
        }

        getWebsiteUrl(domainName: string, currentDomainName : string) {
            var domainNameList = [],
                splittedDomainName = this.splitDomainName(domainName);

            for (var i = 0; i < splittedDomainName.length; i++) {
                domainNameList.push(splittedDomainName[i]);
            }

            var websiteDomainName = domainNameList[0];
            domainNameList.forEach((domain: any) => {
                if (domain === currentDomainName) {
                    websiteDomainName = domain;
                }
            });

            return `http://${websiteDomainName}`;
        }

        cleanDomainName(domainName: string): string {
            return domainName.toLowerCase().replace("http://", "").replace("https://", "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
        }

        splitDomainName(domainName: string): string[] {
            return domainName.split(/[,;]+/);
        }

        checkDomainNameForDuplicates(websiteId: string, domainName: string, microSiteIdentifiers: string): ng.IPromise<any> {
            var defer = this.$q.defer();
            this.$http.get(`/api/v1/admin/websites?$filter=id ne ${websiteId} and micrositeidentifiers eq '${microSiteIdentifiers}'&$select=domainName`).then((result: any) => {
                if (result.data.value.length > 0) {
                    var names = this.splitDomainName(domainName);
                    var namesDic = {}, i;
                    for (i = 0; i < names.length; i++) {
                        namesDic[this.cleanDomainName(names[i])] = true;
                    }

                    for (i = 0; i < result.data.value.length; i++) {
                        names = this.splitDomainName(result.data.value[i].domainName);
                        for (var j = 0; j < names.length; j++) {
                            if (namesDic[this.cleanDomainName(names[j])]) {
                                defer.reject({ domainName: names[j] });
                                return;
                            }
                        }
                    }
                }

                defer.resolve();
            });

            return defer.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("websiteService", WebsiteService);
}