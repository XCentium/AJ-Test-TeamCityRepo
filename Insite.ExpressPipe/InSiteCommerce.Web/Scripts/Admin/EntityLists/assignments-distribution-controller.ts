module insite_admin {
    "use strict";

    export class AssignmentsDistributionController extends AssignmentsController {

        messagetargetsUrl = "/api/v1/admin/messagetargets";

        static $inject = [
            "$rootScope",
            "$http",
            "$location",
            "$scope",
            "deleteEntityService",
            "entityDefinitionService",
            "$route",
            "$templateCache",
            "$q"
        ];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $location: ng.ILocationService,
            protected $scope: ng.IScope,
            protected deleteEntityService: IDeleteEntityService,
            protected entityDefinitionService: EntityDefinitionService,
            protected $route: any,
            protected $templateCache: ng.ITemplateCacheService,
            protected $q: ng.IQService
        ) {
            super($rootScope, $http, $location, $scope, deleteEntityService, entityDefinitionService, $route, $templateCache);

            this.serviceUri = `/api/v1/admin/${this.pluralizedParentEntityName}` + "/formessage(messageId=" + this.parentEntityId + ")";
        }

        unassignSelected(): void {
            this.spinnerService.show();

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
                requests.push(this.$http.get(`/api/v1/admin/messagetargets?$filter=${filterString}&$select=id`));
            }

            // this will allow to select more items (solve GET request limit)
            this.$q.all(requests).then((result: any) => {
                var ids = [];
                for (var r = 0; r <= index; r++) {
                    for (i = 0; i < result[r].data.value.length; i++) {
                        ids.push(result[r].data.value[i].id);
                    }
                }

                if (ids.length === 0) {
                    return;
                }

                this.$http({
                    method: "DELETE",
                    url: this.messagetargetsUrl + "/delete",
                    params: { ids: ids }
                }).then(() => {
                    this.reloadListWithSamePageAndSelectedState();
                });
            });
        }
    }
    
    function assignmentsDistributionDirective() {
        return {
            restrict: "E",
            controller: "AssignmentsDistributionController",
            controllerAs: "entityListCtrl",
            scope: {},
            bindToController: {
                collectionName: "@",
                defaultSort: "@",
                defaultSortAscending: "@",
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
        .controller("AssignmentsDistributionController", AssignmentsDistributionController)
        .directive("isaAssignmentsDistribution", <any>assignmentsDistributionDirective);
}