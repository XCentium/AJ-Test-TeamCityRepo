module insite.order {
    "use strict";

    export class morscoOrderListController extends OrderListController {
        session: SessionModel;
        shipTo: ShipToModel;
        orderCounts: Array<number>;

        static $inject = [
            "sessionService",
			"spinnerService",
			"$scope",
            "orderService",
            "customerService",
            "coreService",
            "paginationService",
			"invoiceService"
        ];

        constructor(
            protected sessionService: account.ISessionService,
			protected spinnerService: core.ISpinnerService,
			protected $scope: ng.IScope,
            protected orderService: order.IOrderService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService,
			protected invoiceService: invoice.IMorscoInvoiceService) {

            super($scope, orderService, customerService, coreService, paginationService);
            this.postInit();
        }

        init() {
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.allowCancellationRequest = data.orderSettings.allowCancellationRequest;
            });

            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);


            var queryStringHash = this.getUrlVars();
            if (!this.pagination) {
                this.pagination = {
                    currentPage: 1, pageSize: 32, defaultPageSize: 32, nextPageUri: '/', numberOfPages: 0, totalItemCount: 1,
                    prevPageUri: '', pageSizeOptions: [0],
                    sortOptions: [],
                    sortType: ''
                };
            }
            if (queryStringHash['currentpage']) {
                this.pagination['currentPage'] = parseInt(queryStringHash['currentpage']);
            }
            if (queryStringHash['defaultpagesize']) {
                this.pagination.defaultPageSize = +queryStringHash['defaultpagesize'];
            }
            //if (queryStringHash['nextpageuri']) {
            //    this.pagination.nextPageUri = queryStringHash['nextpageuri'];
            //}
            //if (queryStringHash['prevpageuri']) {
            //    this.pagination.prevPageUri = queryStringHash['prevpageuri'];
            //}
            if (queryStringHash['numberofpages']) {
                this.pagination.numberOfPages = +queryStringHash['numberofpages'];
            }
            if (queryStringHash['pagesize']) {
                this.pagination.pageSize = queryStringHash['pagesize'];
            }
            if (queryStringHash['sortoptions']) {
                this.pagination.sortOptions = queryStringHash['sortoptions'];
            }
            if (queryStringHash['sorttype']) {
                this.pagination.sortType = queryStringHash['sorttype'];
            }
            if (queryStringHash['totalitemcount']) {
                this.pagination.totalItemCount = +queryStringHash['totalitemcount'];
            }
            if (queryStringHash['defaultpagesize']) {
                this.pagination.defaultPageSize = queryStringHash['defaultpagesize'];
            }
            if (queryStringHash['status']) {
                this.searchFilter.status = queryStringHash['status'];
            }
            if (queryStringHash['sort']) {
                this.searchFilter.sort = queryStringHash['sort'];
            }
            if (queryStringHash['todate']) {
                this.searchFilter.toDate = queryStringHash['todate'];
            }
            if (queryStringHash['fromdate']) {
                this.searchFilter.fromDate = queryStringHash['fromdate'];
            }
            if (queryStringHash['ordernumber']) {
                this.searchFilter.ordernumber = queryStringHash['ordernumber'];
            }
            if (queryStringHash['ordertotal']) {
                this.searchFilter.ordertotal = queryStringHash['ordertotal'];
            }
        }

        postInit() {
            this.sessionService.getSession().then((result: SessionModel) => {
                this.session = result;
                this.shipTo = result.shipTo;
                this.shipTos = result.billTo.shipTos;
            });
			this.prepareSearchFilter();
            this.getOrders();
        }

		search() {
            if (this.pagination) this.pagination.currentPage = 1;
			this.spinnerService.show("mainLayout", false);
			this.prepareSearchFilter();
            this.getOrders();
        }

        getOrders() {
            this.appliedSearchFilter.sort = this.searchFilter.sort;
            var uriEncodedFilter = jQuery.extend({}, this.appliedSearchFilter);

            if (uriEncodedFilter.ordernumber) {
                uriEncodedFilter.ordernumber = encodeURIComponent(uriEncodedFilter.ordernumber);
            }

            this.orderService.getOrders(uriEncodedFilter, this.pagination).success(data => {
				this.spinnerService.hide();
				this.orderHistory = data;
                this.pagination = data.pagination;
                var baseUrl = window.location.href.split('#')[0];
				var hash = "";

                if (this.pagination.currentPage) {
                    hash += '&currentpage=' + this.pagination.currentPage;
                }
                if (this.pagination.defaultPageSize) {
                    hash += '&defaultpagesize=' + this.pagination.defaultPageSize;
                }
                if (this.pagination.numberOfPages) {
                    hash += '&numberofpages=' + this.pagination.numberOfPages;
                }
                if (this.pagination.pageSize) {
                    hash += '&pagesize=' + this.pagination.pageSize;
                }
                if (this.pagination.sortOptions) {
                    hash += '&sortoptions=' + this.pagination.sortOptions;
                }
                if (this.pagination.sortType) {
                    hash += '&sorttype=' + this.pagination.sortType;
                }
                if (this.pagination.totalItemCount) {
                    hash += '&totalitemcount=' + this.pagination.totalItemCount;
                }
                if (this.pagination.defaultPageSize) {
                    hash += '&defaultpagesize=' + this.pagination.defaultPageSize;
                }
                if (this.searchFilter.status) {
                    hash += '&status=' + this.searchFilter.status;
                }
                if (this.searchFilter.toDate) {
                    hash += '&todate=' + this.searchFilter.toDate;
                }
                if (this.searchFilter.fromDate) {
                    hash += '&fromdate=' + this.searchFilter.fromDate;
                }
                if (this.searchFilter.ordernumber) {
                    hash += '&ordernumber=' + this.searchFilter.ordernumber;
                }
                if (this.searchFilter.ordertotal) {
                    hash += '&ordertotal=' + this.searchFilter.ordertotal;
                }
                if (this.searchFilter.sort) {
                    hash += '&sort=' + this.searchFilter.sort;
                }

                if (hash.length > 0) {
                    var url = baseUrl + '#' + hash;
                    if (typeof (window.history.replaceState) != "undefined") {
                        window.history.replaceState(null, null, url);
                    } else {
                        window.location.replace(url);
                    }
                }

				this.orderHistory.orders.forEach(order => {
					order.properties["orderSalesHistoryType"] = order.erpOrderNumber.substring(0, 2);
				});

            }).error(error => {
				this.spinnerService.hide();
                this.validationMessage = error.exceptionMessage;
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

        getShipments(event) {
            //get the ordernumber
            var lnk = angular.element(event.target);
            var td = angular.element(lnk).parent();
            var nextTd = angular.element(td).next('td');
            var id = nextTd.text();
            var url = "/api/morsco/history/GetShipments?erpOrderNumber=" + id;
            var altClass = ' odd';

            if (lnk.hasClass('fi-plus')) {
                lnk.removeClass('fi-plus').addClass('fi-minus');
                
                if (lnk.parents('tr').hasClass('even')) {
                    altClass = ' even';
                }

                var self = this,
                    currentPosition = $(window).scrollTop(),
                    verticalScroll = 0,
                    scrollPadding = 20;

                $.getJSON(url, function (data) {
                    var jsonObjectArray = $.parseJSON(data);

                    $.each(jsonObjectArray, function(i, obj) {
                        var row = angular.element(event.target).parent().parent();
                        var docs = '';

                        if (obj.Status === 'Invoiced') {
                            // need the path to document
							var selectedInvoices = [];

							var compareDate = new Date(self.orderHistory.properties['earliestBilltrustInvoices']);
							var today = new Date();
							var yesturday = new Date();
							yesturday.setDate(today.getDate() - 1);
                            
                            var InvoiceDate = new Date(obj.InvoiceDate);
							if (InvoiceDate && compareDate) {
								if (InvoiceDate > compareDate && InvoiceDate < yesturday) {
									selectedInvoices.push(obj.ShipmentNumber);
								}
							}

							if (selectedInvoices.length > 0) {
								self.invoiceService.getInvoicePdfUrl(self.session.billTo.customerNumber, selectedInvoices).success(data => {
									var invoiceUrl = data;
									docs = '<a href="' + data + '" target="_blank"><i class="epicon epicon-invoice"></i></a>';
									var Row = angular.element(document.getElementById(obj.ShipmentPageId));
									var docRow = angular.element(docs);
									Row.append(docRow);

								}).error(error => {
									this.validationMessage = error.exceptionMessage;
								});
							}				
                        }

                        var newRow = angular.element('<tr class="generation' + altClass + '">'
                            + '<td> &nbsp;</td>'
                            + '<td class="col-ordernum"> <a href=/MyAccount/Orders/Details?ordernumber=' + obj.ShipmentNumber + '> '
                            + ((obj.Status != 'Invoiced' && obj.ShipmentNumber.indexOf('.') > 0) ? obj.ShipmentNumber.substring(0, obj.ShipmentNumber.indexOf('.')) : obj.ShipmentNumber)
                            + '</a></td>'
                            + '<td class="col-status"> ' + obj.Status + ' </td>'
                            + '<td class="col-date"> ' + obj.LastShipDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1").replace(/\/0/, "\/").replace(/^0/, "") + '</td>'
                            + '<td class="col-po"> ' + obj.CustomerPO + '</td>'
                            + '<td class="col-jobname"> ' + obj.CompanyName + ' </td>'
                            + '<td class="col-date">' + obj.OrderDate + '</td>'
                            + '<td class="col-orderedby">' + obj.OrderedBy + '</td>'
                            + '<td class="col-total">' + obj.Total + '</td>'
                            + '<td class="col-docs" id = ' + obj.ShipmentPageId + '></td>'
                            + '</tr>'
                            );

                        row.after(newRow);

                        verticalScroll += newRow.height();
                        
                    });

                    $("html, body").animate({ scrollTop: currentPosition + verticalScroll + scrollPadding});

                });
            }
            else {
                lnk.removeClass('fi-minus').addClass('fi-plus');
                $.getJSON(url, function (data) {
                    var row = angular.element(event.target).parent().parent();
                    var jsonObjectArray = $.parseJSON(data);
                    $.each(jsonObjectArray, function (i, obj) {
                        var nextRow = angular.element(row).next('tr');
                        nextRow.remove();
                        setTimeout(function () { $('.loader').fadeOut(); }, 500);
                    });
                });
            }
        }

        callBillTrustInvoiceService(orderIndex, invoiceArray: string[]) {
            this.sessionService.getSession().then((result: SessionModel) => {
                this.invoiceService.getInvoicePdfUrl(result.billTo.customerNumber, invoiceArray).success(data => {
                    this.orderHistory.orders[orderIndex].properties['invoiceUrl'] = data;
                    $(document).foundation('tooltip', 'reflow');
                }).error(error => {
                    this.validationMessage = error.exceptionMessage;
                });
            });
        }

        changeStatus() {
            var status = "";
            if ($(".status-filter input:checked").val() == "Open") {
                status = "Open";
            }

            if ($(".status-filter input:checked").val() == "Invoiced") {
                status = "Invoiced";
            }

            if ($(".status-filter input:checked").val() == "All") {
                status = "All";
            }
            this.pagination.currentPage = 1;
            this.searchFilter.status = status;
            this.getOrders();
        }

        fixErpOrderNumber(erpOrderNumber: string, status: string) {
            return (status != 'Invoiced' && erpOrderNumber.indexOf('.') > 0)
                ? erpOrderNumber.substring(0, erpOrderNumber.indexOf('.'))
                : erpOrderNumber;
        }

    }

    angular
        .module("insite")
        .controller("OrderListController", morscoOrderListController);
}
