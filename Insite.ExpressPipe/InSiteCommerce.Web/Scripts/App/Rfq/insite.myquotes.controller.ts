module insite.rfq {
    "use strict";

    export class MyQuotesController {
        cart: any;
        searchFilter: any;
        quotes: any;
        pagination: any;
        paginationStorageKey = "DefaultPagination-MyQuotes";
        isSalesRep = true;
        userList: AccountModel[];
        customerList: BillToModel[];
        salesRepList: any;
        selectedStatus: any;
        selectedSalesRep: any;
        selectedUser: any;
        selectedCustomer: any;
        selectedType: any;
        quoteSettings: QuoteSettingsModel;
        
        static $inject = ["$scope", "rfqService", "coreService", "accountService", "customerService", "paginationService"];
        constructor(
            protected $scope: ng.IScope,
            protected rfqService: rfq.IRfqService,
            protected coreService: any,
            protected accountService: account.IAccountService,
            protected customerService: customers.ICustomerService,
            protected paginationService: core.IPaginationService) {

            this.init();
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);
            this.initEvents();
        }

        initEvents(): void {
            this.$scope.$on("cartLoaded",(event, cart: CartModel) => {
                this.mapData(cart);
            });
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.quoteSettings = data.quoteSettings;
            });
        }

        mapData(cart: CartModel): void {
            this.cart = cart;
            this.isSalesRep = cart.isSalesperson;
            this.setDefaultSearchFilter();
            if (this.isSalesRep) {
                this.rfqService.expand = "saleslist";
                this.accountService.getAccounts().success((result) => {
                    this.userList = result.accounts.sort((acc1, acc2) => acc1.userName.localeCompare(acc2.userName));
                });
                this.customerService.getBillTos().success(result => {
                    this.customerList = result.billTos;
                });
            }
            this.getQuotes();
        }

        setDefaultSearchFilter(): any {
            this.searchFilter = {};
            this.searchFilter.statuses = [];
            this.searchFilter.types = [];
            this.selectedStatus = "";
            this.selectedSalesRep = null;
            this.selectedUser = null;
            this.selectedCustomer = null;
            this.selectedType = "";
        }

        getQuotes(): any {
            this.rfqService.getQuotes(this.searchFilter, this.pagination)
                .success((result) => {
                this.quotes = result.quotes;
                this.pagination = result.pagination;
                if (result.salespersonList) {
                    this.salesRepList = result.salespersonList;
                }
            });
        }

        clear(): any {
            this.pagination.currentPage = 1;
            this.setDefaultSearchFilter();
            this.getQuotes();
        }

        search(): any {
            this.pagination.currentPage = 1;
            this.searchFilter.statuses = [];
            this.searchFilter.types = [];
            if (this.selectedStatus) {
                this.searchFilter.statuses.push(this.selectedStatus);
            }
            if (this.selectedUser) {
                this.searchFilter.userId = this.selectedUser.id;
            } else {
                this.searchFilter.userId = "";
            }
            if (this.selectedCustomer) {
                this.searchFilter.customerId = this.selectedCustomer.id;
            } else {
                this.searchFilter.customerId = "";
            }
            if (this.selectedSalesRep) {
                this.searchFilter.salesRepNumber = this.selectedSalesRep.salespersonNumber;
            } else {
                this.searchFilter.salesRepNumber = "";
            }
            if (this.selectedType) {
                this.searchFilter.types.push(this.selectedType);
            }
            this.getQuotes();
        }
    }

    angular
        .module("insite")
        .controller("MyQuotesController", MyQuotesController);
}