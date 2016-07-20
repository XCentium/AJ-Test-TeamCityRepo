module insite_admin {
    "use strict";

    export interface ILicensingResult
    {
        valid: boolean;
        message: string;
        expirationDate: Date;
        status: string;
    }

    export interface ILicensingService {
        validateLicense(login: string, password: string): ng.IPromise<ILicensingResult>;
    }

    export class LicensingService implements ILicensingService {
        static $inject = ["$http", "$q"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService) {
        }

        validateLicense(login: string, password: string): ng.IPromise<ILicensingResult> {
            var deferred = this.$q.defer();
            this.$http.post("/admin/checklicense", null).success((result: any) => {
                if (result) {
                    if (!result.valid) {
                        deferred.reject({
                            data: result
                        });
                        return;
                    }
                }

                deferred.resolve(result);
            }).error((result: any, code: number) => {
                deferred.reject({
                    data: result,
                    code
                });
            });
            return <ng.IPromise<ILicensingResult>>deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("licensingService", LicensingService);
}