module insite.email {
    "use strict";

    export interface IEmailService {
        tellAFriend(tellAFriendInfo): ng.IPromise<string>;
    }

    export class EmailService implements IEmailService {
        expand: string;
        serviceUri = this.coreService.getApiUri("/api/v1/email");

        static $inject = ["$http", "$q", "coreService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        tellAFriend(tellAFriendInfo): ng.IPromise<string> {
            var deferred = this.$q.defer();
            this.$http.post(this.serviceUri, tellAFriendInfo)
                .success((result) => {
                return deferred.resolve(result);
            })
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("EmailService", EmailService);
}