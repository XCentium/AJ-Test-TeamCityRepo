module insite.catalog {
    import CategoryFacetDto = Insite.Core.Plugins.Search.Dtos.CategoryFacetDto;
    import AttributeValueFacetDto = Insite.Core.Plugins.Search.Dtos.AttributeValueFacetDto;
    import PriceFacetDto = Insite.Core.Plugins.Search.Dtos.PriceFacetDto;
    "use strict";

	export class MorscoCategoryLeftNavController extends CategoryLeftNavController {
		updateProductDataArray: (param: { catIds: any[], selectedFacet: any }) => void;
        categoryIds: any[] = [];
        selectedFacet; any;
        
        constructor(
            protected $timeout: ng.ITimeoutService,
            protected $window: ng.IWindowService
        ) {
            super($timeout, $window);
        }

        toggleFilter(attributeValueId: string) {
            this.products.attributeTypeFacets.forEach((facet) => {
                facet.attributeValueFacets.forEach((attribute) =>
                {
                    if (attribute.attributeValueId === attributeValueId) {
                        this.selectedFacet = facet;
                    }
                });
                
            });
            this.changeArrayValue(attributeValueId, this.attributeValueIds);
            this.products.pagination.currentPage = 1;
            this.getSelectedFilters();
            this.runCategoryFilter();
        }

		runCategoryFilter() {
            this.updateProductDataArray({ catIds: this.categoryIds, selectedFacet: this.selectedFacet });
		    this.products.categoryFacets.forEach((category) => {
		        this.categoryIds.forEach((selectedCategory) => {
                    if (category.categoryId === selectedCategory.categoryId) {
                        category.selected = true;
                    }
		        });
		    });
		}

        toggleCategory(categoryFacet: CategoryFacetDto) {
			var self = this;
            this.products.pagination.currentPage = 1;

            if (categoryFacet && !categoryFacet.selected) {
                this.filterCategory.categoryId = categoryFacet.categoryId;
                this.filterCategory.shortDescription = categoryFacet.shortDescription;
            }

            categoryFacet.selected = !categoryFacet.selected;
            var existsAtPosition = -1;
            
			for (var i = 0, len = this.categoryIds.length; i < len; i++) {
                if (this.categoryIds[i].categoryId == categoryFacet.categoryId) {
					existsAtPosition = i;
					break;
				}
			}

            if (existsAtPosition >= 0) {
                this.categoryIds.splice(existsAtPosition, 1);
            } else {
                this.categoryIds.push(categoryFacet);
            }
			
            this.runCategoryFilter();
        }

		clearFilters() {
			this.categoryIds = [];
			this.runCategoryFilter();
			super.clearFilters();
        }

    }

   angular.module("insite")
       .controller("CategoryLeftNavController", MorscoCategoryLeftNavController);
} 