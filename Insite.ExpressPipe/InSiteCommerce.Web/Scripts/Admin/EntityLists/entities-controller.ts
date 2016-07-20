module insite_admin {
    "use strict";
    import Core = insite.core;

    export interface IListController {
        reloadList(): void;
        showDeleteConfirmation(): void;
        importRecords(): void;
        exportRecords(): void;
        callAction(name: string): void;
        callCustomAction(name: string): void;
    }

    export class EntitiesController extends EntityListController implements IListController {

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
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);

            this.$scope.$on(`deleteOrArchiveFinished-${this.pluralizedEntityName}`, () => {
                this.reloadListWithSamePageAndSelectedState();
            });
        }

        cacheKey() {
            return this.formName;
        }

        entityDefinitionLoaded(): void {
        }

        importRecords() {
            this.$location.url(`/import/${this.pluralizedEntityName}`);
        }

        exportRecords(): void {
            if (this.selectedIds.length > 0) {
                this.$sessionStorage.setObject(this.pluralizedEntityName + "_SelectedRecords", this.selectedIds);
            } else {
                this.$sessionStorage.remove(this.pluralizedEntityName + "_SelectedRecords");
            }
            this.$sessionStorage.setObject(this.pluralizedEntityName + "_ExportInfo", {
                archiveFilter: this.archiveFilter,
                filter: this.buildFilter()
            });
            this.$location.url(`/export/${this.pluralizedEntityName}`);
        }

        showDeleteConfirmation(): void {
            this.$scope.$broadcast("showDeleteConfirmation", this.isArchivable, this.pluralizedEntityName, this.entityDefinition.pluralizedLabel, this.selectedIds, this.archiveFilter);
        }

        editMultipleRecords(): void {
            this.$sessionStorage.remove(`/data/${this.pluralizedEntityName}_activeTab`);
            if (this.selectedIds.length > 1) {
                this.$sessionStorage.setObject(this.pluralizedEntityName + "_SelectedRecords", this.selectedIds);
            } else {
                this.$sessionStorage.remove(this.pluralizedEntityName + "_SelectedRecords");
            }

            this.$location.url(`/data/${this.formName}/${this.selectedIds[0]}?${this.getParentsForUrl()}`);
        }

        editSingleRecord(event: any): void {
            this.$sessionStorage.remove(`/data/${this.pluralizedEntityName}_activeTab`);
            this.$sessionStorage.remove(this.pluralizedEntityName + "_SelectedRecords");
        }

        getInitialState(): EntityListState {
            var initialState = this.entityListStateService.getStateFor(this.cacheKey());

            if (initialState != null) {
                return initialState;
            }

            return super.getInitialState();
        }

        storeState(entityListState: EntityListState): void {
            this.entityListStateService.setStateFor(this.cacheKey(), entityListState);
        }

        pageChanged() {
            $("isa-entities .grid-block, isa-child-entities .grid-block").scrollTop($("isa-entities .grid-block .table, isa-child-entities .grid-block .table").position().top);
        }

        createNewRecord(): void {
            if (this.pluralizedEntityName === "userProfiles") {
                this.$rootScope.$broadcast("addNewUser");
            } else {
                var location = `data/${this.pluralizedEntityName}/new`;
                this.$location.url(location);
            }

            this.$sessionStorage.remove(this.pluralizedEntityName + "_SelectedRecords");
        }

        callAction(name: string): void {
            this.adminActionService.executeEntityListAction(this.formName, name, this.selectedIds);
        }

        callCustomAction(name: string): void {
            this.adminActionService.executeEntityListCustomAction(this.formName, name, this.selectedIds, this.$scope);
        }
    }

    function entitiesDirective() {
        return {
            restrict: "E",
            controller: "@",
            name: "angularController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                defaultSort: "@",
                defaultSortAscending: "@",
                isArchivable: "=",
                pageSize: "@",
                pluralizedEntityName: "@",
                propertiesToSelect: "@",
                formName: "@"
            },
            templateUrl(elemnt, attrs) {
                return `entities-${attrs.pluralizedEntityName}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("EntitiesController", EntitiesController)
        .directive("isaEntities", <any>entitiesDirective);
}