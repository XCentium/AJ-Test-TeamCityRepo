module insite_admin {
    "use strict";

    export class AddMultipleAssignmentsController extends EntityListController {
        collectionName: string;
        parentEntityIds: string[];
        pluralizedParentEntityName: string;
        
        displayList: boolean;
        unselectedIds: string[];
        assignedEntities: {};

        static $inject = [
            "$rootScope",
            "$q",
            "$http",
            "$location",
            "FoundationApi",
            "entityDefinitionService",
            "notificationService",
            "$scope",
            "$route",
            "$templateCache"
        ];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $q: ng.IQService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected $foundationApi: any,
            protected entityDefinitionService: EntityDefinitionService,
            protected notificationService: INotificationService,
            protected $scope: ng.IScope,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService)
        {
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);

            this.allowEditColumns = false;
            this.unselectedIds = [];
            this.assignedEntities = {};

            if (this.parentEntityIds !== null) {
                this.displayList = true;
            }
        }

        close(): void {
            this.$foundationApi.publish(`addMultipleAssignments-${this.collectionName}-modal`, "close");
        }

        areNoneSelected(): boolean {
            return this.selectedIds.length === 0;
        }

        areNoneChanged(): boolean {
            return this.selectedIds.length === 0;
        }

        assignSelected(): void {
            var allRequests = new Array<ng.IPromise<any>>();
            this.parentEntityIds.forEach(item => {
                if (this.selectedIds.length > 0) {
                    var deferred = this.$q.defer();
                    this.$http.post(`/api/v1/admin/${this.pluralizedParentEntityName}(${item})/${this.collectionName}/$ref`, { value: this.selectedIds }).success(() => {
                        deferred.resolve();
                    });
                    allRequests.push(deferred.promise);
                }

                if (this.unselectedIds.length > 0) {
                    this.$http.delete(`/api/v1/admin/${this.pluralizedParentEntityName}(${item})/${this.collectionName}/$ref`, {
                        data: { value: this.unselectedIds },
                        headers: { "Content-Type": "application/json;charset=utf-8" }
                    });
                }
            });
            this.$q.all(allRequests).then(() => {
                this.notificationService.show(NotificationType.Success, `Assigned ${this.selectedIds.length} ${this.collectionName} to ${this.parentEntityIds.length} ${this.pluralizedParentEntityName}`);
                this.unselectAll();
                this.close();
            });
        }

        getDefaultState(): EntityListState {
            var defaultState = super.getDefaultState();

            for (var x = 0; x < this.parentEntityIds.length; x++) {
                var listFilter = new ListFilter();
                listFilter.raw = `Id ne ${this.parentEntityIds[x]}`;
                defaultState.filters.push(listFilter);
            }

            return defaultState;
        }

        updateSelectedBasedOnCurrentEntities() {
            var originalSelectedIds = this.selectedIds;
            super.unselectAll();
            for (var x = 0; x < this.entities.length; x++) {
                if (originalSelectedIds.indexOf(this.entities[x].id) >= 0) {
                    this.selectedIds.push(this.entities[x].id);
                }
            }
        }

        getParentsForUrl() {
            return "";
        }
    }

    function addMultipleAssignmentsDirective() {
        return {
            restrict: "E",
            controller: "AddMultipleAssignmentsController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                entityName: "@",
                pageSize: "@",
                parentEntityIds: "=",
                pluralizedParentEntityName: "@",
                pluralizedEntityName: "@",
                propertiesToSelect: "@"
                
            },
            templateUrl(elemnt, attrs) {
                return `addMultipleAssignments-${attrs.collectionName}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("AddMultipleAssignmentsController", AddMultipleAssignmentsController)
        .directive("isaAddMultipleAssignments", <any>addMultipleAssignmentsDirective);
}