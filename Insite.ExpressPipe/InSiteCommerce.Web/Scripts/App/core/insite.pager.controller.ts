module insite.core {
    "use strict";

    export class PagerController {

        bottom: boolean;
        customContext: any;
        pagination: PaginationModel;
        storageKey: string;
        updateData: () => void;
        pageChanged: () => void;

        static $inject = [
            "paginationService",
            "$window"
        ];

        constructor(
            protected paginationService: core.IPaginationService,
            protected $window: ng.IWindowService) {
        }

        showPager() {
            return this.pagination && (this.showPerPage() || this.showPagination() || this.showSortSelector());
        }

        showSortSelector() {
            return !this.bottom && this.pagination.sortOptions != null && this.pagination.sortOptions.length > 1;
        }

        showPerPage() {
            return !this.bottom && this.pagination.totalItemCount > this.pagination.defaultPageSize;
        }

        showPagination() {
            return this.pagination.numberOfPages > 1;
        }

        nextPage() {
            this.$window.scrollTo(0,0);
            this.pagination.currentPage = Number(this.pagination.currentPage) + 1;
            if (this.pageChanged) {
                this.pageChanged();
            }
            this.updateData();
        }

        prevPage() {
            this.$window.scrollTo(0, 0);
            this.pagination.currentPage -= 1;
            if (this.pageChanged) {
                this.pageChanged();
            }
            this.updateData();
        }

        pageInput() {
            if (this.pagination.currentPage > this.pagination.numberOfPages) {
                this.pagination.currentPage = this.pagination.numberOfPages;
            } else if (this.pagination.currentPage < 1) {
                this.pagination.currentPage = 1;
            }
            if (this.pageChanged) {
                this.pageChanged();
            }
            this.updateData();
        }

        updatePageSize() {
            if (this.storageKey)
                this.paginationService.setDefaultPagination(this.storageKey, this.pagination);

            this.pagination.currentPage = 1;
            if (this.pageChanged) {
                this.pageChanged();
            }
            this.updateData();
        }

        updateSortOrder() {
            this.pagination.currentPage = 1;
            if (this.pageChanged) {
                this.pageChanged();
            }
            this.updateData();
        }
    }

    angular
        .module("insite")
        .controller("PagerController", PagerController);
}
