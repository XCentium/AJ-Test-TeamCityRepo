module insite_admin {
    "use strict";

    export class CreditCardActionController {
        amountModal: number;
        transactionType: string;

        model: any;

        static $inject = ["$http", "$scope", "spinnerService", "FoundationApi", "notificationService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected notificationService: INotificationService
        ) {
            this.$scope.$on("AdminAction-Detail:Capture", (event, arg) => {
                this.model = arg.model;
                this.capture();
            });

            this.$scope.$on("AdminAction-Detail:Void", (event, arg) => {
                this.model = arg.model;
                this.void();
            });

            this.$scope.$on("AdminAction-Detail:Credit", (event, arg) => {
                this.model = arg.model;
                this.credit();
            });
        }

        capture() {
            this.transactionType = "Capture";
            this.openModal();
        }

        void() {
            this.transactionType = "Void";
            this.openModal();
        }

        credit() {
            this.transactionType = "Credit";
            this.openModal();
        }

        openModal() {
            this.$foundationApi.publish("submitTransactionModal", "open");
            this.amountModal = this.model.amount;
        }

        submitNewTransaction() {
            this.spinnerService.show();
            var url = "transaction/submitTransaction";
            var data = {
                transactionType: this.transactionType,
                creditCardTransaction: {
                    Amount: this.amountModal,
                    OrderNumber: this.model.orderNumber,
                    RequestId: this.model.requestId,
                    PNRef: this.model.pnRef
                }
            };

            this.$http.post(url, data).then((result: any) => {
                if (result.data.error) {
                    this.notificationService.show(NotificationType.Error, result.data.error);
                } else if (result.data.success) {
                    this.notificationService.show(NotificationType.Success, result.data.success);
                }
                this.spinnerService.hide();
                this.$foundationApi.publish("submitTransactionModal", "close");
            }, () => {
                this.spinnerService.hide();
                this.$foundationApi.publish("submitTransactionModal", "close");
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("CreditCardActionController", CreditCardActionController)
        .directive("isaCreditCardAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                templateUrl: "/admin/directives/CreditCardAction",
                controller: "CreditCardActionController",
                controllerAs: "vm",
                scope: { }
            }
        });
}