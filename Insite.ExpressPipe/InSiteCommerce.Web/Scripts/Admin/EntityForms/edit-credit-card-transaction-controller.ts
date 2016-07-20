
module insite_admin {
    import Core = insite.core;
    "use strict";

    export class EditCreditCardTransactionController extends EditEntityController {
        static $inject = [
            "$rootScope",
            "$scope",
            "$http",
            "$window",
            "$parse",
            "$attrs",
            "$timeout",
            "displayNameService",
            "$sessionStorage",
            "$location",
            "breadcrumbService",
            "odataService",
            "spinnerService",
            "fingerTabsService",
            "$routeParams",
            "FoundationApi",
            "$q",
            "entityDefinitionService",
            "adminActionService",
            "$route",
            "notificationService"
        ];

        amountModal: number;
        transactionType: string;
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $window: ng.IWindowService,
            protected $parse: ng.IParseService,
            protected $attrs: IEditEntityAttributes,
            protected $timeout: ng.ITimeoutService,
            protected displayNameService: IDisplayNameService,
            protected $sessionStorage: Core.IWindowStorage,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService,
            protected odataService: IOdataService,
            protected spinnerService: ISpinnerService,
            protected fingerTabsService: FingerTabsService,
            protected $routeParams: any,
            protected $foundationApi: any,
            protected $q: ng.IQService,
            protected entityDefinitionService: EntityDefinitionService,
            protected adminActionService: IAdminActionService,
            protected $route: ng.route.IRouteService,
            protected notificationService: INotificationService
        ) {
            super($rootScope, $scope, $http, $window, $parse, $attrs, $timeout, displayNameService, $sessionStorage, $location, breadcrumbService, odataService, spinnerService, fingerTabsService, $routeParams, $foundationApi, $q, entityDefinitionService, adminActionService, $route);
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
                    PNRef: this.model.rnRef
                }
            };
            var config = { bypassErrorInterceptor: true };

            this.$http.post(url, data, config).then((result : any) => {
                if (result.data.error) {
                    this.notificationService.show(NotificationType.Error, result.data.error);
                } else if (result.data.success){
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
        .controller("EditCreditCardTransactionController", EditCreditCardTransactionController);
}