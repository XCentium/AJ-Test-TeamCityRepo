module insite_admin {
    "use strict";

    export interface ICategoryResult
    {
        text: string;
        id: string;
        parentId: string;
        items: ICategoryResult[];
    }

    export class SearchCategoryProductSortingController {
        tree: ICategoryResult[];
        treeView: kendo.ui.TreeView;
        treeData: kendo.data.HierarchicalDataSource;
        entityListCtrl: EntitiesController;
        serviceUri = "/api/v1/admin/products";

        websiteId: string;
        sortOrderEdit: number;

        categories: ICategoryResult[];
        editProduct: { id:string; sortOrder:number; name:string; shortDescription:string };

        static $inject = [
            "$http",
            "$scope",
            "spinnerService",
            "FoundationApi"];
        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any
        ) {
            this.entityListCtrl = (<any>$scope.$parent).entityListCtrl;            
            this.entityListCtrl.editSingleRecord = <any>this.editSingleRecord; // hijack
            this.entityListCtrl.storeState = this.storeState;
        }

        entityDefinitionLoaded(): void {
        }

        websiteChanged(websiteId) {
            this.websiteId = websiteId;
            if (websiteId) {
                this.categories = [];
                this.spinnerService.show();
                this.loadCategories(0);
            }
        }

        categoryLoadFinished() {
            this.tree = this.createCategoryTree(this.categories);
            this.tree.unshift({ text: "All Categories", id: null, parentId: null, items: null });
            this.treeData = new kendo.data.HierarchicalDataSource({
                data: this.tree                
            });
            
            setTimeout(() => {                                
                var node = $('#categoryTree li:first')
                if (node) {
                    this.treeView.select(node);
                }
            }, 100);
        }

        // load all categories for the current website, 100 at a time and call categoryLoadFinished when finished
        loadCategories(skip: number) {
            var max = 100;
            var categoryUrl = "/api/v1/admin/categories/?$filter=(websiteId eq " + this.websiteId + ")&$orderby=shortDescription&$select=shortDescription,id,parentId&$top=" + max + "&$skip=" + skip;
            this.$http.get(categoryUrl).success((result: any) => {
                var mapped = result.value.map(c => { return { text: c.shortDescription, id: c.id, parentId: c.parentId } });
                this.categories = this.categories.concat(mapped);
                if (result.value.length == max) {
                    this.loadCategories(skip + max);
                } else {
                    this.spinnerService.hide();
                    this.categoryLoadFinished();
                }
            });
        }        

        createCategoryTree(categoryList: ICategoryResult[]): ICategoryResult[] {

            var treeList: ICategoryResult[] = [];
            var idToNodeMap = {}; 

            for (var i = 0; i < categoryList.length; i++) {
                var category = categoryList[i];
                idToNodeMap[category.id] = category;
              
            }

            for (var i = 0; i < categoryList.length; i++) {
                var category = categoryList[i];
                if (category.parentId == null) {
                    treeList.push(category);
                }
                else
                {        
                    var parentNode: ICategoryResult = idToNodeMap[category.parentId];
                    if (parentNode == null) {
                        continue;
                    }
                    if (!parentNode.items) {
                        parentNode.items = [];
                    }
                    parentNode.items.push(category);
                }
            }
            return treeList;
        }

        clickCategory(dataItem) {

            if (dataItem) {
                // change the category filter but keep other filters
                var currentFilters = this.entityListCtrl.filtersCollection.getFilters();
                if (currentFilters.length > 0) {
                    var nonCategoryFilters = currentFilters.filter((f) => { return f.raw == null; });
                    this.entityListCtrl.filtersCollection.replace(nonCategoryFilters);
                }

                if (dataItem.id) {
                    var filter = new ListFilter();
                    filter.raw = "categories/any(o: o/id eq " + dataItem.id + ")";
                    this.entityListCtrl.filtersCollection.add(filter);                
                }
                
                this.entityListCtrl.reloadList();
            }
        }

        expandAll() {
            this.treeView.expand(".k-item");

        }

        collapseAll() {
            this.treeView.collapse(".k-item");
        }

        editSingleRecord = (event, id) => {
            event.originalEvent.preventDefault();
            this.editProduct = this.entityListCtrl.entities.find((p) => { return p.id == id });
            this.sortOrderEdit = this.editProduct.sortOrder;
            this.$foundationApi.publish("sortordermodel", "open");
        }

        storeState(entityListState: EntityListState): void {
            // don't store state for this page because tree isn't saved between page loads
        }

        save() {
            if (<any>this.sortOrderEdit === "" || typeof(this.sortOrderEdit) === "undefined") {
                return;
            }

            this.$http({
                method: "PATCH",
                url: `${this.serviceUri}(${this.editProduct.id})`,
                data: { sortOrder: this.sortOrderEdit }
            }).success(model => {
                this.$foundationApi.publish("sortordermodel", "close");
                this.editProduct.sortOrder = this.sortOrderEdit;
            }).error(model => {
            });
        }
    }

    var searchCategoryProductSortingDirective : ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            restrict: "E",
            controller: "SearchCategoryProductSortingController",
            controllerAs: "entityListCtrl",
            scope: {
            },
            bindToController: true,
            templateUrl(elemnt, attrs) {
                return '/admin/search/searchcategoryproductsorting';
            }
        };
        return directive;
    }

    angular
        .module("insite-admin")
        .controller("SearchCategoryProductSortingController", SearchCategoryProductSortingController)
        .directive("isaSearchCategoryProductSorting", searchCategoryProductSortingDirective);
}
