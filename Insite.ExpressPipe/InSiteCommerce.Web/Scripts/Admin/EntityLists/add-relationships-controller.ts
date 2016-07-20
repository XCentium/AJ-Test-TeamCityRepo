module insite_admin {
    "use strict";

    export class AddRelationshipsController extends EntityListController {
        collectionName: string;
        manyToManyPluralizedEntityName: string;
        systemListValueId: string;
        parentEntityId: string;
        parentIdColumn: string;
        relatedEntityIdColumn: string;
        relationshipType: string;

        displayList: boolean;
        hasChangedAssignments: boolean;
        popupOpened = false;

        static $inject = [
            "$rootScope",
            "$http",
            "$location",
            "$scope",
            "FoundationApi",
            "entityDefinitionService",
            "$route",
            "$templateCache"
        ];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService
        ) {
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);

            this.allowEditColumns = false;

            if (this.parentEntityId !== "") {
                this.displayList = true;
            }
            var name1 = `addRelationships-${this.collectionName}-${this.relationshipType}`;
            this.$scope.$on(name1, (event: ng.IAngularEvent) => {
                this.popupOpened = true;
                this.reloadList();
                this.hasChangedAssignments = false;
                this.$foundationApi.publish(`addRelationships-${this.collectionName}-${this.relationshipType}-modal`, "open");
                this.displayList = true;
            });
        }

        close(): void {
            this.$foundationApi.publish(`addRelationships-${this.collectionName}-${this.relationshipType}-modal`, "close");
                    this.displayList = false;
                    if (this.hasChangedAssignments) {
                        this.$scope.$emit(`relationshipsChanged-${this.collectionName}-${this.relationshipType}`);
                    }
        }

        assignSelected(): void {
            this.spinnerService.show();
            var totalToAdd = this.selectedIds.length;
            var totalAdded = 0;
            var checkFinished = () => {
                if (totalAdded === totalToAdd) {
                    this.reloadListWithSamePageAndSelectedState();
                }
            }

            for (var x = 0; x < this.selectedIds.length; x++) {
                var data = { systemListValueId: this.systemListValueId };
                data[this.parentIdColumn] = this.parentEntityId;
                data[this.relatedEntityIdColumn] = this.selectedIds[x];
                    this.$http.post(`/api/v1/admin/${this.manyToManyPluralizedEntityName}`, data, null).success(() => {
                        this.hasChangedAssignments = true;
                        totalAdded++;
                        checkFinished();
                    });
            }
        }

        getDefaultState(): EntityListState {
            var defaultState = super.getDefaultState();
            var listFilter = new ListFilter();
            listFilter.raw = `not ${this.collectionName}/any(o: o/${this.parentIdColumn} eq ${this.parentEntityId} and o/systemListValueId eq ${this.systemListValueId})`;
            defaultState.filters.push(listFilter);
            return defaultState;
        }
    }

    function addRelationshipsDirective() {
        return {
            restrict: "E",
            controller: "AddRelationshipsController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                manyToManyPluralizedEntityName: "@",
                systemListValueId: "@",
                pageSize: "@",
                parentEntityId: "@",
                parentIdColumn: "@",
                pluralizedEntityName: "@",
                propertiesToSelect: "@",
                relatedEntityIdColumn: "@",
                relationshipType: "@"
            },
            templateUrl(elemnt, attrs) {
                return `add-relationships-${attrs.collectionName}-${attrs.relationshipType}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("AddRelationshipsController", AddRelationshipsController)
        .directive("isaAddRelationships", <any>addRelationshipsDirective);
}