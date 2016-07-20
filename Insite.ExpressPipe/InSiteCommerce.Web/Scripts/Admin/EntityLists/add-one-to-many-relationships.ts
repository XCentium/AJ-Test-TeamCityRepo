module insite_admin {
    "use strict";

    export class AddOneToManyRelationshipsController extends EntityListController {
        collectionName: string;
        parentEntityId: string;
        childrenColumn: string;
        parentIdColumn: string;

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
            var name1 = `addOneToManyRelationships-${this.collectionName}-${this.childrenColumn}`;
            this.$scope.$on(name1, (event: ng.IAngularEvent) => {
                this.popupOpened = true;
                this.reloadList();
                this.hasChangedAssignments = false;
                this.$foundationApi.publish(`addOneToManyRelationships-${this.collectionName}-${this.childrenColumn}-modal`, "open");
                this.displayList = true;
            });
        }

        close(): void {
            this.$foundationApi.publish(`addOneToManyRelationships-${this.collectionName}-${this.childrenColumn}-modal`, "close");
            this.displayList = false;
            if (this.hasChangedAssignments) {
                this.$scope.$emit(`oneToManyRelationshipsChanged-${this.collectionName}-${this.childrenColumn}`);
            }
        }

        assignSelected(): void {
            this.spinnerService.show();
            var checkFinished = () => {
                this.reloadListWithSamePageAndSelectedState();
            }


            this.$http.put(`/api/v1/admin/${this.pluralizedEntityName}(${this.parentEntityId})/${this.childrenColumn}/$ref`, { value: this.selectedIds })
                .success(() => {
                    this.hasChangedAssignments = true;
                    checkFinished();
                });
        }

        buildFilter(): string {
            var filter = super.buildFilter();

            if (filter === "") {
                filter = "&$filter=";
            } else {
                filter += " and ";
            }

            filter += `styleParentId eq null and not styleChildren/any() and styleClassId eq null`;

            return filter;
        }
    }

    function addOneToManyRelationshipsDirective() {
        return {
            restrict: "E",
            controller: "AddOneToManyRelationshipsController",
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
                return `add-one-to-many-relationships-${attrs.collectionName}-${attrs.childrenColumn}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("AddOneToManyRelationshipsController", AddOneToManyRelationshipsController)
        .directive("isaAddOneToManyRelationships", <any>addOneToManyRelationshipsDirective);
}