module insite_admin {
    import Core = insite.core;
    "use strict";

    export class SearchProductBoostingController extends EntitiesController {

        static $inject = [
            "$rootScope",
            "$http",
            "$scope",
            "$location",
            "breadcrumbService",
            "$sessionStorage",
            "entityListStateService",
            "spinnerService",
            "entityDefinitionService",
            "$route",
            "$templateCache"];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService,
            protected $sessionStorage: Core.IWindowStorage,
            protected entityListStateService: IEntityListStateService,
            protected spinnerService: ISpinnerService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService
        ) {
            super($rootScope, $http, $scope, $location, breadcrumbService, $sessionStorage, entityListStateService, spinnerService, entityDefinitionService, $route, $templateCache);
            this.allowEditColumns = false;
        }

        entityDefinitionLoaded(): void {
            this.breadcrumbService.create().set("Product Boosting", "");
        }

        importRecords() {
            this.$location.path(`/import/${this.pluralizedEntityName}`);
        }
    }

    var searchProductBoostingDirective : ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            restrict: "E",
            controller: "SearchProductBoostingController",
            controllerAs: "entityListCtrl",
            scope: {
                defaultSort: "@",
                defaultSortAscending: "@",
                pageSize: "@",
                pluralizedEntityName: "@",
                propertiesToSelect: "@"
            },
            bindToController: true,
            templateUrl(elemnt, attrs) {
                return `entities-${attrs.pluralizedEntityName}`;
            }
        };
        return directive;
    }

    angular
        .module("insite-admin")
        .controller("SearchProductBoostingController", SearchProductBoostingController)
        .directive("isaSearchProductBoosting", searchProductBoostingDirective);
}