module insite_admin {
    "use strict";

    export class OneToManyRelationshipsController extends EntityListController {
        collectionName: string;
        parentEntityId: string;
        childrenColumn: string;
        parentIdColumn: string;

        hasChangedAssignments: boolean;
        displayList: boolean;
        popupOpened = false;

        static $inject = [
            "$rootScope",
            "$q",
            "$http",
            "$location",
            "$scope",
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
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService
        ) {
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);

            this.allowEditColumns = false;

            if (this.parentEntityId !== "") {
                this.displayList = true;
            }

            this.$scope.$on(`oneToManyRelationshipsChanged-${this.collectionName}-${this.childrenColumn}`, () => {
                this.reloadListWithSamePageAndSelectedState();
            });
        }

        assignEntities(): void {
            this.$scope.$broadcast(`addOneToManyRelationships-${this.collectionName}-${this.childrenColumn}`);
        }

        unassignSelected(): void {
            this.spinnerService.show();
            this.$http.delete(`${this.serviceUri}(${this.parentEntityId})/${this.childrenColumn}/$ref`, {
                data: { value: this.selectedIds },
                headers: { "Content-Type": "application/json;charset=utf-8" }
            }).success(() => {
                this.reloadListWithSamePageAndSelectedState();
            });
        }

        buildFilter(): string {
            var filter = super.buildFilter();

            if (filter === "") {
                filter = "&$filter=";
            } else {
                filter += " and ";
            }
            
            filter += `${this.parentIdColumn} eq ${this.parentEntityId}`;
            return filter;
        }

        editRelatedEntity(eventName: string, entityId: string) {
            this.$rootScope.$broadcast(`${eventName}-${this.collectionName}-${this.childrenColumn}`, { model: this.entities.find(x => x.id == entityId) });
        }

        editSingleRecord(event, entityId) {
            this.editRelatedEntity("editEvent", entityId);
            event.preventDefault();
        }
    }
    function oneToManyRelationshipsDirective() {
        return {
            restrict: "E",
            controller: "OneToManyRelationshipsController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                childrenColumn: "@",
                parentIdColumn: "@",
                pageSize: "@",
                parentEntityId: "=",
                pluralizedEntityName: "@",
                propertiesToSelect: "@"
            },
            templateUrl(elemnt, attrs) {
                return `one-to-many-relationships-${attrs.collectionName}-${attrs.childrenColumn}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("OneToManyRelationshipsController", OneToManyRelationshipsController)
        .directive("isaOneToManyRelationships", <any>oneToManyRelationshipsDirective);
}