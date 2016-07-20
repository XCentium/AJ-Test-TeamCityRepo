module insite_admin {
    import Core = insite.core;
    "use strict";

    export class ContentListController extends EntitiesController {
        pluralizedParentEntityName: string;
        parentEntityId: string;
        collectionName: string;
        displayList: boolean;
        activeEntityId: string;
        languageId: string;
        personaId: string;
        deviceType: string;
        isFiltered: boolean = false;

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
            protected spinnerService: ISpinnerService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService,
            protected adminActionService: IAdminActionService
        ) {
            super($rootScope, $http, $scope, $location, breadcrumbService, $sessionStorage, entityListStateService, entityDefinitionService, $route, $templateCache, adminActionService);
        
            this.displayList = true;

            this.serviceUri = `/api/v1/admin/${this.pluralizedParentEntityName}(${this.parentEntityId})/${this.collectionName}`;

            this.filtersCollection = new ListFilterCollection();

            this.$scope.$on("ContentManagerCreated", (event: ng.IAngularEvent, contentManagerId: string) => {
                this.parentEntityId = contentManagerId;
                this.serviceUri = `/api/v1/admin/${this.pluralizedParentEntityName}(${this.parentEntityId})/${this.collectionName}`;
            });

            this.$scope.$on("OnUpdateEntities", (event: ng.IAngularEvent) => {
                this.reloadList();
            });
        }

        setActive(id: string) {
            this.activeEntityId = id;
            this.$rootScope.$broadcast("ContentEnities-ActiveChanged", id);
        }

        isSelected(id: string): boolean {
            return this.activeEntityId === id;
        }

        applyQuickFilter() {
            this.filtersCollection.clear();

            if (this.languageId) {
                var lFilter = new ListFilter();
                lFilter.property = "languageId";
                lFilter.value = this.languageId;
                lFilter.isQuickFilter = true;
                lFilter.operator = "equals";
                lFilter.propertyType = "guid";
                this.filtersCollection.add(lFilter);
            }
                
            if (this.personaId) {
                var pFilter = new ListFilter();
                pFilter.property = "personaId";
                pFilter.value = this.personaId;
                pFilter.isQuickFilter = true;
                pFilter.operator = "equals";
                pFilter.propertyType = "guid";

                this.filtersCollection.add(pFilter);
            }
                
            if (this.deviceType) {
                var dtFilter = new ListFilter();
                dtFilter.property = "deviceType";
                dtFilter.value = this.deviceType;
                dtFilter.isQuickFilter = true;
                dtFilter.operator = "equals";
                dtFilter.propertyType = "string";

                this.filtersCollection.add(dtFilter);
            }

            this.isFiltered = true;
            this.reloadList();
        }

        loadEntities(tableState: any, ctrl: any, unselectItems: boolean = true) {
            if (typeof (this.tableController) === "undefined") {
                this.tableController = ctrl;
            }

            if (this.parentEntityId === "") {
                return;
            }

            this.spinnerService.show();

            tableState.pagination.number = tableState.pagination.number || this.pageSize;
            tableState.pagination.start = tableState.pagination.start || 0;

            var sort = "";
            if (typeof (tableState.sort.predicate) !== "undefined") {
                sort = "&$orderby=" + tableState.sort.predicate;
                if (tableState.sort.reverse) {
                    sort += " desc";
                }
            }

            var url = `${this.serviceUri}?$select=${this.propertiesToSelect}${this.buildFilter()}${sort}`;
            this.$http.get(url).success((entities: Array<any>) => {
                this.afterLoadEntities(tableState, unselectItems, entities);

                var eventData: any = {
                    count: this.entities.length
                };
                
                if (this.entities && this.entities.length > 0) {
                    this.setActive(this.entities[0].id);
                }

                if (this.isFiltered) {
                    eventData.filter = { languageId: this.languageId, personaId: this.personaId, deviceType: this.deviceType };
                }

                eventData.isFiltered = this.isFiltered;
                eventData.activeId = this.activeEntityId;

                this.$rootScope.$broadcast("ContentEnities-EntitiesLoaded", eventData);
            });
        }

        entityDefinitionLoaded(): void {

        }

        getInitialState(): EntityListState {
            var initialState = this.entityListStateService.getStateFor(this.pluralizedEntityName);
            if (initialState != null) {
                return initialState;
            }

            return super.getInitialState();
        }

        storeState(entityListState: EntityListState): void {
            this.entityListStateService.setStateFor(this.pluralizedEntityName, entityListState);
        }
    }

    function contentEntitiesDirective() {
        return {
            restrict: "E",
            controller: "ContentListController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                pluralizedParentEntityName: "@",
                parentEntityId: "@",
                pluralizedEntityName: "@",
                collectionName: "@",
                pageSize: "@",
                propertiesToSelect: "@",
                defaultSort: "@",
                defaultSortAscending: "@"
            },
            templateUrl(elemnt, attrs) {
                return `content-entities-${attrs.collectionName}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("ContentListController", ContentListController)
        .directive("isaContentEntities", <any>contentEntitiesDirective);
}