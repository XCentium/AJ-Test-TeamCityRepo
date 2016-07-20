module insite.rma {
    "use strict";

    export class RmaController {

        orderLinesForm: any;
        totalQuantity: number = 0;
        requestSubmitted: boolean = false;
        cityCommaStateZipDisplay: string;
        resultMessage: string;
        errorMessage: string;
        returnNotes: string;
        order: OrderModel;

        static $inject = ["orderService","coreService"];
        constructor(
            protected orderService: order.IOrderService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.getOrder();
        }

        getOrder() {
            var orderNumber = this.coreService.getQueryStringParameter("orderNumber", true);

            if (typeof orderNumber === "undefined") {
                // handle "clean urls" 
                var pathArray = window.location.pathname.split("/");
                var pathNumber = pathArray[pathArray.length - 1];
                if (pathNumber !== "OrderHistoryDetail") {
                    orderNumber = pathNumber;
                }
            }

            this.orderService.getOrder(orderNumber, "orderlines").success(result => {
                this.order = result;
                this.cityCommaStateZipDisplay = this.cityCommaStateZip(result.billToCity, result.billToState, result.billToPostalCode);
            });
        }

        cityCommaStateZip(city: string, state: string, zip: string) {
            var formattedString = "";
            if (city) { formattedString += city; }
            if (city && state) { formattedString += ", " + state + " " + zip; }
            return formattedString;
        }

        sendRmaRequest() {
            var rmaModel: RmaModel = <RmaModel>{
                orderNumber: this.order.webOrderNumber || this.order.erpOrderNumber,
                notes: this.returnNotes,
                message: "",
                rmaLines: this.order.orderLines.map(orderLine => <RmaLineDto>{
		            line: orderLine.lineNumber,
		            rmaQtyRequested: orderLine.rmaQtyRequested,
		            rmaReasonCode: orderLine.returnReason
                })
            };
            if (typeof rmaModel.notes === "undefined") {
                rmaModel.notes = "";
            }

            this.errorMessage = "";
            this.requestSubmitted = false;
            this.orderLinesForm.$submitted = true;

            if (this.orderLinesForm.$valid)
            {
                rmaModel.rmaLines = rmaModel.rmaLines.filter(x => x.rmaQtyRequested > 0);
                this.orderService.addRma(rmaModel).success(result => {
                    if (!result.message) {
                        this.requestSubmitted = true;
                        this.orderLinesForm.$submitted = false;
                    } else {
                        this.resultMessage = result.message;
                    }
                    this.coreService.displayModal(angular.element("#popup-rma"));
                }).error(error => {
                    this.errorMessage = error.message;
                });
            }
        }

        closePopup($event): void {
            $event.preventDefault();
            this.coreService.closeModal("#closeMessagePopup");
        }

        calculateQuantity(): void {
            this.totalQuantity = 0;
            this.order.orderLines.forEach(orderLine => {
                this.totalQuantity += !orderLine.rmaQtyRequested ? 0 : 1;
            });
        }
    }

    angular
        .module("insite")
        .controller("RmaController", RmaController);
}