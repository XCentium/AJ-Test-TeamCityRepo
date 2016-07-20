declare var insiteMicrositeUriPrefix: any;
declare var insiteBasicAuthHeader: any;
declare var insiteScope: any;

module insite.core {
    "use strict";

    authenticationInterceptor.$inject = ["$window", "$q", "spinnerService"];

    function authenticationInterceptor(
        $window: ng.IWindowService,
        $q: ng.IQService,
        spinnerService: core.ISpinnerService): any {
        return {
            request: (config: ng.IRequestConfig): ng.IRequestConfig => {
                config.headers = config.headers || {};
                if (config.url.indexOf("account/isauthenticated") === -1 && $window.localStorage.getItem("accessToken")) {
                    config.headers.Authorization = "Bearer " + $window.localStorage.getItem("accessToken");
                }
                return config;
            },

            responseError: (response: any): ng.IPromise<any> => {
                spinnerService.hide();
                if (response.status === 401) {
                    // If we got a 401, but do have a local access token, then our access token has expired, need to remove it
                    // Note: We can't use sessionService.isAuthenticated() because of circular dependency
                    if ($window.localStorage.getItem("accessToken") !== null) {
                        $window.localStorage.removeItem("accessToken");

                        // force reload the browser window to invalidate all the etags and not get any stale data
                        this.$window.location.reload(true);
                    }
                }
                return $q.reject(response);
            }
        };
    }

    angular
        .module("insite")
        .factory("insite.core.authenticationInterceptor", authenticationInterceptor);
}