module insite_admin {
    "use strict";

    export class RelationshipsController extends EntityListController {
        collectionName: string;
        manyToManyPluralizedEntityName: string;
        systemListValueId: string;
        parentEntityId: string;
        parentIdColumn: string;
        relatedEntityIdColumn: string;
        relationshipType: string;
        
        hasChangedAssignments: boolean;
        displayList: boolean;
        popupOpened = false;

        static $inject = [
            "$rootScope",
            "$q",
            "$http",
            "$location",
            "$scope",
            "deleteEntityService",
            "entityDefinitionService",
            "$route",
            "$templateCache"
        ];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $q: ng.IQService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected $scope: ng.IScope,
            protected deleteEntityService: IDeleteEntityService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService
        ) {
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);

            this.allowEditColumns = false;

            if (this.parentEntityId !== "") {
                this.displayList = true;
            }

            this.$scope.$on(`relationshipsChanged-${this.collectionName}-${this.relationshipType}`, () => {
                this.reloadListWithSamePageAndSelectedState();
            });
        }

        assignEntities(): void {
            this.$scope.$broadcast(`addRelationships-${this.collectionName}-${this.relationshipType}`);
        }

        unassignSelected(): void {
            this.spinnerService.show();
            var allRequests = new Array<ng.IPromise<any>>();
            var idsToDelete = [];
            this.selectedIds.forEach(id => {
                var deferred = this.$q.defer();
                var filter = `systemListValueId eq ${this.systemListValueId} and ${this.parentIdColumn} eq ${this.parentEntityId} and ${this.relatedEntityIdColumn} eq ${id}`;
                this.$http.get(`/api/v1/admin/${this.manyToManyPluralizedEntityName}?$filter=${filter}&$select=id`).success((models) => {
                    idsToDelete.push((<any>models).value[0].id);
                    deferred.resolve();
                });
                allRequests.push(deferred.promise);
            });

            this.$q.all(allRequests).then(() => {
                this.deleteEntityService.delete(this.manyToManyPluralizedEntityName, idsToDelete).then(() => {
                    this.reloadListWithSamePageAndSelectedState();
                });
            });
        }

        getDefaultState(): EntityListState {
            var defaultState = super.getDefaultState();
            var listFilter = new ListFilter();
            listFilter.raw = `${this.collectionName}/any(o: o/${this.parentIdColumn} eq ${this.parentEntityId} and o/systemListValueId eq ${this.systemListValueId})`;
            defaultState.filters.push(listFilter);
            return defaultState;
        }
    }

    function relationshipsDirective() {
        return {
            restrict: "E",
            controller: "RelationshipsController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                manyToManyPluralizedEntityName: "@",
                systemListValueId: "@",
                pageSize: "@",
                parentEntityId: "=",
                parentIdColumn: "@",
                pluralizedEntityName: "@",
                propertiesToSelect: "@",
                relatedEntityIdColumn: "@",
                relationshipType: "@"
            },
            templateUrl(elemnt, attrs) {
                return `relationships-${attrs.collectionName}-${attrs.relationshipType}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("RelationshipsController", RelationshipsController)
        .directive("isaRelationships", <any>relationshipsDirective);
}