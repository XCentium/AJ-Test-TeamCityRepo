module insite_admin {
    "use strict";

    export interface ICreditCardTransaction
    {
        orderNumber: string;
        amount: number;
        name: string;
        creditCardNumber: string;
        expirationDate: string;
        authCode: string;
        requestId: string;
        pNRef: string;
    }

    export class SubmitNewTransactionActionController {

        form: any;
        model: any = {};
        errors: any = {};
        submitError: string;

        static $inject = ["$http", "$scope", "spinnerService", "FoundationApi", "notificationService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected notificationService: INotificationService
        ) {
            this.$scope.$on("AdminAction-List:SubmitNewTransaction", () => {
                this.errors = {};
                this.submitError = "";
                this.initEmptyModel();
                if (this.form) {
                    this.form.$setPristine();
                    this.form.$setUntouched();
                }
                this.$foundationApi.publish("submitNewTransactionModal", "open");
            });

            this.$scope.$watch(() => this.model, (newValue, oldValue) => {
                for (var prop in this.model) {
                    if (newValue && oldValue && newValue.hasOwnProperty(prop) && oldValue.hasOwnProperty(prop) && newValue[prop] !== oldValue[prop]) {
                        if (this.form && this.form[prop] && this.form[prop].$error.invalid) {
                            this.form[prop].$setValidity("invalid", true);
                            delete this.errors[prop.toLowerCase()];
                        }
                    }
                }
            }, true);
        }

        submitNewTransaction(): void {
            this.spinnerService.show();

            var expirationDate = "";
            if (/^\d{4}-\d{2}-\d{2}$/.test(this.model.expirationDate)) {
                var numbers = this.model.expirationDate.match(/\d{2}/g);
                expirationDate = numbers[2] + numbers[1];
            }

            var data = {
                transactionType: this.model.transactionType,
                creditCardTransaction: <ICreditCardTransaction>{
                    orderNumber: this.model.orderNumber,
                    amount: this.model.transactionAmount,
                    name: this.model.cardHolderName,
                    creditCardNumber: this.model.creditCardNumber,
                    expirationDate: expirationDate,
                    authCode: this.model.cardSecurityCode
                }
            };

            this.errors = {};
            this.submitError = "";
            this.$http.post("/admin/transaction/submittransaction", data).then((result: any) => {
                this.spinnerService.hide();
                if (result.data.error && result.data.source) {
                    this.errors[result.data.source.toLowerCase()] = result.data.error;
                    var fieldName = result.data.source.charAt(0).toLowerCase() + result.data.source.substring(1);
                    if (this.form[fieldName]) {
                        this.form[fieldName].$setValidity("invalid", false);
                    }
                }
                if (result.data.error && !result.data.source) {
                    this.submitError = result.data.error;
                } else if (result.data.success) {
                    this.notificationService.show(NotificationType.Success, result.data.success);
                    this.$foundationApi.publish("submitNewTransactionModal", "close");
                }
            }, () => {
                this.spinnerService.hide();
                this.$foundationApi.publish("submitNewTransactionModal", "close");
            });
        }

        showError(fieldName: string): boolean {
            return (this.form.$submitted || this.form[fieldName].$dirty) && this.form[fieldName].$error.required;
        }

        hasCustomError(fieldName: string): boolean {
            return this.errors.hasOwnProperty(fieldName.toLowerCase());
        }

        customError(fieldName: string): string {
            return this.errors[fieldName.toLowerCase()];
        }

        private initEmptyModel(): void {
            this.model.transactionType = "Authorization";
            this.model.orderNumber = "";
            this.model.cardHolderName = "";
            this.model.creditCardNumber = "";
            this.model.expirationDate = "";
            this.model.cardSecurityCode = "";
            this.model.transactionAmount = 0;
        }
    }

    angular
        .module("insite-admin")
        .controller("SubmitNewTransactionActionController", SubmitNewTransactionActionController)
        .directive("isaSubmitNewTransactionAction", () => {
            return {
                restrict: "EAC",
                replace: false,
                templateUrl: "/admin/directives/SubmitNewTransactionAction",
                controller: "SubmitNewTransactionActionController",
                controllerAs: "vm",
                scope: {}
            }
        });
}