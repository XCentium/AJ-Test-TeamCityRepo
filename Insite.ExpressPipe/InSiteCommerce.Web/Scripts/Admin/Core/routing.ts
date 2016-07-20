module insite_admin {
    "use strict";

    (<any>angular)
        .module("insite-admin")
        .decorator("$browser", [
            "$delegate", $delegate => {
                var baseHref = $delegate.baseHref;
                $delegate.baseHref = () => angular.lowercase(baseHref());
                return $delegate;
            }
        ])
        .config([
            "$httpProvider", $httpProvider => {
                $httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
            }
        ])
        .config([
            "$routeProvider", "$locationProvider", ($routeProvider, $locationProvider) => {
                var when = $routeProvider.when;
                $routeProvider.when = function(path, route) {
                    route.caseInsensitiveMatch = true;
                    route.resolve || (route.resolve = {});
                    angular.extend(route.resolve, {
                        data: [
                            "displayNameService", function(displayNameService) {
                                return displayNameService;
                            }
                        ]
                    });
                    return when.apply(this, arguments);
                };
                $routeProvider.when("/", {
                    templateUrl: "/admin/home"
                }).when("/data/:name", {
                    templateUrl(parameters) {
                        return `/admin/data/${parameters.name}`;
                    }
                }).when("/data/:name/:id", {
                    templateUrl(parameters) {
                        var entityUrl = `/admin/data/${parameters.name}/${parameters.id}`;
                        return entityUrl;
                    }
                }).when("/notFound/:path*", {
                    templateUrl(parameters) {
                        return `/admin/notFound/${parameters.path}`;
                    }
                }).when("/about", {
                    templateUrl() {
                        return "/admin/about";
                    }
                }).when("/joblist", {
                    templateUrl() {
                        return "/admin/job";
                    }
                }).when("/import/:name/details/:id", {
                    templateUrl(parameters) {
                        return `/admin/import/${parameters.name}/details/${parameters.id}`;
                    }
                }).when("/export/:name/details/:id", {
                    templateUrl(parameters) {
                        return `/admin/export/${parameters.name}/details/${parameters.id}`;
                    }
                }).when("/:controller", {
                    templateUrl(parameters) {
                        return `/admin/${parameters.controller}`;
                    }
                }).when("/:controller/:action", {
                    templateUrl(parameters) {
                        return `/admin/${parameters.controller}/${parameters.action}`;
                    }
                }).when("/:controller/:action/:id", {
                    templateUrl(parameters) {
                        return `/admin/${parameters.controller}/${parameters.action}/${parameters.id}`;
                    }
                }).otherwise({
                    redirectTo(routeParams, path, search) {
                        return `/notFound${path}`;
                    }
                });
                $locationProvider.html5Mode(true);
            }
        ]);
}