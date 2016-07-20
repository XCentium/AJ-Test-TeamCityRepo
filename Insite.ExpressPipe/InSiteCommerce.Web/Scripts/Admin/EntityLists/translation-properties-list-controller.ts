module insite_admin {
    "use strict";

    export class TranslationPropertiesListController extends EntitiesController {
        static $inject = [
            "$rootScope",
            "$http",
            "$scope",
            "$location",
            "breadcrumbService",
            "$sessionStorage",
            "entityListStateService",
            "entityDefinitionService",
            "$route",
            "$templateCache",
            "adminActionService"
        ];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService,
            protected $sessionStorage: insite.core.IWindowStorage,
            protected entityListStateService: IEntityListStateService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService,
            protected adminActionService: IAdminActionService
        ) {
            super($rootScope, $http, $scope, $location, breadcrumbService, $sessionStorage, entityListStateService, entityDefinitionService, $route, $templateCache, adminActionService);
        }

        loadEntities(tableState: any, ctrl: any, unselectItems: boolean = true) {
            var currentProperties = this.propertiesToSelect;

            // Retrieve all properties from odata to ensure we have the data we need to retrieve the base value.
            this.propertiesToSelect = "*";

            super.loadEntities(tableState, ctrl, unselectItems);

            this.propertiesToSelect = currentProperties;
        }

        afterLoadEntities(tableState: any, unselectItems: boolean, entities: Array<any>) {
            super.afterLoadEntities(tableState, unselectItems, entities);

            var data = this.entities.map(e => {
                return {
                    parentTable: e.parentTable,
                    parentId: e.parentId,
                    name: e.name,
                    id: e.id
                };
            });

            this.$http.post("/api/v1/admin/translationbasevalues/bulk", data).success((response: any[]) => {
                response.forEach(item => {
                    var entity = this.entities.find(e => e.id === item.id);
                    if (entity) {
                        entity.baseValue = item.baseValue;
                    }
                });
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("TranslationPropertiesListController", TranslationPropertiesListController);
}