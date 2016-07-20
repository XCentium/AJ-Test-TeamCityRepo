module insite_admin {
    "use strict";

    angular
        .module("insite", [
            "ipCookie",
            "ab-base64"
        ]);
    (<any>angular)
        .module("insite-admin", [
            "ngMessages"
            , "ngRoute"
            , "smart-table"
            , "insite"
            , "ui.select"
            , "monospaced.elastic"
            , "ui.sortable"
            , "foundation"
            , "kendo.directives"
        ])
        .config(["$httpProvider", "$compileProvider", ($httpProvider, $compileProvider: ng.ICompileProvider) => {
            $compileProvider.debugInfoEnabled(false);

            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }
​
            // disable IE ajax request caching
            $httpProvider.defaults.headers.get["If-Modified-Since"] = "Mon, 26 Jul 1997 05:00:00 GMT";

            $httpProvider.interceptors.push("authenticationInterceptor");
            $httpProvider.interceptors.push("httpErrorsInterceptor");
        }])
        .run(["$rootScope", "$location", "adminSessionService", "$sessionStorage", ($rootScope, $location, adminSessionService, $sessionStorage) => {
            $rootScope.$on("$locationChangeStart", event => {
                var url = $location.url();
                var requiresAuthentication = true;
                if (url.toLowerCase().indexOf("/signin") === 0 || url.toLowerCase().indexOf("/notfound") === 0) {
                    requiresAuthentication = false;
                }
                if (requiresAuthentication && !adminSessionService.isAuthenticated()) {
                    event.preventDefault();
                    var signInUrl = "/signin";
                    if (url !== "/") {
                        signInUrl += `?returnUrl=${encodeURIComponent(`/admin${url}`)}`;
                    }
                    $location.url(signInUrl);
                }
            });
        }]);
}