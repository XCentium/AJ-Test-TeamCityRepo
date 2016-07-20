import InvoiceModel = Insite.Invoice.WebApi.V1.ApiModels.InvoiceModel;
import InvoiceCollectionModel = Insite.Invoice.WebApi.V1.ApiModels.InvoiceCollectionModel;

module insite.invoice {
    "use strict";

    export interface ISearchFilter {
        customerSequence: string;
        sort: string;
    }

    export interface IInvoiceService {
        getInvoices(filter: ISearchFilter, pagination: PaginationModel): ng.IHttpPromise<InvoiceCollectionModel>;
        getInvoice(invoiceId: string, expand: string): ng.IHttpPromise<InvoiceModel>;
    }

    export class InvoiceService implements IInvoiceService {

        serviceUri = this.coreService.getApiUri("/api/v1/invoices");
        constructor(protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {

        }

        getInvoices(filter: ISearchFilter, pagination: PaginationModel): ng.IHttpPromise<InvoiceCollectionModel> {
            var uri = this.serviceUri;
            if (filter) {
                uri += "?";
                for (var property in filter) {
                    if (filter[property]) {
                        uri += property + "=" + filter[property] + "&";
                    }
                }
            }
            if (pagination) {
                uri += "currentPage=" + pagination.currentPage + "&pageSize=" + pagination.pageSize;
            }
            uri = uri.replace(/&$/, "");
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

        getInvoice(invoiceId: string, expand: string): ng.IHttpPromise<InvoiceModel> {
            var uri = this.serviceUri + "/" + invoiceId;
            if (expand) {
                uri += "?expand=" + expand;
            }
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }
    }

    function factory($http: ng.IHttpService, coreService: core.ICoreService): InvoiceService {
        return new InvoiceService($http, coreService);
    }
    factory.$inject = ["$http", "coreService"];

    angular
        .module("insite")
        .factory("invoiceService", factory);
}
 