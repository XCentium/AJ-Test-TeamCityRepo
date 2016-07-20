module insite_admin {
    "use strict";

    export class PriceMatrixDetailsController extends EntityDetailsController {
        knownRecordTypes = [
            "Product",
            "Product Sale",
            "Product Price Code",
            "Customer", "Customer/Product",
            "Customer/Product Price Code",
            "Customer Price Code",
            "Customer Price Code/Product",
            "Customer Price Code/Product Price Code"
        ];
        knownRecordType = true;
        hasProductPriceCode: boolean;
        hasProduct: boolean;
        hasCustomerPriceCode: boolean;
        hasCustomer: boolean;

        setInitialModel(model: any) {
            if (this.isNew) {
                model.activateOn = this.now;
            }

            super.setInitialModel(model);

            this.$timeout(() => {
                this.checkRecordType(this.model.recordType || "");
                this.subscribeToEvents();
            }, 0);
        }

        private subscribeToEvents() {
            angular.element("#priceMatrix_recordType").on("change", (e) => {
                this.checkRecordType((<HTMLSelectElement>e.target).value);
            });

            this.$scope.$on("$destroy", () => {
                angular.element("#priceMatrix_recordType").off("change");
            });
        }

        private checkRecordType(newRecordType: string) {
            this.$scope.$apply(() => {
                this.knownRecordType = this.knownRecordTypes.filter(o => { return o.toLowerCase() === newRecordType.toLowerCase() }).length > 0;

                var recordTypes = newRecordType.split("/");
                var newHasProductPriceCode = recordTypes.filter(o => { return o.toLowerCase() === "Product Price Code".toLowerCase(); }).length > 0;
                var newHasProduct = recordTypes.filter(o => { return o.toLowerCase() === "Product".toLowerCase() || o.toLowerCase() === "Product Sale".toLowerCase(); }).length > 0;
                var newHasCustomerPriceCode = recordTypes.filter(o => { return o.toLowerCase() === "Customer Price Code".toLowerCase(); }).length > 0;
                var newHasCustomer = recordTypes.filter(o => { return o.toLowerCase() === "Customer".toLowerCase(); }).length > 0;

                if ((this.hasProductPriceCode !== undefined && this.hasProductPriceCode !== newHasProductPriceCode) || (this.hasProduct !== undefined && this.hasProduct !== newHasProduct)) {
                    this.model.productKeyPart = "";
                }

                if ((this.hasCustomerPriceCode !== undefined && this.hasCustomerPriceCode !== newHasCustomerPriceCode) || (this.hasCustomer !== undefined && this.hasCustomer !== newHasCustomer)) {
                    this.model.customerKeyPart = "";
                }

                this.hasProductPriceCode = newHasProductPriceCode;
                this.hasProduct = newHasProduct;
                this.hasCustomerPriceCode = newHasCustomerPriceCode;
                this.hasCustomer = newHasCustomer;
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("PriceMatrixDetailsController", PriceMatrixDetailsController);
}