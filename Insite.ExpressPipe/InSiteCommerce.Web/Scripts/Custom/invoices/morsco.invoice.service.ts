module insite.invoice {
    "use strict";

    export interface IMorscoInvoiceService extends IInvoiceService {
        getInvoices(filter: ISearchFilter, pagination: PaginationModel): ng.IHttpPromise<InvoiceCollectionModel>;
        getInvoice(invoiceId: string, expand: string): ng.IHttpPromise<InvoiceModel>;
        getSSOUrl(customerNumber: string, email: string, username: string): ng.IHttpPromise<string>;
        getInvoicePdfUrl(accountNumber: string, invoices: string[]): ng.IHttpPromise<string>;
    }

    export class MorscoInvoiceService extends InvoiceService implements IMorscoInvoiceService {

        billTrustSSOServiceUri = this.coreService.getApiUri("/api/morsco/billtrust/getssourl");
        billTrustInvoiceServiceUri = this.coreService.getApiUri("/api/morsco/billtrust/getinvoiceurl");

        getSSOUrl(customerNumber: string, email: string, username: string): ng.IHttpPromise<string> {
            var uri = this.billTrustSSOServiceUri;

            uri += "?customernumber=" + customerNumber;
            uri += "&email=" + email;
            uri += "&username=" + username;

            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        getInvoicePdfUrl(accountNumber: string, invoices: string[]): ng.IHttpPromise<string> {
            var uri = this.billTrustInvoiceServiceUri;

            uri += "?accountNumber=" + accountNumber;
            invoices.forEach(function (invoiceNbr) {
                uri += "&invoices=" + invoiceNbr;
            });
            
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }
    }

    function factory($http: ng.IHttpService, coreService: core.ICoreService): MorscoInvoiceService {
        return new MorscoInvoiceService($http, coreService);
    }
    factory.$inject = ["$http", "coreService"];

    angular
        .module("insite")
        .factory("invoiceService", factory);
}
 