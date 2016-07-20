module insite_admin {
    "use strict";

    export interface IDeleteEntityService {
        archive(pluralizedEntityName: string, ids: string[]): ng.IPromise<any>;
        delete(pluralizedEntityName: string, ids: string[]): ng.IPromise<any>;
    }

    export class DeleteEntityService implements IDeleteEntityService {
        static $inject = ["$http", "$q", "spinnerService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected spinnerService: SpinnerService) { }

        archive(pluralizedEntityName: string, ids: string[]): ng.IPromise<any> {
            return this.doDelete(pluralizedEntityName, ids, false);
        }

        delete(pluralizedEntityName: string, ids: string[]): ng.IPromise<any> {
            return this.doDelete(pluralizedEntityName, ids, true);
        }

        doDelete(pluralizedEntityName: string, ids: string[], isDelete: boolean): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.spinnerService.show();

            var maxIds = 25;
            var serviceUri = `/api/v1/admin/${pluralizedEntityName}/${isDelete ? "delete" : "archive"}`;
            var currentPage = 0;
            var numberOfPages = Math.ceil(ids.length / maxIds);
            var successful = 0;
            var failed = [];
            var pagesOfIds = [];
            while (currentPage < numberOfPages) {
                pagesOfIds.push(ids.slice(currentPage * maxIds, (currentPage + 1) * maxIds));
                currentPage++;
            }

            currentPage = 0;
            var nextPage = () => {
                if (currentPage === numberOfPages) {
                    this.spinnerService.hide();
                    return deferred.resolve({
                        successful: successful,
                        failed: failed // id, failureMessage
                    });
                } else {
                    var pageOfIds = pagesOfIds[currentPage];
                    var ids = pageOfIds.join("&ids=");
                    var url = serviceUri + "?ids=" + ids;
                    this.$http.delete(url).success(() => {
                        successful += pageOfIds.length;
                        currentPage++;
                        nextPage();
                    }).error((response, statusCode) => {
                        if (statusCode === 409) {
                            for (var x = 0; x < response.length; x++) {
                                failed.push(response[x]);
                            }
                        } else {
                            failed.push(response);
                        }

                        successful += pageOfIds.length - response.length;
                        currentPage++;
                        nextPage();
                    });
                }
            }
            nextPage();

            return deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("deleteEntityService", DeleteEntityService);
}