module insite.savedorders {
    "use strict";

    export class SavedOrderListController {

        pagination: PaginationModel;
        paginationStorageKey = "DefaultPagination-SavedOrderList";
        savedCarts: CartModel[];

        searchFilter: cart.IQueryStringFilter = {
            status: "Saved",
            sort: "OrderDate DESC",
            shipToId: null
        };

        static $inject = [
            "cartService",
            "coreService",
            "paginationService"
        ];

        constructor(
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService) {

            this.init();            
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);
            this.getCarts();
        }

        clear() {
            this.pagination.currentPage = 1;
            this.searchFilter = {
                status: "Saved",
                sort: "OrderDate",
                shipToId: null
            };
            this.getCarts();
        }

        changeSort(sort: string) {
            if (this.searchFilter.sort === sort && this.searchFilter.sort.indexOf(" DESC") < 0) {
                this.searchFilter.sort = sort + " DESC";
            } else {
                this.searchFilter.sort = sort;
            }
            this.getCarts();
        }

        search() {
            if(this.pagination)
                this.pagination.currentPage = 1;

            this.getCarts();
        }

        getCarts() {
            this.cartService.getCarts(this.searchFilter, this.pagination).success(data => {
                this.savedCarts = data.carts;
                this.pagination = data.pagination;
            });
        }
    }

    angular
        .module("insite")
        .controller("SavedOrderListController", SavedOrderListController);
}