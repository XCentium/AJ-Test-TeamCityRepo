module insite.invoice {
    "use strict";

    export class InvoiceListController {

        invoiceHistory: InvoiceCollectionModel;
        pagination: PaginationModel;
        paginationStorageKey = "DefaultPagination-InvoiceList";
        searchFilter: invoice.ISearchFilter = {
            customerSequence: "-1",
            sort: "InvoiceDate DESC"
        };
        shipTos: ShipToModel[];
        validationMessage: string;
        
        static $inject = [
            "invoiceService",
            "customerService",
            "coreService",
            "paginationService"
        ];

        constructor(
            protected invoiceService: invoice.IInvoiceService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService) {

            this.init();
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);

            this.getInvoices();

            this.customerService.getShipTos().success(data => {
                this.shipTos = data.shipTos;
            });   
        }

        clear() {
            this.pagination.currentPage = 1;
            this.searchFilter = {
                customerSequence: "-1",
                sort: "InvoiceDate"
            };

            this.getInvoices();
        }

        changeSort(sort: string) {
            if (this.searchFilter.sort === sort && this.searchFilter.sort.indexOf(" DESC") < 0) {
                this.searchFilter.sort = sort + " DESC";
            } else {
                this.searchFilter.sort = sort;
            }
            this.getInvoices();
        }

        search() {
            if (this.pagination)
                this.pagination.currentPage = 1;

            this.getInvoices();
        }

        getInvoices() {
            this.invoiceService.getInvoices(this.searchFilter, this.pagination).success(data => {
                this.invoiceHistory = data;
                this.pagination = data.pagination;
            }).error(error => {
                this.validationMessage = error.exceptionMessage;
            });
        }
    }

    angular
        .module("insite")
        .controller("InvoiceListController", InvoiceListController);
}
