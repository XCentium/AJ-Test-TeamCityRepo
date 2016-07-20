module insite_admin {
    import Core = insite.core;
    "use strict";

    export class ChildEntitiesController extends EntitiesController {
        collectionName: string;
        parentEntityId: string;
        pluralizedParentEntityName: string;
        
        displayList: boolean;
        isArchivable: boolean;

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

            this.displayList = this.parentEntityId !== "";

            this.serviceUri = `/api/v1/admin/${this.pluralizedParentEntityName}(${this.parentEntityId})/${this.collectionName}`;
        }

        entityDefinitionLoaded(): void {
            
        }

        // TODO ISC-1861 how do we deal with not sharing this across multiple parents?
        editMultipleRecords(): void {
            this.$sessionStorage.setObject(this.pluralizedEntityName + "_SelectedRecords", this.selectedIds);
            this.$location.url(`/data/${this.formName}/${this.selectedIds[0]}?${this.getParentsForUrl()}`);
        }

        getInitialState(): EntityListState {
            var initialState = this.entityListStateService.getStateFor(this.formName + "_" + this.parentEntityId);
            if (initialState != null) {
                return initialState;
            }

            return this.getDefaultState();
        }

        storeState(entityListState: EntityListState): void {
            this.entityListStateService.setStateFor(this.formName + "_" + this.parentEntityId, entityListState);
        }
    }

    function childEntitiesDirective() {
        return {
            restrict: "E",
            controller: "ChildEntitiesController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                formName: "@",
                pageSize: "@",
                parentEntityId: "@",
                parentEntityName: "@",
                pluralizedEntityName: "@",
                pluralizedParentEntityName: "@",
                propertiesToSelect: "@",
                isArchivable: "=",
                ditchGridBlocks: "="
            },
            templateUrl(elemnt, attrs) {
                return `child-entities-${attrs.collectionName}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("ChildEntitiesController", ChildEntitiesController)
        .directive("isaChildEntities", <any>childEntitiesDirective);
}