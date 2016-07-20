module insite_admin {
    "use strict";

    IsaSidebarController.$inject = [
        "$scope",
        "$location"
    ];

    function IsaSidebarController($scope, $location) {
        var ctrl = this;
        var contents = ctrl.contents = $scope.contents = [];
        var items = ctrl.items = $scope.items = [];

        ctrl.toggleAllContent = selectedContentScope => {
            this.contents.forEach(contentScope => {
                if (contentScope.scope === selectedContentScope) {
                    contentScope.scope.active = !contentScope.scope.active;
                } else {
                    contentScope.scope.active = false;
                }

                this.slideContent(contentScope.scope);
            });
        };

        ctrl.slideContent = contentScope => {
            if (contentScope.contentEl) {
                contentScope.active
                    ? contentScope.contentEl.slideDown(250)
                    : contentScope.contentEl.slideUp(250);
            }
        }

        ctrl.addContent = contentScope => {
            contents.push({ scope: contentScope });
        };

        ctrl.addItem = itemScope => {
            items.push({ scope: itemScope });
        }

        ctrl.testItemsHrefAgainstLocations = itemScope => {
            var re = new RegExp(itemScope.href, "gi");
            
            if (itemScope.href === "/") {
                itemScope.selected = itemScope.href === $location.path();
            } else {
                itemScope.selected = re.test($location.path());
            }
        }

        ctrl.doAnyItemsMatchCurrentPath = () => {
            var foundMatch = false
                , re = null
                , itemHref = "";

            for (var i = 0, length = this.items.length; i < length; i++) {
                itemHref = this.items[i].scope.href;

                if (!itemHref) {
                    continue;
                }

                re = new RegExp(itemHref, "gi");
                
                if (itemHref === "/") {
                    foundMatch = itemHref === $location.path();
                } else {
                    foundMatch = re.test($location.path());
                }

                if (foundMatch) {
                    break;
                }
            }

            return foundMatch;
        }

        ctrl.checkItems = () => {
            //First check if any items match path... If not don't do anything
            if (!this.doAnyItemsMatchCurrentPath()) {
                return;
            }

            this.contents.forEach(contentScope => {
                contentScope.scope.active = false;
                contentScope.scope.selected = false;
            });

            this.items.forEach(itemScope => {
                if (!itemScope.scope.href) {
                    return; //Same as continue here
                }

                this.testItemsHrefAgainstLocations(itemScope.scope);
                
                if (itemScope.scope.selected) {
                    var contentScope = itemScope.scope;

                    while (contentScope && !contentScope.iconClass) {
                        contentScope = contentScope.$parent;
                    }

                    if (contentScope) {
                        contentScope.active = true;
                        contentScope.selected = true;
                    }
                }
            });

            this.contents.forEach(contentScope => ctrl.slideContent(contentScope.scope));
        }
    }

    angular.module("insite-admin")
        .controller("IsaSidebarController", IsaSidebarController);

    isaSidebar.$inject = [
        "$rootScope",
        "$timeout"
    ];

    function isaSidebar($rootScope, $timeout) {
        return {
            link(scope, element, attrs, controller) {
                $timeout(() => controller.checkItems(), 0);

                $rootScope.$on("$routeChangeSuccess", () => {
                    controller.checkItems();
                });
            },
            controller: "IsaSidebarController",
            restrict: "AE",
            replace: true,
            template: `
                <aside class="is-sidebar">
                    <div class="sidebar-inner">
                        <nav class="sidebar-nav" ng-transclude>

                        </nav>
                    </div>
                </aside>
            `,
            transclude: true
        };
    }

    angular.module("insite-admin")
        .directive("isaSidebar", isaSidebar);

    isaSidebarItem.$inject = [
        "$location"
    ];

    function isaSidebarItem($location) {
        return {
            link(scope, element, attrs, controller) {
                controller.addItem(scope);
                controller.addContent(scope);

                if (element.find(".item-link").length) {
                    scope.hasChildren = true;
                    scope.contentEl = $(element).find(".item-content");
                }

                scope.activate = () => {
                    var bodyEl = angular.element("body");

                    if (scope.hasChildren) {
                        if (bodyEl.hasClass("is-collapsed")) {
                            bodyEl.removeClass("is-collapsed");
                        }

                        controller.toggleAllContent(scope);
                    } else {
                        //Treat is like an anchor tag...
                        $location.url(scope.href);
                    }
                };
            },
            controller() { },
            restrict: "AE",
            replace: true,
            require: "^isaSidebar",
            scope: {
                href: "@",
                title: "@",
                iconClass: "@"
            },
            template: `
                <div class="sidebar-item" ng-class="active && hasChildren ? 'is-active' : ''">
                    <div class="item-wrapper" ng-click="activate()" id="tst-sidebar-item-{{::title}}" ng-class="selected ? 'is-selected' : ''">
                        <div>
                            <i class="item-icon icon" ng-class="iconClass"></i> <span>{{::title}}</span>
                        </div>

                        <i class="icon" ng-if="hasChildren" ng-class="active ? 'icon-expand-less' : 'icon-expand-more'"></i>
                    </div>

                    <div class="item-content" ng-transclude>
                    </div>
                </div>
            `,
            transclude: true
        };
    }

    angular.module("insite-admin")
        .directive("isaSidebarItem", isaSidebarItem);

    function isaSidebarItemLink() {
        return {
            link(scope, element, attrs, controller) {
                controller.addItem(scope);

                if (element.find(".item-sublink").length) {
                    scope.hasChildren = true;
                }
            },
            controller() { },
            restrict: "AE",
            replace: true,
            require: "^isaSidebar",
            scope: {
                title: "@",
                href: "@",
                isSelected: "@"
            },
            template: `
                <div class="item-link">
                    <a ng-href="{{::href}}" ng-class="{'is-selected': selected, 'has-children': hasChildren}">{{::title}}</a>

                    <ul ng-transclude></ul>
                </div>
            `,
            transclude: true
        };
    }

    angular.module("insite-admin")
        .directive("isaSidebarItemLink", isaSidebarItemLink);

    function isaSidebarItemSublink() {
        return {
            link(scope, element, attrs, controller) {
                controller.addItem(scope);
            },
            controller() { },
            restrict: "AE",
            replace: true,
            require: "^isaSidebar",
            scope: {
                title: "@",
                href: "@",
                isSelected: "@"
            },
            template: `
                <li class="item-sublink">
                    <a ng-href="{{::href}}" id="tst-sublink-{{::title}}" ng-class="selected ? 'is-selected' : ''" ng-transclude></a>
                </li>
            `,
            transclude: true
        };
    }

    angular.module("insite-admin")
        .directive("isaSidebarItemSublink", isaSidebarItemSublink);
}
