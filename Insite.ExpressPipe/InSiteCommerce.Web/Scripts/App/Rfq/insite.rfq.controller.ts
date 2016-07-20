module insite.rfq {
    "use strict";

    export class RfqController {
        cart: CartModel;
        session: SessionModel;
        isSalesRep: boolean;
        users: any;
        selectedUser: any;
        isJobQuote: boolean;
        jobName: string;
        notes: string;
        quoteSettings: QuoteSettingsModel;
        disableSubmit: boolean;

        static $inject = ["$window", "$scope", "cartService", "rfqService", "accountService", "sessionService"];

        constructor(
            protected $window: ng.IWindowService,
            protected $scope: ng.IScope,
            protected cartService: cart.ICartService,
            protected rfqService: rfq.IRfqService,
            protected accountService: account.IAccountService,
            protected sessionService: account.ISessionService) {

            this.init();
        }

        init() {
            this.initEvents();
            this.cartService.expand = "cartlines,costcodes";
        }

        initEvents(): void {
            this.$scope.$on("cartLoaded", (event, cart: CartModel) => {
                if (!this.cart) {
                    this.mapData(cart);
                }
                this.cart = cart;
            });
            this.$scope.$on("sessionLoaded", (event: ng.IAngularEvent, session: SessionModel) => {
                this.session = session;
            });
            this.$scope.$on("settingsLoaded", (event, data) => {
                this.quoteSettings = data.quoteSettings;
            });
        }

        mapData(cart: CartModel): void {
            this.notes = cart.notes;
            this.isSalesRep = cart.isSalesperson;
            if (this.isSalesRep) {
                this.accountService.getAccounts().success((result) => {
                    this.filterCurrentUser(result.accounts);
                });
            }
        }

        filterCurrentUser(userCollection: AccountModel[]): any {
            this.users = userCollection
                .filter(user => user.userName !== this.session.userName)
                .sort((user1, user2) => user1.userName.localeCompare(user2.userName));
        }

        submitQuote(submitSuccessUri): any {
            var valid = angular.element("#submitQuoteForm").validate().form();
            if (!valid) {
                return;
            }
            var parameters = {
                quoteId: this.cart.id,
                userId: this.selectedUser,
                note: this.notes,
                jobName: this.jobName,
                isJobQuote: this.isJobQuote
            };

            this.disableSubmit = true;
            this.rfqService.submitQuote(parameters).then((result) => {
                this.$window.location.href = submitSuccessUri + "?cartid=" + result.id;
            }, () => {
                this.disableSubmit = false;
            });
        }
    }

    angular
        .module("insite")
        .controller("RfqController", RfqController);
}