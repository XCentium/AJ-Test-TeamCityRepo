module insite_admin {
    "use strict";

    export class EntityListState {
        sort: string;
        sortAscending: boolean;
        start: number;
        archiveFilter: ArchiveFilter;
        showSelectedOnly: boolean;
        selectedIds: string[];
        filters: ListFilter[];
    }

    export class EntityListController {
        defaultSort: string;
        defaultSortAscending: boolean;
        pageSize: number;
        pluralizedEntityName: string;
        propertiesToSelect: string;
        formName: string;

        entities: any;
        itemCount: number;
        serviceUri: string;

        archiveFilter = ArchiveFilter.Active;
        filtersCollection = new ListFilterCollection();

        multipleAssignmentName: string;
        tableController: any;
        filters = new Array<ListFilter>();
        selectedIds: string[] = [];
        showSelectedOnly: boolean;
        entityDefinition: any;

        loadedInitialState: boolean = false;
        allowEditColumns = true;
        isArchivable: boolean;
        isReady = false;

        parentEntityId: string;
        pluralizedParentEntityName: string;
        parents: string[];
        parentIds: string[];
        protected spinnerService: any;
        showSpinner: boolean = false;
        static $inject = ["$rootScope", "$http", "$location", "entityDefinitionService", "$scope", "$templateCache", "$route"];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $scope: ng.IScope,
            protected $templateCache: ng.ITemplateCacheService,
            protected $route: any
        ) {
            if (this.formName === "") {
                this.formName = this.pluralizedEntityName;
            }

            // this is required because of the way smart-table calls the method
            this.loadEntities = this.loadEntities.bind(this);

            this.serviceUri = `/api/v1/admin/${this.pluralizedEntityName}`;

            this.entityDefinitionService.getDefinition(this.pluralizedEntityName).then(result => {
                if (result.isHidden) {
                    this.$location.path(`notFound${this.$location.path()}`);
                    return;
                }

                this.entityDefinition = result;
                this.isArchivable = result.isArchivable;
                this.isReady = true;
                this.entityDefinitionLoaded();
            });

            this.fillParents();

            this.$scope.$on("EntityListStateChanged", (event: ng.IAngularEvent, data: any) => {
                var currentPageTemplate = this.$route.current.templateUrl;
                var toCreateTemplateUrl;
                if (data.templateId || data.templateName) {
                    toCreateTemplateUrl = { name: data.templateName, id: data.templateId }
                } else {
                    toCreateTemplateUrl = { name: (!!this.formName ? this.formName : this.pluralizedEntityName) };
                    var currentUrl = this.$location.url();
                    if (currentUrl.indexOf(toCreateTemplateUrl.name) === -1) {
                        toCreateTemplateUrl.name = toCreateTemplateUrl.name.toLowerCase();
                    }
                }
                var url = currentPageTemplate(toCreateTemplateUrl);
                this.$templateCache.remove(url.toLowerCase());
                this.$route.reload();
            });

            this.spinnerService = {
                show : () => {
                    this.showSpinner = true;
                },
                hide : () => {
                    this.showSpinner = false;
                }
            }

            $scope.$on("repeatfinished", this.focusOnInputMicrosoftEdgeFix);
        }

        entityDefinitionLoaded(): void {

        }

        isSelected(id: string): boolean {
            return this.selectedIds.indexOf(id) >= 0;
        }

        areNoneSelected(): boolean {
            return this.selectedIds.length === 0;
        }

        selectAll(): void {
            this.selectedIds = [];
            for (var x = 0; x < this.entities.length; x++) {
                this.selectedIds.push(this.entities[x].id);
            }

            var initialState = this.getInitialState();
            initialState.selectedIds = this.selectedIds;
            this.storeState(initialState);
        }

        unselectAll(storeState: boolean = true): void {
            this.selectedIds = [];

            if (storeState) {
                var initialState = this.getInitialState();
                initialState.selectedIds = this.selectedIds;
                this.storeState(initialState);
            }
        }

        updateSelected($event, id): void {
            var checkbox = $event.target;
            if (checkbox.checked) {
                this.selectedIds.push(id);
            } else {
                this.selectedIds.splice(this.selectedIds.indexOf(id), 1);
            }

            var initialState = this.getInitialState();
            initialState.selectedIds = this.selectedIds;
            this.storeState(initialState);
        }

        shouldShow(id: string): boolean {
            if (this.showSelectedOnly) {
                return this.isSelected(id);
            }
            return true;
        }

        changeShowSelectedOnly(): void {
            var initialState = this.getInitialState();
            initialState.showSelectedOnly = this.showSelectedOnly;
            this.storeState(initialState);
        }

        needsPager() {
            return Math.ceil(this.itemCount / this.pageSize) > 1;
        }

        reloadList() {
            var tableState = this.tableController.tableState();
            tableState.pagination.start = 0;
            this.loadEntities(tableState, null);
        }

        reloadListWithSamePageAndSelectedState() {
            var tableState = this.tableController.tableState();
            this.loadEntities(tableState, null, false);
        }

        buildFilter(): string {
            var build = this.filtersCollection.build();
            return build;
        }

        loadEntities(tableState: any, ctrl: any, unselectItems: boolean = true) {
            if (ctrl) {
                this.tableController = ctrl;
            }
            this.spinnerService.show();
            if (!this.loadedInitialState) {
                var initialState = this.getInitialState();
                tableState.sort.predicate = initialState.sort;
                tableState.sort.reverse = !initialState.sortAscending;
                tableState.pagination.start = initialState.start;
                this.archiveFilter = initialState.archiveFilter;
                this.showSelectedOnly = initialState.showSelectedOnly;
                this.selectedIds = initialState.selectedIds || [];
                unselectItems = !initialState.selectedIds || initialState.selectedIds.length === 0;
                this.filtersCollection = new ListFilterCollection(initialState.filters);
                this.loadedInitialState = true;
            } else {
                this.storeState({
                    sort: tableState.sort.predicate,
                    sortAscending: !tableState.sort.reverse,
                    start: tableState.pagination.start,
                    archiveFilter: this.archiveFilter,
                    showSelectedOnly: this.showSelectedOnly,
                    selectedIds: this.selectedIds,
                    filters: this.filtersCollection.getFilters()
                });
            }
            tableState.pagination.number = tableState.pagination.number || this.pageSize;
            tableState.pagination.start = tableState.pagination.start || 0;

            var sort = "";
            if (typeof (tableState.sort.predicate) !== "undefined" && tableState.sort.predicate) {
                var sortingParts = tableState.sort.predicate.split("-");
                if (tableState.sort.reverse) {
                    for (var x = 0; x < sortingParts.length; x++) {
                        sortingParts[x] = sortingParts[x] + " desc";
                    }
                }
                sort = "&$orderby=" + sortingParts.join(",");
            }

            this.$http.get(`${this.serviceUri}?${this.buildFilter()}${this.isArchivable ? `&archiveFilter=${this.archiveFilter}` : ""}&$skip=${tableState.pagination.start}&$top=${this.pageSize}&$count=true${sort}&$select=${this.propertiesToSelect}`)
                .success((entities: Array<any>) => this.afterLoadEntities(tableState, unselectItems, entities));
        }

        afterLoadEntities(tableState: any, unselectItems: boolean, entities: Array<any>) {
            this.entities = (<any>entities).value;
            if (unselectItems) {
                this.unselectAll(false);
                this.showSelectedOnly = false;
            } else {
                this.updateSelectedBasedOnCurrentEntities();
            }

            this.itemCount = (<any>entities)["@odata.count"];
            tableState.pagination.totalItemCount = this.itemCount;
            tableState.pagination.numberOfPages = Math.ceil(this.itemCount / this.pageSize);

            this.$scope.$broadcast("repeatfinished");
            this.spinnerService.hide();

            this.ensureValidPageIsSelected(tableState);
        }

        updateSelectedBasedOnCurrentEntities() {
            var originalSelectedIds = this.selectedIds;
            this.unselectAll(false);
            for (var x = 0; x < this.entities.length; x++) {
                if (originalSelectedIds.indexOf(this.entities[x].id) >= 0) {
                    this.selectedIds.push(this.entities[x].id);
                }
            }
        }

        ensureValidPageIsSelected(tableState: any) {
            if (tableState.pagination.start > 0 && tableState.pagination.start >= this.itemCount) {
                tableState.pagination.start = tableState.pagination.start - this.pageSize;
                this.loadEntities(tableState, null);
            }
        }

        getInitialState(): EntityListState {
            return this.getDefaultState();
        }

        getDefaultState(): EntityListState {
            return {
                sort: this.defaultSort,
                sortAscending: this.defaultSortAscending,
                start: 0,
                archiveFilter: ArchiveFilter.Active,
                showSelectedOnly: false,
                selectedIds: [],
                filters: []
            };
        }

        storeState(entityListState: EntityListState): void {
            // we don't want to store state unless we are on a specific implementations of this
        }

        editColumns = () => {
            this.$rootScope.$broadcast("editColumns", {
                formName: this.formName,
                columns: this.propertiesToSelect,
                pluralizedEntityName: this.pluralizedEntityName,
                templateName: this.pluralizedParentEntityName,
                templateId: this.parentEntityId
            });
        };

        multipleAssignEntities(assignmentName: string) {
            this.multipleAssignmentName = assignmentName;
        }

        pageChanged() {
        }

        private fillParents() {
            if (!this.pluralizedParentEntityName || !this.parentEntityId) {
                return;
            }

            this.parents = [this.pluralizedParentEntityName];
            this.parentIds = [this.parentEntityId];

            var url = this.$location.url();
            if (url.indexOf("?") === -1) {
                return;
            }

            var query = url.substring(url.indexOf("?") + 1);
            var queryParts = query.split("&");
            for (var i = 0; i < queryParts.length; i++) {
                if (queryParts[i].indexOf("parents=") === 0) {
                    this.parents = queryParts[i].replace("parents=", "").split(",").concat(this.parents);
                } else if (queryParts[i].indexOf("parentids=") === 0) {
                    this.parentIds = queryParts[i].replace("parentids=", "").split(",").concat(this.parentIds);
                }
            }
        }

        getParentsForUrl() {
            if (!this.parents || this.parents.length === 0) {
                return "";
            }

            return `parents=${this.parents.join(',')}&parentids=${this.parentIds.join(',')}`;
        }

        isDisabledCheckbox(id) {
            return false;
        }

        private focusOnInputMicrosoftEdgeFix() {
            const kendoMicrosoftEdgeClass = ".k-edge";
            const quickFilterInput = $(kendoMicrosoftEdgeClass + " .filtering-actions #quick-filter");

            if (quickFilterInput.length) {
                quickFilterInput.focus();
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("EntityListController", EntityListController);
}