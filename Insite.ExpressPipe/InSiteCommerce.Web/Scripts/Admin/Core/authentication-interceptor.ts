module insite_admin {
    "use strict";

    authenticationInterceptor.$inject = ["$window", "$q", "ipCookie"];

    // Note: We can't use sessionService.isAuthenticated() because of circular dependency
    function authenticationInterceptor($window: ng.IWindowService, $q: ng.IQService, ipCookie: any): any {
        return {
            request: (config: ng.IRequestConfig): ng.IRequestConfig => {
                config.headers = config.headers || {};
                
                // Ignore
                if (config.url.match(/\/userfiles/i) || config.skipAddAccessToken) {
                    return config;
                }

                if ($window.localStorage.getItem("admin-accessToken")) {
                    config.headers.Authorization = "Bearer " + $window.localStorage.getItem("admin-accessToken");
                }

                return config;
            },

            responseError: (response: any): ng.IPromise<any> => {
                if (response.status === 401) {
                    // If we got a 401, but do have a local access token, then our access token has expired, need to remove it
                    if ($window.localStorage.getItem("admin-accessToken") !== null) {
                        var currentToken = $window.localStorage.getItem("admin-accessToken");
                        var sentToken = response.config.headers.Authorization;
                        if (typeof(sentToken) !== "undefined") {
                            sentToken = sentToken.substring("Bearer ".length);
                        }

                        if (currentToken === sentToken) {
                            $window.localStorage.removeItem("admin-accessToken");
                            $window.localStorage.removeItem("admin-refreshToken");
                            ipCookie.remove("CKFinder_Check", { path: "/" });
                            $window.location.reload(true);
                        }
                    }
                }
                return $q.reject(response);
            }


        };
    }

    angular
        .module("insite-admin")
        .factory("authenticationInterceptor", authenticationInterceptor);
}