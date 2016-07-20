module insite_admin {
    "use strict";

    export class AddAssignmentsController extends EntityListController {
        parentModel: any;

        relatedCollectionName: string;
        collectionName: string;
        parentEntityId: string;
        pluralizedParentEntityName: string;
        filter: string;

        hasChangedAssignments: boolean;
        displayList: boolean;
        popupOpened = false;

        static $inject = [
            "$rootScope",
            "$http",
            "$location",
            "$scope",
            "FoundationApi",
            "entityDefinitionService",
            "notificationService",
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
            protected notificationService: INotificationService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService
        ) {
            super($rootScope, $http, $location, entityDefinitionService, $scope, $templateCache, $route);
        
            this.allowEditColumns = false;

            if (this.parentEntityId !== "") {
                this.displayList = true;
            }

            if (this.pluralizedEntityName == "attributeValues") {
                // odata function that only returns attributeValues that are assignable to a particular product
                this.serviceUri = this.serviceUri + "/forproduct(productId=" + this.parentEntityId + ")";
            }

            this.$scope.$on(`addAssignments-${this.collectionName}`, (event: ng.IAngularEvent) => {
                this.popupOpened = true;
                this.reloadList();
                this.hasChangedAssignments = false;
                this.$foundationApi.publish(`addAssignments-${this.collectionName}-modal`, "open");
                this.displayList = true;
            });
        }

        close(): void {
            this.$foundationApi.publish(`addAssignments-${this.collectionName}-modal`, "close");
            this.displayList = false;
            if (this.hasChangedAssignments) {
                this.$scope.$emit(`assignmentsChanged-${this.collectionName}`);
            }
        }

        assignSelected(): void {
            this.spinnerService.show();
            this.$http.post(`/api/v1/admin/${this.pluralizedParentEntityName}(${this.parentEntityId})/${this.collectionName}/$ref`, { value: this.selectedIds }).success(() => {
                this.hasChangedAssignments = true;
                this.reloadListWithSamePageAndSelectedState();
                this.notificationService.show(NotificationType.Success, `Assigned ${this.selectedIds.length} ${this.collectionName}`);
            });
        }

        getDefaultState(): EntityListState {
            var defaultState = super.getDefaultState();
            var listFilter = new ListFilter();
            listFilter.raw = `not ${this.relatedCollectionName}/any(o: o/Id eq ${this.parentEntityId}) and Id ne ${this.parentEntityId}`;
            defaultState.filters.push(listFilter);
            if (this.filter) {
                var additionalFilter = new ListFilter();
                additionalFilter.raw = this.filter.replace(/{([\w\.]+)}/g, (match, property) => {
                    var value = this;
                    var parts = property.split(".");
                    for (var i = 0; i < parts.length; i++) {
                        value = value[parts[i]];
                    }

                    return value.toString();
                });
                defaultState.filters.push(additionalFilter);
            }
            return defaultState;
        }

        loadEntities(tableState: any, ctrl: any, unselectItems: boolean = true) {
            if (!this.popupOpened) {
                if (typeof (this.tableController) === "undefined") {
                    this.tableController = ctrl;
                }
                return;
            }
            super.loadEntities(tableState, ctrl, unselectItems);
        }

        getParentsForUrl() {
            return "";
        }
    }

    function addAssignmentsDirective() {
        return {
            restrict: "E",
            controller: "AddAssignmentsController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                relatedCollectionName: "@",
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
                entityName: "@",
                filter: "@",
                pageSize: "@",
                parentEntityId: "@",
                parentModel: "=",
                pluralizedParentEntityName: "@",
                pluralizedEntityName: "@",
                propertiesToSelect: "@"
            },
            templateUrl(elemnt, attrs) {
                return `addAssignments-${attrs.collectionName}`;
            }
        };
    }

    angular
        .module("insite-admin")
        .controller("AddAssignmentsController", AddAssignmentsController)
        .directive("isaAddAssignments", <any>addAssignmentsDirective);
}