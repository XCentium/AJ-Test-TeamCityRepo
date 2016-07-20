module insite_admin {
    "use strict";
    import Core = insite.core;

    export class CategoryTreeController implements IListController {
        allowWebsiteSelect: boolean;
        disallowedNodeId: string;
        ditchGridBlocks: boolean;
        formName: string;
        loadListImmediately: boolean;
        mode: string;
        pluralizedParentEntityName: string;
        parentAssignmentId: string;
        parentAssignmentIds: string[];
        propertiesToSelect: string;
        trackState: boolean;
        websiteId: string;
        
        categories: any[];
        itemCount: number;
        matchingCount: number;

        archiveFilter = ArchiveFilter.Both;
        
        filtersCollection = new ListFilterCollection();
        
        selectedIds: string[] = [];
        initialIdsToExpand: string[] = [];

        loadedInitialState: boolean = false;
        
        hasChangedAssignments: boolean;
        highlightedIds: string[] = [];

        multipleAssignmentName: string;

        private serviceUri = "/api/v1/admin/categories";
        private assignedCategoriesUri: string;

        static $inject = [
            "$http",
            "spinnerService",
            "$scope",
            "$rootScope",
            "entityListStateService",
            "$q",
            "$route",
            "$templateCache",
            "$location",
            "$sessionStorage",
            "adminActionService",
            "FoundationApi",
            "notificationService"
        ];
        constructor(
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $scope: ng.IScope,
            protected $rootScope: ng.IRootScopeService,
            protected entityListStateService: IEntityListStateService,
            protected $q: ng.IQService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService,
            protected $location: ng.ILocationService,
            protected $sessionStorage: Core.IWindowStorage,
            protected adminActionService: IAdminActionService,
            protected $foundationApi: any,
            protected notificationService: INotificationService
        ) {
            if (typeof (this.parentAssignmentId) !== "undefined") {
                if (!this.pluralizedParentEntityName) {
                    this.pluralizedParentEntityName = "products";
                }
                this.assignedCategoriesUri = "/api/v1/admin/" + this.pluralizedParentEntityName + "(" + this.parentAssignmentId + ")/categories";
            }

            if (typeof(this.disallowedNodeId) === "undefined") {
                this.disallowedNodeId = "";
            }

            if (this.trackState) {
                var initialState = this.getInitialState();
                this.initialIdsToExpand = (<any>initialState).expandedIds;
                if (typeof (this.initialIdsToExpand) === "undefined") {
                    this.initialIdsToExpand = [];
                }
                this.filtersCollection = new ListFilterCollection(initialState.filters);
                this.websiteId = (<any>initialState).websiteId;

                this.$scope.$on("EntityListStateChanged", (event: ng.IAngularEvent, data: any) => {
                    this.$templateCache.remove("/admin/data/categories");
                    this.$route.reload();
                });
            } else {
                this.$scope.$on("categoryTree-selectCategory", (event: ng.IAngularEvent, data: any) => {
                    var loadParent = (id: string) => {
                        if (!id) {
                            this.loadedInitialState = false;
                            this.filtersCollection = new ListFilterCollection();
                            this.reloadList();
                            this.$foundationApi.publish("selectCategoryTree", "open");
                            return;
                        }
                        this.$http.get(`/api/v1/admin/categories(${id})?$select=parentId`).then((result: any) => {
                            if (result.data.parentId !== null) {
                                this.initialIdsToExpand.unshift(result.data.parentId);
                            }
                            loadParent(result.data.parentId);
                        });
                    }
                    
                    loadParent(this.disallowedNodeId);
                });
            }

            if (this.mode === "AssignCategories") {
                this.$scope.$on("categoryTree-assignCategories", () => {
                    this.reloadList();
                    this.loadAssignedIds();
                    this.hasChangedAssignments = false;
                    this.$foundationApi.publish("assignCategoriesTree", "open");
                });
            }
            else if (this.mode === "AssignedCategories") {
                this.loadedInitialState = true;
                this.$scope.$on("assignmentsChanged-Categories", () => {
                    this.reloadList();
                });
            }

            this.$scope.$on(`deleteOrArchiveFinished-categories`, () => {
                this.reloadList();
            });

            if (this.loadListImmediately) {
                this.reloadList();
            }
        }

        loadAssignedIds(): void {
            this.highlightedIds = [];
            var current = 0;
            var pageSize = 50;
            var loadPage = () => {
                this.$http.get(`${this.assignedCategoriesUri}?$select=id&$top=${pageSize}&$skip=${current * pageSize}`).then((result: any) => {
                    for (var x = 0; x < result.data.value.length; x++) {
                        this.highlightedIds.push(result.data.value[x].id);
                    }
                    if (result.data.value.length === 50) {
                        current++;
                        loadPage();
                    }
                });
            }
            loadPage();
        }

        websiteChanged(websiteId: string) {
            this.websiteId = websiteId;
            this.reloadList();
        }

        expandAll(): void {
            // TODO this is a quick version. It works fine for small sets and we prevent them from hitting expand all on large sets
            var x = 0;
            var expandCategory = () => {
                if (x >= this.categories.length) {
                    this.storeTreeState();
                    return;
                }
                this.expand(this.categories[x], false).then(() => {
                    x++;
                    expandCategory();
                });
            }
            expandCategory();
        }

        multipleAssignEntities(assignmentName: string) {
            this.multipleAssignmentName = assignmentName;
        }

        private expandBasedOnIds(): void {
            var x = 0;
            var expandCategory = () => {
                if (x >= this.initialIdsToExpand.length) {
                    return;
                }

                for (var y = 0; y < this.categories.length; y++) {
                    if (this.categories[y].id === this.initialIdsToExpand[x]) {
                        this.expand(this.categories[y], false).then(() => {
                            x++;
                            expandCategory();
                        });
                        break;
                    }
                }
            }
            expandCategory();
        }

        expand(category: any, storeState: boolean = true): ng.IPromise<any> {
            var defer = this.$q.defer();
            var currentIndex = this.categories.indexOf(category) + 1;
            if (category.childrenLoaded) {
                category.isExpanded = true;
                for (var x = currentIndex; x < this.categories.length; x++) {
                    if (this.categories[x].level === category.level) {
                        break;
                    }
                    if (this.categories[x].level === category.level + 1) {
                        this.categories[x].isVisible = true;
                    }
                }
                this.ensureTableHeadersMatch();
                if (storeState) {
                    this.storeTreeState();    
                }
                
                defer.resolve();
            } else {
                this.getCategoriesByParent(category.id).then((result: any) => {
                    var newCategories = [];
                    for (var x = 0; x < result.categories.length; x++) {
                        newCategories.push(this.buildCategory(result.categories[x], category.level + 1));
                    }

                    this.categories.splice.apply(this.categories, [currentIndex, 0].concat(newCategories));
                    category.isExpanded = true;
                    category.childrenLoaded = true;

                    this.ensureTableHeadersMatch();
                    if (storeState) {
                        this.storeTreeState();
                    }
                    defer.resolve();
                });
            }

            return defer.promise;
        }

        collapseAll(): void {
            for (var x = 0; x < this.categories.length; x++) {
                this.collapse(this.categories[x], false);
            }
            this.storeTreeState();
        }

        collapse(category: any, storeState: boolean = true): void {
            category.isExpanded = false;
            var currentIndex = this.categories.indexOf(category) + 1;

            while (currentIndex < this.categories.length) {
                if (this.categories[currentIndex].level > category.level) {
                    this.categories[currentIndex].isVisible = false;
                    this.categories[currentIndex].isExpanded = false;
                } else {
                    break;
                }
                currentIndex++;
            }
            this.ensureTableHeadersMatch();
            if (storeState) {
                this.storeTreeState();
            }
        }

        isSelected(id: string): boolean {
            return this.selectedIds.indexOf(id) >= 0;
        }

        areNoneSelected(): boolean {
            return this.selectedIds.length === 0;
        }

        selectSingleCategory(categoryId: string): void {
            this.$scope.$emit("categoryTree-selectedCategory", categoryId);
            this.close();
        }

        close(): void {
            this.$foundationApi.publish("selectCategoryTree", "close");
            this.$foundationApi.publish("assignCategoriesTree", "close");
            this.$foundationApi.publish("addMultipleAssignments-categories-modal", "close");
            if (this.hasChangedAssignments) {
                this.$scope.$emit(`assignmentsChanged-Categories`);
            }
        }

        selectAll(): void {
            this.selectedIds = [];
            for (var x = 0; x < this.categories.length; x++) {
                if (this.categories[x].isVisible && !this.categories[x].doesNotMatchSearch && this.highlightedIds.indexOf(this.categories[x].id) === -1) {
                    this.selectedIds.push(this.categories[x].id);   
                }
            }
        }

        unselectAll(): void {
            this.selectedIds = [];
        }

        updateSelected($event, id): void {
            var checkbox = $event.target;
            if (checkbox.checked) {
                this.selectedIds.push(id);
            } else {
                this.selectedIds.splice(this.selectedIds.indexOf(id), 1);
            }
        }

        private buildCategory(category: any, level: number) {
            if (category.id === this.disallowedNodeId) {
                category.disallowed = true;
            }
            category.hasChildren = category.subCategories.length > 0;
            category.isExpanded = false;
            category.isVisible = true;
            category.childrenLoaded = !category.hasChildren;
            category.level = level;

            return category;
        }
        
        editColumns = () => {
            this.$rootScope.$broadcast("editColumns", {
                formName: this.formName,
                columns: this.propertiesToSelect,
                lockedColumns: ["shortDescription"],
                pluralizedEntityName: "categories"
            });
        };

        callAction(name: string): void {
            this.adminActionService.executeEntityListAction(this.formName, name, this.selectedIds);
        }

        callCustomAction(name: string): void {
            this.adminActionService.executeEntityListCustomAction(this.formName, name, this.selectedIds, this.$scope);
        }

        showDeleteConfirmation(): void {
            this.$scope.$broadcast("showDeleteConfirmation", true, "categories", "Categories", this.selectedIds, this.archiveFilter);
        }

        // TODO 4.2 make the next 3 directives
        importRecords() {
            this.$location.url(`/import/categories`);
        }

        exportRecords(): void {
            if (this.selectedIds.length > 0) {
                this.$sessionStorage.setObject("categories_SelectedRecords", this.selectedIds);
            } else {
                this.$sessionStorage.remove("categories_SelectedRecords");
            }
            this.$sessionStorage.setObject("categories_ExportInfo", {
                archiveFilter: this.archiveFilter,
                filter: this.buildFilter()
            });
            this.$location.url(`/export/categories`);
        }

        editMultipleRecords(): void {
            if (this.selectedIds.length > 1) {
                this.$sessionStorage.setObject("categories_SelectedRecords", this.selectedIds);
            } else {
                this.$sessionStorage.remove("categories_SelectedRecords");
            }

            this.$location.url(`/data/${this.formName != null ? this.formName : "categories"}/${this.selectedIds[0]}`);
        }

        unassignSelected(): void {
            this.spinnerService.show();
            this.$http.delete(`${this.assignedCategoriesUri}/$ref`, {
                data: { value: this.selectedIds },
                headers: { "Content-Type": "application/json;charset=utf-8" }
            }).success(() => {
                this.reloadList();
            });
        }

        assignSelected(): void {
            if (this.mode === "AssignCategories") {
                this.spinnerService.show();
                this.$http.post(`${this.assignedCategoriesUri}/$ref`, { value: this.selectedIds }).success(() => {
                    this.highlightedIds.push.apply(this.highlightedIds, this.selectedIds);
                    this.hasChangedAssignments = true;
                    this.spinnerService.hide();
                    this.unselectAll();
                });
            } else {
                var allRequests = new Array<ng.IPromise<any>>();
                this.parentAssignmentIds.forEach(item => {
                    if (this.selectedIds.length > 0) {
                        var deferred = this.$q.defer();
                        this.$http.post(`/api/v1/admin/${this.pluralizedParentEntityName}(${item})/categories/$ref`, { value: this.selectedIds }).success(() => {
                            deferred.resolve();
                        });
                        allRequests.push(deferred.promise);
                    }
                });
                this.$q.all(allRequests).then(() => {
                    this.notificationService.show(NotificationType.Success, `Assigned ${this.selectedIds.length} Categories to ${this.selectedIds.length} ${this.pluralizedParentEntityName}`);
                    this.unselectAll();
                    this.close();
                });
            }
        }

        assignCategories(): void {
            this.$scope.$broadcast("categoryTree-assignCategories");
        }

        buildFilter(): string {
            var filter = this.filtersCollection.build();
            if (filter === "") {
                filter = "&$filter=";
            } else {
                filter += " and ";
            }
            return filter + " websiteId eq " + this.websiteId;
        }

        reloadList() {
            this.selectedIds = [];
            if (this.loadedInitialState) {
                this.storeTreeState(true);
            }

            if (this.filtersCollection.any() && this.filtersCollection.getFilters().every(x => x.value !== undefined) || this.mode === "AssignedCategories") {
                this.loadFilteredCategories();
                return;
            }

            this.loadInitialCategories();
        }

        createNewRecord(): void {
            var queryString = this.websiteId ? `?parent=websiteId eq ${this.websiteId}` : "";
            if (this.isWebsiteCategoriesTree()) {
                queryString += "&parents=websites&parentids=" + this.websiteId;
            }

            var location = `data/categories/new${queryString}`;
            this.$location.url(location);
        }

        private loadFilteredCategories(): void {
            this.spinnerService.show();

            var parentIdToSubCategories = [];

            var parentsLoaded = 0;
            var filtersArray = this.filtersCollection.getFilters();

            var loadMoreParents = (categories: any, isSearchMatch: boolean) => {
                var parentIds = [];
                for (var x = 0; x < categories.length; x++) {
                    var category = categories[x];
                    category.doesNotMatchSearch = !isSearchMatch;
                    var parentId = category.parentId;
                    if (parentId !== null && parentIds.indexOf(parentId) === -1) {
                        parentIds.push(parentId);
                    }
                    if (parentId === null) {
                        parentId = "";
                    }
                    if (typeof (parentIdToSubCategories[parentId]) === "undefined") {
                        parentIdToSubCategories[parentId] = [];
                    }

                    if (typeof (parentIdToSubCategories[parentId][category.id]) === "undefined") {
                        parentIdToSubCategories[parentId][category.id] = category;
                    }
                }
                
                parentsLoaded++;
                if (parentsLoaded > 20 || (filtersArray && filtersArray.length === 1 && !filtersArray[0].value)) {
                    this.spinnerService.hide();
                    return;
                }

                if (parentIds.length > 0) {
                    var groupSize = 30;
                    var groups = Math.ceil(parentIds.length / groupSize);
                    if (groups === 0) {
                        groups = 1;
                    }
                    var finishedGroups = 0;
                    var foundCategories = [];
                    for (var groupIndex = 0; groupIndex < groups; groupIndex ++) {
                        var filter = "";
                        for (var x = groupIndex * groupSize; x < (groupIndex + 1) * groupSize && x < parentIds.length; x++) {
                            filter += " or id eq " + parentIds[x];
                        }
                        filter = filter.substring(4);
                        this.getCategories(filter).then((result: any) => {
                            finishedGroups++;
                            foundCategories = foundCategories.concat(result.categories);

                            if (finishedGroups === groups) {
                                loadMoreParents(foundCategories, false);  
                            }
                        });
                    }
    
                } else {
                    this.finishFilteringCategories(parentIdToSubCategories);
                }
            }

            this.getCategories(this.buildFilter(), true).then((result: any) => {
                this.itemCount = result.itemCount;
                if (result.categories.length !== this.itemCount) {
                    this.matchingCount = result.categories.length;
                } else {
                    this.matchingCount = 0;
                }
                loadMoreParents(result.categories, true);
            });
        }

        private storeTreeState(resetExpandedIds: boolean = false): void {
            if (!this.trackState) {
                return;
            }
            var expandedIds = [];
            if (!resetExpandedIds) {
                if (typeof (this.categories) !== "undefined") {
                    for (var x = 0; x < this.categories.length; x++) {
                        if (this.categories[x].isExpanded) {
                            expandedIds.push(this.categories[x].id);
                        }
                    }
                }
            }
            
            this.entityListStateService.setStateFor(this.cacheKey(), <any>{
                filters: this.filtersCollection.getFilters(),
                websiteId: this.websiteId,
                expandedIds: expandedIds
            });
        }

        private getInitialState(): EntityListState {
            var initialState = this.entityListStateService.getStateFor(this.cacheKey());

            if (initialState != null) {
                return initialState;
            }

            if (this.isWebsiteCategoriesTree()) {
                initialState = new EntityListState();
                (<any>initialState).websiteId = this.websiteId;
                return initialState;
            }

            return new EntityListState();
        }

        private cacheKey(): string {
            if (this.isWebsiteCategoriesTree()) {
                return this.formName + "-" + this.websiteId;
            }
            return this.formName;
        }

        private isWebsiteCategoriesTree(): boolean {
            return this.$location.path().toLowerCase().indexOf("/data/websites") >= 0;
        }

        private loadInitialCategories(): void {
            this.categories = [];
            if (typeof (this.websiteId) === "undefined") {
                return;
            }
            this.$http.get(`${this.serviceUri}?$filter=websiteId eq ${this.websiteId}&archiveFilter=${this.archiveFilter}&$top=1&$count=true`).then((results: any) => {
                this.matchingCount = 0;
                this.itemCount = results.data["@odata.count"];
            });
            this.getCategoriesByParent(null).then((result: any) => {
                for (var x = 0; x < result.categories.length; x++) {
                    this.categories.push(this.buildCategory(result.categories[x], 0));
                }
                
                if (!this.loadedInitialState) {
                    this.expandBasedOnIds();
                    this.loadedInitialState = true;
                }
            });
        }

        private finishFilteringCategories(parentIdToSubCategories: any[]) {
            this.spinnerService.hide();

            var newCategories = [];

            var loadCategories = (parentId, level, disallowed) => {
                var subCategoriesById = parentIdToSubCategories[parentId];
                if (typeof (subCategoriesById) === "undefined") {
                    return false;
                }

                var subCategories = [];
                for (var id in subCategoriesById) {
                    if (subCategoriesById.hasOwnProperty(id)) {
                        subCategories.push(subCategoriesById[id]);
                    }
                }
                subCategories.sort(this.categoryCompare);
                for (var x = 0; x < subCategories.length; x++) {
                    var category = subCategories[x];

                    if (this.loadedInitialState) {
                        category.isExpanded = true;
                        category.isVisible = true;
                    }
                    
                    category.childrenLoaded = true;
                    category.level = level;
                    if (category.level === 0) {
                        category.isVisible = true;
                    }
                    newCategories.push(category);

                    category.disallowed = disallowed || this.disallowedNodeId === category.id;
                    category.hasChildren = loadCategories(category.id, level + 1, category.disallowed);    
                }

                return true;
            }

            loadCategories("", 0, false);

            this.categories = newCategories;
            if (!this.loadedInitialState) {
                this.expandBasedOnIds();
                this.loadedInitialState = true;
            } else {
                this.storeTreeState();
            }
            this.ensureTableHeadersMatch();
        }

        private getCategoriesByParent(parentId: string): ng.IPromise<any> {
            return this.getCategories(`parentId eq ${parentId} and websiteId eq ${this.websiteId}`);
        }

        private getCategories(filter: string, useAlternateServiceUri: boolean = false): ng.IPromise<any> {
            var defer = this.$q.defer();

            if (filter.indexOf("&$filter=") !== 0) {
                filter = "&$filter=" + filter;
            }
            var top = 100;
            var page = 0;
            var paging = (page) => {
                return `&$top=${top}&$skip=${page * top}`;
            }
            var orderBy = "&$orderBy=sortOrder,shortDescription";
            var expand = "&$expand=subCategories($select=id)";
            var select = "&$select=" + this.propertiesToSelect;

            var categories = [];
            var totalMatching = 0;

            var serviceUri = useAlternateServiceUri && this.mode === "AssignedCategories" ? this.assignedCategoriesUri : this.serviceUri;

            var loadPage = () => {
                this.$http.get(`${serviceUri}?${filter}${select}&archiveFilter=${this.archiveFilter}&$count=true${paging(page)}${orderBy}${expand}`).then((categoriesResult: any) => {
                    // TODO ISC-1663 redo the total matching thing?
                    totalMatching = categoriesResult.data["@odata.count"];

                    categories.push.apply(categories, categoriesResult.data.value);

                    if (categories.length < (top * 5) && categoriesResult.data.value.length === top) {
                        page++;
                        loadPage();
                    } else {
                        defer.resolve({
                            categories: categories,
                            itemCount: totalMatching
                        });
                    }
                });
            };
            loadPage();

            return defer.promise;
        }

        private categoryCompare(category1: any, category2: any) {
            if (category1.sortOrder < category2.sortOrder) {
                return -1;
            }
            else if (category1.sortOrder > category2.sortOrder) {
                return 1;
            }
            else if (category1.shortDescription.toLowerCase() < category2.shortDescription.toLowerCase()) {
                return -1;
            }
            else if (category1.shortDescription.toLowerCase() > category2.shortDescription.toLowerCase()) {
                return 1;
            }
            return 0;
        }

        private ensureTableHeadersMatch() {
            setTimeout(() => {
                this.$scope.$emit("repeatfinished");
            }, 1);
        }
    }

    function categoryTreeDirective() {
        return {
            restrict: "E",
            controller: "CategoryTreeController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                allowWebsiteSelect: "=",
                disallowedNodeId: "=",
                ditchGridBlocks: "=",
                formName: "@",
                loadListImmediately: "=",
                mode: "@",
                pluralizedParentEntityName: "=",
                parentAssignmentId: "=",
                parentAssignmentIds: "=",
                propertiesToSelect: "@",
                trackState: "=",
                websiteId: "="
            },
            templateUrl: "category-tree"
        };
    }

    angular
        .module("insite-admin")
        .controller("CategoryTreeController", CategoryTreeController)
        .directive("isaCategoryTree", <any>categoryTreeDirective);
}