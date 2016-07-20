module insite_admin {
    import Core = insite.core;
    "use strict";

    export interface IBreadcrumb {
        label: string;
        uri: string;
    }

    export interface IBreadcrumbScope extends ng.IScope {
        isVisible: boolean
    }

    export class BreadcrumbController {
        breadCrumbs: IBreadcrumb[] = [];

        static $inject = ["breadcrumbService","adminSessionService", "$scope", "$http", "$location"];

        constructor(
            protected breadcrumbService: IBreadcrumbService,
            protected adminSessionService: IAdminSessionService,
            protected $scope: IBreadcrumbScope,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService
        ) {
            this.init();
        }
        
        init() {
            // Declare a mini-API to hand off to our service so the service
            // doesn't have a direct reference to this directive's scope.
            var api = {
                add: (label: string, uri: string = "") => {
                    this.breadCrumbs.push({ label: label, uri: uri });
                },
                clear: () => {
                    this.breadCrumbs = [];
                }
            };

            this.breadcrumbService.register(api);
            this.$scope.isVisible = true;

            this.$scope.$on("$locationChangeSuccess", (event, newUrl: string) => {
                if (this.$location.path() === "/") {
                    this.$scope.isVisible = false;
                    return;
                } else {
                    this.$scope.isVisible = true;
                }

                this.$http.post("/admin/breadcrumbs/getfromurl", { url: newUrl }).success((breadcrumbs: any[]) => {
                    this.breadcrumbService.create();
                    breadcrumbs.forEach(breadcrumb => {
                        this.breadcrumbService.set(breadcrumb.label, breadcrumb.url);
                    });
                });
            });
        }
    }

    angular
        .module("insite-admin");
        

    export interface IBreadcrumbService {
        register(data: any): void;
        update(entity: string, apiUri: string, level: number): void;
        create(): IBreadcrumbService;
        set(label: string, uri: string): IBreadcrumbService;
        pluralize(label: string): string;
    }

    export class BreadcrumbService implements IBreadcrumbService {
        breadcrumbs: any;

        register(data: any): void {
            this.breadcrumbs = data;
        }

        update(entity: string, apiUri: string, level: number = 1): void {
            this.breadcrumbs.clear();
            entity = entity.charAt(0).toUpperCase() + entity.slice(1);
            if (level === 1) {
                this.breadcrumbs.add(this.pluralize(entity), "");
            }
            if (level === 2) {
                this.breadcrumbs.add(this.pluralize(entity), apiUri);
                this.breadcrumbs.add(entity, "");
            }
        }

        create(): IBreadcrumbService {
            this.breadcrumbs.clear();
            return this;
        }

        set(label: string, uri: string): IBreadcrumbService {
            this.breadcrumbs.add(this.toUpper(label), uri);
            return this;
        }

        pluralize(label: string): string {
            if (label.indexOf("y", label.length - 1) !== -1) {
                label = label.substring(0, label.length - 1) + "ies";
            } else {
                label += "s";
            }

            return label;
        }

        private toUpper(label: string): string {
            if (!label) {
                return label;
            }

            return label.charAt(0).toUpperCase() + label.slice(1);
        }
    }

    angular
        .module("insite-admin")
        .service("breadcrumbService", BreadcrumbService)
        .controller("BreadcrumbController", BreadcrumbController)
        .directive("isaBreadcrumbs", () => {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                template: "<div class=\"menu-background\" style= \"background: #363636;\" ng-show=\"vm.adminSessionService.isAuthenticated() && isVisible\"><ol class=\"breadcrumb\" ><li><a href=\"/admin/\" > <i class=\"icon icon-home\" > </i></a></li>" +
                "<li data-ng-repeat=\"breadCrumb in vm.breadCrumbs\">" +
                "<a href=\"{{breadCrumb.uri}}\" ng-if=\"!!breadCrumb.uri && breadCrumb.label && breadCrumb.label.length >= 20\" title=\"{{breadCrumb.label}}\">{{breadCrumb.label}}</a>" +
                "<a href=\"{{breadCrumb.uri}}\" ng-if=\"!!breadCrumb.uri && breadCrumb.label && breadCrumb.label.length < 20\">{{breadCrumb.label}}</a>" +
                "{{!breadCrumb.uri ? breadCrumb.label : ''}}" +
                "</li></ol></div>",
                controller: "BreadcrumbController",
                controllerAs: "vm",
                bindToController: true
            }
        });
}