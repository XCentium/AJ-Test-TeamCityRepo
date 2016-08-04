module insite.rfq {
    "use strict";

    export class MyQuotesControllerMorsco extends MyQuotesController {

        quoteToDelete: any;

        static $inject = ["$scope", "rfqService", "coreService", "accountService", "customerService", "paginationService", "specialOrderService"];

        constructor(
            protected $scope: ng.IScope,
            protected rfqService: rfq.IRfqService,
            protected coreService: any,
            protected accountService: account.IAccountService,
            protected customerService: customers.ICustomerService,
            protected paginationService: core.IPaginationService,
            protected specialOrderService: cart.ISpecialOrderService) {

            super($scope, rfqService, coreService, accountService, customerService, paginationService)
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
            this.searchFilter.sort = "";
        }

        search(): any {
			var hash = '';
			var baseUrl = window.location.href.split('#')[0];
            this.pagination.currentPage = 1;
            this.searchFilter.statuses = [];
            this.searchFilter.types = [];
            if (this.selectedStatus) {
                this.searchFilter.statuses.push(this.selectedStatus);
				hash += '&selectedStatus=' + this.selectedStatus;
            } else {
				this.selectedStatus = '';
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
			if (this.searchFilter.quoteNumber) {
				hash += '&quoteNumber=' + this.searchFilter.quoteNumber;
			} else {
				this.searchFilter.quoteNumber = '';
			}

			var url = baseUrl;
			if (hash.length > 0) {
				 url += '#' + hash;
			}
			window.location.replace(url);

            this.getQuotes();
        }

        getQuotes(): any {
			var queryStringHash = this.getUrlVars();
            if (queryStringHash['selectedStatus']) {
                this.selectedStatus = queryStringHash['selectedStatus'];
				this.searchFilter.statuses.push(queryStringHash['selectedStatus']);
            }
            if (queryStringHash['quoteNumber']) {
                this.searchFilter.quoteNumber = queryStringHash['quoteNumber'];
            }
            if (this.pagination) {
                if (this.pagination.currentPage > 1) {
                    if (!window.location.href.split('#')[1]) {
                        window.location.href += '#';
                    }

					var hash = '';
					var baseUrl = window.location.href.split('#')[0];
					var query = window.location.href.split('#')[1];
					if (query.indexOf('&page') > -1) {
						var queryVars = query.split('&');
						queryVars.forEach(qv => {
							if (qv.indexOf('page') < 0) {
								hash += '&' + qv;
							}
							if (qv == '/') hash = qv;
						});

						//window.location.replace(baseUrl + '#' + hash + '&page=' + this.pagination.currentPage);
						window.location.href = baseUrl + '#' + hash + '&page=' + this.pagination.currentPage;
					} else {
						window.location.href += '&page=' + this.pagination.currentPage;
					}                    
                }

                if (queryStringHash['page']) {
					if (queryStringHash['page'] > this.pagination.currentPage) {
						queryStringHash['page'] = this.pagination.currentPage;
					} else {
						this.pagination.currentPage = parseInt(queryStringHash['page']);
					}
                }
            } else {
				this.pagination = {};
                if (queryStringHash['page']) {
                    this.pagination.currentPage = queryStringHash['page'];
                }
			}

			if (!this.searchFilter.sort) {
				this.searchFilter.sort = "OrderNumber DESC";
			}

            this.rfqService.getQuotes(this.searchFilter, this.pagination)
                .success((result) => {
                this.quotes = result.quotes;
                this.pagination = result.pagination;
                if (result.salespersonList) {
                    this.salesRepList = result.salespersonList;
                }
                var today = new Date();
                this.quotes.forEach(quote => {
					var expires = new Date(quote.expirationDate);
					expires = new Date(expires.valueOf() + expires.getTimezoneOffset() * 60000);
					quote.expirationDate = expires.valueOf();

                    if (quote.statusDisplay == "QuoteRequested") {
                        quote.statusDisplay = "Requested";
                    }
                    if (quote.statusDisplay == "QuoteProposed") {
                        quote.statusDisplay = "Active";

                        if (expires.setHours(0, 0, 0, 0).valueOf() < today.setHours(0, 0, 0, 0).valueOf()) {
                            quote.statusDisplay = "Expired";
                        }
                    }
                    if (quote.statusDisplay == "QuoteSubmitted") {
                        quote.statusDisplay = "Order Pending";
                    }
                });
            });
        }

        changeSort(sort: string) {
            if (this.searchFilter.sort === sort && this.searchFilter.sort.indexOf(" DESC") < 0) {
                this.searchFilter.sort = sort + " DESC";
            } else {
                this.searchFilter.sort = sort;
            }
            this.getQuotes();
        }

        deleteConfirmationPopup(quote: any) {
            this.quoteToDelete = quote;
            $('#deleteQuoteConfirmation').foundation('reveal', 'open');

        }

        deleteQuote(quoteId: string) {
            //  Need to find a different way to update the status.  This is crazy...
            //  Possibly create a new web api endpoint?


            this.specialOrderService.deleteQuote(quoteId).then(() => {
                this.getQuotes();
                this.quoteToDelete = null;
                $('#deleteQuoteConfirmation').foundation('reveal', 'close');
            });
        }

        getUrlVars() {
            var parms = {};
            var temp;
            var querystring = window.location.hash.slice(1);
            var items = querystring.slice(1).split("&");   // remove leading ? and split
            for (var i = 0; i < items.length; i++) {
                temp = items[i].split("=");
                if (temp[0]) {
                    if (temp.length < 2) {
                        temp.push("");
                    }
                    parms[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
                }
            }
            return (parms);
        }

    }

    angular
        .module("insite")
        .controller("MyQuotesController", MyQuotesControllerMorsco);
}