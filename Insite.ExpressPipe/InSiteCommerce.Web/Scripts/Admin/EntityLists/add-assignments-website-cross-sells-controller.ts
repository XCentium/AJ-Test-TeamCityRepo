module insite_admin {
    "use strict";

    export class AddAssignmentsWebsiteCrossSellsController extends AddAssignmentsController {

       getDefaultState(): EntityListState {
            var defaultState = super.getDefaultState();
            var listFilter = new ListFilter();
            if (this.parentModel.categories.length > 0) {
                var filter = [];
                this.parentModel.categories.forEach((category: any) => {
                    filter.push(`c/Id eq ${category.id}`);
                });
                listFilter.raw = `categories/any(c: ${filter.join(" or ")})`;
            } else {
                listFilter.raw = "false";
            }

            defaultState.filters.push(listFilter);
            return defaultState;
        }
    }

    function addAssignmentsWebsiteCrossSellsDirective() {
        return {
            restrict: "E",
            controller: "AddAssignmentsWebsiteCrossSellsController",
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
        }
    }

    angular
        .module("insite-admin")
        .controller("AddAssignmentsWebsiteCrossSellsController", AddAssignmentsWebsiteCrossSellsController)
        .directive("isaAddAssignmentsWebsiteCrossSells", <any>addAssignmentsWebsiteCrossSellsDirective);
}