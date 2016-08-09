module insite.invoice {
    "use strict";

    class AgingHeaderLink {
        queryString: string;
        total: number;
    }

	export class Morsco_InvoiceListController extends InvoiceListController {

        shipTo: ShipToModel;
        session: SessionModel;
		shipToJobs: ShipToModel[];
		agingList: { [agingType: string]: AgingHeaderLink; } = {};
        paramList: string[] = [];
        selectAll: boolean;

        dateObjects: {} = {};
        
        static $inject = [
            "invoiceService",
            "customerService",
            "coreService",
            "paginationService",
            "sessionService",
            "spinnerService"
        ];

        constructor(
            protected invoiceService: invoice.IMorscoInvoiceService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected paginationService: core.IPaginationService,
            protected sessionService: account.ISessionService,
            protected spinnerService: core.ISpinnerService) {

            super(invoiceService, customerService, coreService, paginationService);

        }

        init() {
			var self = this;
            this.shipToJobs = [];


            this.customerService.getShipTo("").success((result) => {
                self.shipTo = result;
                self.sessionService.getSession().then((sessionResult: SessionModel) => {
                    self.session = sessionResult;
                    
                    super.init();
                    if (self.shipTo.customerSequence == "") {
                        self.customerService.getBillTo("shiptos").success((billToResult) => {
                            self.shipToJobs = billToResult.shipTos;
                            self.searchFilter['CustomerSequence'] = '';
                        });
                    } else {
                        self.searchFilter['CustomerSequence'] = self.shipTo.customerSequence;
                        self.searchFilter['JobName'] = self.shipTo.companyName;
                        self.shipToJobs.push(self.shipTo);
                    }
                    
                });
				
            });
            
            
        }

        getInvoices() {
            this.spinnerService.show("mainLayout", false);
            var uriEncodedFilter = jQuery.extend({}, this.searchFilter);

            if (this.searchFilter['CustomerSequence'] && this.searchFilter['CustomerSequence'] !== '') {
                uriEncodedFilter.customerSequence = encodeURIComponent(this.searchFilter['CustomerSequence']);
            } else {
                uriEncodedFilter.customerSequence = '-1';
            }

            if (uriEncodedFilter['JobName']) {
                uriEncodedFilter['JobName'] = encodeURIComponent(uriEncodedFilter['JobName']);
            }
            if (uriEncodedFilter['poNumber']) {
                uriEncodedFilter['poNumber'] = encodeURIComponent(uriEncodedFilter['poNumber']);
            }
            if (uriEncodedFilter['invoiceNumber']) {
                uriEncodedFilter['invoiceNumber'] = encodeURIComponent(uriEncodedFilter['invoiceNumber']);
            }

            var self = this;
            this.invoiceService.getInvoices(uriEncodedFilter, this.pagination).success(data => {
                this.paramList = this.getUriVars(data.uri);
                self.searchFilter['status'] = (self.paramList['status']) ? self.paramList['status'] : 'all';
                this.invoiceHistory = data;
                this.pagination = data.pagination;
                if (!this.searchFilter['ShowOpenOnly']) {
                    this.searchFilter['ShowOpenOnly'] = false;
                }
                data.invoices.forEach(invoice => {
                    this.getBillTrustInvoiceFromDetailLink(invoice);
                    invoice['aging'] = self.getAging(invoice);
                });

				this.invoiceHistory.invoices.forEach(invoice => {
					invoice.properties["invoiceSalesHistoryType"] = invoice.invoiceNumber.substring(0, 2);
				});

                self.getAgingBuckets();
                setTimeout(function () {
                    $(document).foundation('tooltip', 'reflow');
                }, 500);
                this.spinnerService.hide("mainLayout");
            }).error(error => {
                this.spinnerService.hide("mainLayout");
                this.validationMessage = error.exceptionMessage;
				});
		}

        public toggleSelectAll() {
            $(".select-invoice-checkbox input[type='checkbox']").prop("checked", this.selectAll);
        }

        public invoiceSelectChanged(invoice: string) {
            if ($("#" + invoice).prop("checked") == false) {
                $(".select-all-checkbox").prop("checked", false);
            }
        }

        getAgingBuckets() {
            var customerNumber = this.shipTo.customerNumber;
            var customerSequence = this.shipTo.customerSequence;

            var url = "/api/morsco/history/GetAgingBuckets?customerNumber=" + this.shipTo.customerNumber + "&customerSequence=" + this.shipTo.customerSequence;
            var self = this;
            $.getJSON(url, function (data) {
                var jsonObjectArray = $.parseJSON(data);
                
                $.each(jsonObjectArray, function (i, obj) {
                    self.agingList = {};
                    for (var property in obj) {
                        if (obj.hasOwnProperty(property)) {
                            if (!self.agingList.hasOwnProperty(property)) {
                                if (property.search('Start') >= 0 || property.search('End') >= 0) {
                                    self.dateObjects[property] = new Date(obj[property].toString());
                                } else {
                                    self.agingList[property] = new AgingHeaderLink();
                                    self.agingList[property].total = obj[property];
                                }
                            }
                            
                        }
                    }
                });
                self.invoiceHistory.invoices.forEach(invoice => {
                    invoice['aging'] = self.getAging(invoice);
                });
            });
        }

        public setAgingFilter(aging: string) {
            this.pagination.currentPage = 1;
            this.searchFilter = {
                customerSequence: "-1",
                sort: "InvoiceDate"
            };
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var holdToday = today;
            var date30 = this.formatDate(holdToday.subtractDays(30).toDateString());
            holdToday = today;
            var date60 = this.formatDate(holdToday.subtractDays(60).toDateString());
            holdToday = today;
            var date90 = this.formatDate(holdToday.subtractDays(90).toDateString());
            holdToday = today;
            var date120 = this.formatDate(holdToday.subtractDays(120).toDateString());

            this.searchFilter['status'] = 'open';
            this.searchFilter.sort = 'InvoiceDate DESC';

            if (aging.toLowerCase() == "future") {
                this.searchFilter['fromDueDate'] = this.formatDate(today.toDateString());
                this.searchFilter['toDueDate'] = '';
            }
            if (aging.toLowerCase() == "current") {
                this.searchFilter['fromDueDate'] = this.dateObjects['CurrentStart'].toDateString();
                this.searchFilter['toDueDate'] = this.dateObjects['CurrentEnd'].toDateString();
            }
            if (aging == "31-60") {
                this.searchFilter['fromDueDate'] = this.dateObjects['31-60Start'].toDateString();
                this.searchFilter['toDueDate'] = this.dateObjects['31-60End'].toDateString();
            }
            if (aging == "61-90") {
                this.searchFilter['fromDueDate'] = this.dateObjects['61-90Start'].toDateString();
                this.searchFilter['toDueDate'] = this.dateObjects['61-90End'].toDateString();
            }
            if (aging == "91-120") {
                this.searchFilter['fromDueDate'] = this.dateObjects['91-120Start'].toDateString();
                this.searchFilter['toDueDate'] = this.dateObjects['91-120End'].toDateString();
            }
            if (aging == "120+") {
                this.searchFilter['fromDueDate'] = '';
                this.searchFilter['toDueDate'] = this.dateObjects['121+End'].toDateString();
            }
        }

        public setFilters(aging: string) {

            this.setAgingFilter(aging);
            this.getInvoices();
        }

        public formatDate(date: string) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        public getAging(currentInvoice: InvoiceModel) :string {
            if (currentInvoice.isOpen) {
                var dueDate = new Date(currentInvoice.dueDate.toString());
                var today = new Date();

                if (dueDate > this.dateObjects['CurrentEnd']) {
                    return "Future";
                }
                if (this.inDateRange(this.dateObjects['CurrentStart'], this.dateObjects['CurrentEnd'], dueDate)) {
                    return "Current";
                }
                if (this.inDateRange(this.dateObjects['31-60Start'], this.dateObjects['31-60End'], dueDate)) {
                    return "+30";
                }
                if (this.inDateRange(this.dateObjects['61-90Start'], this.dateObjects['61-90End'], dueDate)) {
                    return "+60";
                }
                if (this.inDateRange(this.dateObjects['91-120Start'], this.dateObjects['91-120End'], dueDate)) {
                    return "+90";
                }
                if (dueDate < this.dateObjects['121+End']) {
                    return "+120";
                }
            }
        }

        getBillTrustSSOUrl() {
            this.invoiceService.getSSOUrl(this.session.billTo.customerNumber, this.session.email, this.session.userName).success(data => {
                window.open(data);

            }).error(error => {
                this.validationMessage = error.exceptionMessage;
            });
        }

        getBillTrustInvoiceUrl() {
            var selectedInvoices = $("input[name='select-invoice']:checked").map(function () {
                return $(this).attr("data-invoice-pdf") != '' ? $(this).attr("data-invoice-pdf") : null;
            }).get();;
            if (selectedInvoices.length > 0) {
                this.invoiceService.getInvoicePdfUrl(this.session.billTo.customerNumber, selectedInvoices).success(data => {
                    window.open(data);
                }).error(error => {
                    this.validationMessage = error.exceptionMessage;
                });
            }
        }

        getBillTrustInvoiceFromDetailLink(invoice: InvoiceModel) {
            var selectedInvoices = [];
            var compareDate = new Date(this.invoiceHistory.properties['earliestBilltrustInvoices']);
            
            var today = new Date();
            var yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            //var invoiceDate = new Date(invoice.properties['invoiceDate']);
            var invoiceDate = new Date(invoice.invoiceDate.toString());
            if (invoiceDate && compareDate) {
                if (invoiceDate >= compareDate && invoiceDate <= yesterday) {
                    selectedInvoices.push(invoice.invoiceNumber);
                }
            }
            if (selectedInvoices.length > 0) {
                this.invoiceService.getInvoicePdfUrl(this.session.billTo.customerNumber, selectedInvoices).success(data => {
                    invoice.properties["pdfUrl"] = data;
                }).error(error => {
                    this.validationMessage = error.exceptionMessage;
                });
            }
        }

        downloadSelectedInvoicesCsv() {
            var selectedInvoices = $("input[name='select-invoice']:checked").map(function () {
                return $(this).val();
            }).get();
            if (selectedInvoices.length > 0) {
                var postData = { selectedInvoices: selectedInvoices };
                var url = "/api/morsco/history/DownloadInvoicesCsvByIdList?list=true";
                var querystring = '';
                selectedInvoices.forEach(function (item) {
                    querystring += "&selectedInvoices=" + item;
                });
                var self = this;
                window.location.href = url + querystring;
            }
        }

        getUriVars(uri: string) {
            var vars = [], hash;
            var hashes = uri.slice(uri.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }

        private inDateRange(from: Date, to: Date, myDate: Date) : boolean {
            return (myDate >= from && myDate <= to);
        }
    }

    angular
        .module("insite")
        .controller("InvoiceListController", Morsco_InvoiceListController);
}

interface Date {
    subtractDays(days: number): Date;
}

Date.prototype.subtractDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
};