module insite_admin {
    "use strict";

    export class AddAssignmentsDistributionController extends AddAssignmentsController {

        messagetargetsUrl = "/api/v1/admin/messagetargets";

        static $inject = [
            "$rootScope",
            "$http",
            "$location",
            "$scope",
            "FoundationApi",
            "entityDefinitionService",
            "notificationService",
            "$route",
            "$templateCache",
            "$q"
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
            protected $templateCache: ng.ITemplateCacheService,
            protected $q: ng.IQService
        ) {
            super($rootScope, $http, $location, $scope, $foundationApi, entityDefinitionService, notificationService, $route, $templateCache);

            this.serviceUri = `/api/v1/admin/${this.pluralizedParentEntityName}`;
        }

        getDefaultState(): EntityListState {
            var defaultState = super.getDefaultState();
            defaultState.filters = [];
            return defaultState;
        }

        assignSelected(): void {
            this.spinnerService.show();
            this.loadCustomers();
        }

        private loadCustomers(): void {
            var filter = [], i, index = -1;
            for (i = 0; i < this.selectedIds.length; i++) {
                if (i % 15 === 0) {
                    filter.push([]);
                    index++;
                }
                filter[index].push(`(targetKey eq '${this.selectedIds[i]}')`);
            }

            var requests = [];
            for (i = 0; i <= index; i++) {
                var filterString = `(${filter[i].join(" or ")}) and messageId eq ${this.parentEntityId} and targetType eq 'Customer'`;
                requests.push(this.$http.get(`/api/v1/admin/messagetargets?$filter=${filterString}&$select=targetkey`));
            }
            
            // this will allow to select more items (solve GET request limit)
            this.$q.all(requests).then((result: any) => {
                var customers = {};
                for (var r = 0; r <= index; r++) {
                    for (i = 0; i < result[r].data.value.length; i++) {
                        customers[result[r].data.value[i].targetKey] = true;
                    }
                }
                this.assignSelectedCustomers(customers);
            });
        }

        private assignSelectedCustomers(ids: any): void {
            var requests = [];
            for (var i = 0; i < this.selectedIds.length; i++) {
                if (!ids[this.selectedIds[i]]) {
                    requests.push(this.$http.post(this.messagetargetsUrl, { messageId: this.parentEntityId, targetType: "Customer", targetKey: this.selectedIds[i] }));
                }
            }
            
            this.$q.all(requests).then(() => {
                this.hasChangedAssignments = true;
                this.reloadListWithSamePageAndSelectedState();
                this.notificationService.show(NotificationType.Success, `Assigned ${requests.length} ${this.collectionName}`);
            });
        }
    }

    function addAssignmentsDistributionDirective() {
        return {
            restrict: "E",
            controller: "AddAssignmentsDistributionController",
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
        .controller("AddAssignmentsDistributionController", AddAssignmentsDistributionController)
        .directive("isaAddAssignmentsDistribution", <any>addAssignmentsDistributionDirective);
}