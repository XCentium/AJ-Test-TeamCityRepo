module insite_admin {
    "use strict";

    export class CategoryLookupController {
        entityId: string;
        websiteId: string;
        disallowedCategoryId: string;
        isReadOnly: boolean;
        allowWebsiteSelect: boolean;

        static $inject = [
            "FoundationApi",
            "$scope"];

        constructor(
            protected $foundationApi: any,
            protected $scope: ng.IScope) {
            this.$scope.$on("categoryTree-selectedCategory", (event: ng.IAngularEvent, categoryId: string) => {
                this.entityId = categoryId;
            });
        }

        clear(): void {
            this.entityId = null;
        }

        change(): void {
            if (!this.isReadOnly) {
                this.$scope.$broadcast("categoryTree-selectCategory");
            }
        }

        hasCategory(): boolean {
            return this.entityId !== null && this.entityId !== "" && typeof(this.entityId) !== "undefined";
        }
    }

    angular
        .module("insite-admin")
        .controller("CategoryLookupController", CategoryLookupController)
        .directive("isaCategoryLookup", <any>function () {
            return {
                restrict: "E",
                controller: "CategoryLookupController",
                controllerAs: "vm",
                scope: {},
                bindToController: {
                    entityId: "=",
                    websiteId: "=",
                    disallowedCategoryId: "=",
                    isReadOnly: "=",
                    allowWebsiteSelect: "="

                },
                template: `<div class="category-lookup" ng-class="{ 'is-read-only': vm.isReadOnly }">
                    <isa-lookup-display pluralized-entity-name="categories" entity-id="{{vm.entityId}}" ng-click="vm.change()" ng-show="vm.hasCategory()"></isa-lookup-display>
                    <a class="button-change" ng-show="!vm.isReadOnly" ng-click="vm.change()"><span ng-if="vm.hasCategory()">Change</span><span ng-if="!vm.hasCategory()">Select Category</span></a>
                    <a ng-show="vm.hasCategory()" ng-click="vm.clear()">Clear</a>
                    <isa-select-category></isa-select-category>
                </div>`
            }
        }).directive("isaSelectCategory", <any>function() {
            return {
                restrict: "E",
                templateUrl: "/admin/data/selectcategory"
            }
        });

}