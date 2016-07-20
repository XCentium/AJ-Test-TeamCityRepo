module insite_admin {
    import Core = insite.core;
    "use strict";

    export class EntitiesRolesController extends EntitiesController {

        builtInRoles: Array<string> = [];

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
            protected $sessionStorage: Core.IWindowStorage,
            protected entityListStateService: IEntityListStateService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService,
            protected adminActionService: IAdminActionService
        ) {
            super($rootScope, $http, $scope, $location, breadcrumbService, $sessionStorage, entityListStateService, entityDefinitionService, $route, $templateCache, adminActionService);
            this.initEntitiesRolesController();
        }

        initEntitiesRolesController() {
            this.$http.get("/api/v1/admin/roles/builtin")
                .success((entities: { value: Array<string> }) => {
                    this.builtInRoles = entities.value;
                });
        }

        isDisabledCheckbox(id) {
            var roleName = this.entities.find((x) => x.id === id).roleName;
            return this.builtInRoles.indexOf(roleName) > -1;
        }
    }

    angular
        .module("insite-admin")
        .controller("EntitiesRolesController", EntitiesRolesController);
}