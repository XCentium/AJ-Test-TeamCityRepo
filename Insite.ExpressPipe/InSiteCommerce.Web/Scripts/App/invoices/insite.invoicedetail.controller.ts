module insite.invoice {
    "use strict";

    export class InvoiceDetailController {

        invoice: InvoiceModel;
        btFormat: string;
        stFormat: string;
        validationMessage: string;

        static $inject = [
            "invoiceService",
            "coreService"
        ];

        constructor(protected invoiceService: invoice.IInvoiceService, protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            var invoiceNumber = this.coreService.getQueryStringParameter("invoiceNumber", true);

            if (typeof invoiceNumber === "undefined") {
                // handle "clean urls" 
                var pathArray = window.location.pathname.split("/");
                var pathInvoiceNumber = pathArray[pathArray.length - 1];
                if (pathInvoiceNumber !== "InvoiceHistoryDetail") {
                    invoiceNumber = pathInvoiceNumber;
                }
            }

            this.getInvoice(invoiceNumber);
        }

        /* mimics the functionality in the html helper extension */
        formatCityCommaStateZip(city: string, state: string, zip: string) {
            var formattedString = "";
            if (city) {
                formattedString += city;
            }
            if (city && state) {
                formattedString += ", " + state + " " + zip;
            }
            return formattedString;
        }

        getInvoice(invoiceNumber: string) {
            this.invoiceService.getInvoice(invoiceNumber, "invoicelines,shipments").success(data => {
                this.invoice = data;
                this.btFormat = this.formatCityCommaStateZip(this.invoice.billToCity, this.invoice.billToState, this.invoice.billToPostalCode);
                this.stFormat = this.formatCityCommaStateZip(this.invoice.shipToCity, this.invoice.shipToState, this.invoice.shipToPostalCode);
            }).error(error => {
                this.validationMessage = error.exceptionMessage;
            });
        }
    }

    angular
        .module("insite")
        .controller("InvoiceDetailController", InvoiceDetailController);
}