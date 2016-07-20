module insite.orderapproval {
    "use strict";

    export class OrderApprovalListController {

        approvalCarts: CartModel[];
		properties: {[key: string]: string};
        cart: CartModel;
        pagination: PaginationModel;
        paginationStorageKey = "DefaultPagination-OrderApprovalList";
        searchFilter: cart.IQueryStringFilter;
        shipTos: ShipToModel[];

        static $inject = [
            "$scope"
            , "orderApprovalService"
            , "customerService"
            , "coreService"
            , "paginationService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected orderApprovalService: orderapproval.IOrderApprovalService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService) {

            this.init();
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);

            this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel) => {
                this.cart = cart;

                this.searchFilter = {
                    shipToId: "",
                    sort: "OrderDate DESC"
                };

                this.getCarts();

                this.customerService.getShipTos("approvals").success(data => {
                    this.shipTos = data.shipTos;
                });
            });
        }

        clear() {
            this.pagination.currentPage = 1;
            this.searchFilter = {
                shipToId: "",
                sort: "OrderDate"
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
            if (this.pagination) {
                this.pagination.currentPage = 1;
            }

            this.getCarts();
        }

        getCarts() {
            this.orderApprovalService.getCarts(this.searchFilter, this.pagination).success(data => {
                this.approvalCarts = data.cartCollection;
                this.properties = data.properties;
                this.pagination = data.pagination;
            });
        }
    }

    angular
        .module("insite")
        .controller("OrderApprovalListController", OrderApprovalListController);
}



        
