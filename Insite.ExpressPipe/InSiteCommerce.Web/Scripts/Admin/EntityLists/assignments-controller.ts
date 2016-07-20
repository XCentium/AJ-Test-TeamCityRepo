module insite_admin {
    import Core = insite.core;
    "use strict";

    export class AssignmentsController extends EntityListController {
        collectionName: string;
        parentEntityId: string;
        pluralizedParentEntityName: string;
        parentModel: any;

        displayList: boolean;

        static $inject = [
            "$rootScope",
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
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected $scope: ng.IScope,
            protected deleteEntityService: IDeleteEntityService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService
        ) {
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);

            if (this.parentEntityId !== "") {
                this.displayList = true;
            }

            this.serviceUri = `/api/v1/admin/${this.pluralizedParentEntityName}(${this.parentEntityId})/${this.collectionName}`;

            this.$scope.$on(`assignmentsChanged-${this.collectionName}`, () => {
                this.reloadListWithSamePageAndSelectedState();
            });
        }

        assignEntities(): void {
            this.$scope.$broadcast(`addAssignments-${this.collectionName}`);
        }

        unassignSelected(): void {
            this.spinnerService.show();
            this.$http.delete(`${this.serviceUri}/$ref`, {
                data: { value: this.selectedIds },
                headers: { "Content-Type": "application/json;charset=utf-8" }
            }).success(() => {
                this.reloadListWithSamePageAndSelectedState();
            });
        }

        getParentsForUrl() {
            return "";
        }
    }
    
    function assignmentsDirective() {
        return {
            restrict: "E",
            controller: "AssignmentsController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                isArchivable: "=",
                pageSize: "@",
                parentEntityId: "=",
                parentModel: "=",
                pluralizedEntityName: "@",
                pluralizedParentEntityName: "@",
                propertiesToSelect: "@",
                ditchGridBlocks: "="
            },
            templateUrl(elemnt, attrs) {
                return `assignments-${attrs.collectionName}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("AssignmentsController", AssignmentsController)
        .directive("isaAssignments", <any>assignmentsDirective)
        .directive("isaAssignmentsWebsiteCrossSells", <any>assignmentsDirective);
}