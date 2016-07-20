module insite_admin {
    import Core = insite.core;
    "use strict";

    angular.module("insite-admin")
        .directive("isaFingerTabs", () => {
            return {
                scope: true,
                restrict: "EAC",
                controller: "FingerTabsController"
            };
        });

    angular.module("insite-admin")
        .directive("isaFingerTab", () => {
            return {
                scope: true,
                restrict: "EAC",
                require: "^isaFingerTabs",
                link: (scope, element, attrs, controller: FingerTabsController) => {
                    var id = attrs.id;
                    var index = controller.getTabIndex(id);

                    var active = index === 1 ? id : "";
                    scope.tabs.id = scope.tabs.id || (active ? id : null);

                    setTimeout(() => element.bind("click", (event) => {
                        if (!event.isDefaultPrevented() && !element.hasClass("disabled")) {
                            controller.setSelectedTab(id, event.currentTarget.getAttribute("title"));
                        }
                    }), 0);

                    attrs.$observe("disabledExpr", value => {
                        if (value) {
                            element.toggleClass("disabled", value === "true");
                        }
                    });

                    scope.$watch("tabs.id", _ => {
                        element.toggleClass("disabled", scope.entityDetailsCtrl.entityId === "" && index !== 1);
                        element.toggleClass("is-active", scope.entityDetailsCtrl.entityId ? scope.tabs.id === id : index === 1);
                        if (scope.tabs.id === id) {
                            scope.entityDetailsCtrl.instructionalText = attrs.instructions;
                        }
                    });
                }
            }
        });

    angular.module("insite-admin")
        .directive("isaFingerTabContent", () => {
            return {
                scope: true,
                restrict: "EAC",
                require: "^isaFingerTabs",
                link: (scope, element, attrs, controller: FingerTabsController) => {
                    var index = controller.getTabContentIndex();
                    scope.isTabActive = false;

                    scope.$watch("tabs.id", _ => {
                        scope.isTabActive = scope.entityDetailsCtrl.entityId ? controller.tabs[index] === scope.tabs.id : index === 1;
                        element.toggleClass("is-active", scope.isTabActive);
                    });
                }
            };
        });

    export class FingerTabsController {
        tabIndex = 0;
        tabContentIndex = 0;
        tabs = [];

        static $inject = ["$scope", "fingerTabsService", "$location", "$rootScope"];

        constructor(
            protected $scope: any,
            protected fingerTabsService: FingerTabsService,
            protected $location: ng.ILocationService,
            protected $rootScope: ng.IRootScopeService
        ) {
            this.$scope.tabs = {
                id: this.fingerTabsService.getSelectedTab($location.path()),
                count: 0
            };

            this.tabIndex = 0;

            var api = {
                selectTab: (id: string, name: string) => {
                    this.setSelectedTab(id, name);
                }
            };

            this.fingerTabsService.register(api);
        }
        getTabIndex(id: string): number {
            var index = ++this.tabIndex;
            this.tabs[index] = id;
            this.$scope.tabs.count = index;
            return index;
        }

        getTabContentIndex(): number {
            return ++this.tabContentIndex;
        }

        setSelectedTab(id: string, label: string): void {
            this.$scope.tabs.id = id;
            this.$scope.$$phase || this.$scope.$apply();
            this.fingerTabsService.setSelectedTab(this.$location.path(), id, label);
            this.$rootScope.$broadcast("tabselected");
        }
    };

    export class FingerTabsService {
        needsStoredTab: any;
        tabs: any;

        static $inject = ["$sessionStorage"];

        constructor(
            protected $sessionStorage: Core.IWindowStorage
        ) {
            this.needsStoredTab = {};
        }

        register(data: any): void {
            this.tabs = data;
        }

        setSelectedTab(path: string, id: string, label: string) {
            path = this.getPath(path);
            this.$sessionStorage.setObject(path + "_activeTab", { id, label });
        }

        getSelectedTab(path: string): string {
            path = this.getPath(path);

            // TODO 4.2 why do we have || true on this and the method below?
            if (this.needsStoredTab[path] === true || true) {
                return this.$sessionStorage.getObject(path + "_activeTab", { id: undefined, label: undefined }).id;
            }
            return "";
        }

        getSelectedTabLabel(path: string): string {
            path = this.getPath(path);

            if (this.needsStoredTab[path] === true || true) {
                return this.$sessionStorage.getObject(path + "_activeTab", { id: undefined, label: undefined }).label;
            }
            return "";
        }

        setNeedsStoredTab(path: string): void {
            this.needsStoredTab[path] = true;
        }

        // this will convert a path from /data/products/[id] to just /data/products so that the tab state will be shared between different records
        private getPath(path: string): string {
            if (path.lastIndexOf("/") > 0) {
                path = path.substr(0, path.lastIndexOf("/"));
            }

            return path;
        }
    }

    angular
        .module("insite-admin")
        .controller("FingerTabsController", FingerTabsController)
        .service("fingerTabsService", FingerTabsService);
}