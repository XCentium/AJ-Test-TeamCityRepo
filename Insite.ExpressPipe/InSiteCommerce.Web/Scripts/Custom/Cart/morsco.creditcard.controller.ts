module insite.cart {
    "use strict";

    export class MorscoCreditCardController {

        cart: CartModel;
        cardList: any = {};
        selectedCard: any = {};
        redirectUrl: string = "";
        contactId: string = "";
        country: CountryModel;
        error: boolean = false;
        newCreditCard: any = {};
        ccBlock: string;
        cardToDelete: string;
        errorMessage: string;

        static $inject = [
            "$scope",
            "$rootScope",
            "creditCardService",
            "websiteService",
            "cartService",
            "spinnerService"
        ];

        constructor(protected $scope: ng.IScope,
            protected $rootScope: ng.IRootScopeService,
            protected creditCardService: cart.ICreditCardService,
            protected websiteService: websites.IWebsiteService,
            protected cartService: cart.ICartService,
            protected spinnerService: core.ISpinnerService) {
            this.init();
        }

        init() {
            this.$scope.$on("cartLoaded",
            (event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                this.getCardList();
            });

            $(document).foundation('reveal', 'reflow');

            //if (this.cart.paymentOptions) {
            //    this.cart.paymentMethod = this.cart.paymentOptions.paymentMethods[0];
            //}
            window.addEventListener("message", this.iframeChanged.bind(this), false);
            var self = this;
            this.websiteService.getCountries("states")
                .success(result => {
                    self.country = result.countries[0];
                });
        }

        getCardList() {
            var self = this;
            this.creditCardService.getCardList()
                .success(data => {
                    self.cardList = data;
                    self.decodeCardData();
                    self.setSelectedCard();

                });
        }

        deleteConfirmationPopup(cardId: string) {
            this.cardToDelete = cardId;
            $('#deleteCreditCardConfirmation').foundation('reveal', 'open');
        }

        deleteCard() {
            var self = this;
            self.creditCardService.deleteCard(this.cardToDelete)
                .success(data => {
                    self.cardList = data;
                    self.decodeCardData();
                    self.setSelectedCard();
                    self.cardToDelete = null;
                    $('#deleteCreditCardConfirmation').foundation('reveal', 'close');
                });
        }

        addNewCard() {
            //this.getCardList();
            //firstname: "test",
            //middlename: "middle",
            //lastname: "last",
        }

        submitNewCreditCard() {
            var valid = true;

            if (!this.newCreditCard.cardHolderName ||
                !this.newCreditCard.address ||
                !this.newCreditCard.city ||
                !this.newCreditCard.state ||
                !this.newCreditCard.zip) valid = false;

            // if valid
            if (valid) {
                // send to element
                var params = {
                    cardholdername: encodeURIComponent(this.newCreditCard.cardHolderName),
                    billingaddress: encodeURIComponent(this.newCreditCard.address),
                    city: encodeURIComponent(this.newCreditCard.city),
                    state: this.newCreditCard.state,
                    zip: encodeURIComponent(this.newCreditCard.zip)
                };

                var self = this;
                this.errorMessage = null;
                this.creditCardService.addNewCard(params)
                    .success(data => {
                        if (data["setupResult"] == 'True') {
                            self.redirectUrl = data["redirectUrl"];
                            self.contactId = data["contactId"];
                            $('#frame').attr('src', self.redirectUrl);
                            $('#addNewCreditCard').foundation('reveal', 'close');
                            // need time for other modal to clear
                            setTimeout(function() {
                                    $('#addNewCreditCardElement').foundation('reveal', 'open');
                                },
                                500);

                            this.newCreditCard.cardHolderName = "";
                            this.newCreditCard.address = "";
                            this.newCreditCard.city = "";
                            this.newCreditCard.state = "";
                            this.newCreditCard.zip = "";
                        } else {
                            this.errorMessage = data['errorMessage'];
                        }

                    })
                    .error(msg => {
                        window.console.dir(msg);
                    });
            } else {
                // failed validation
            }
        }

        finalizeNewCard(setupResult: any) {
            this.spinnerService.show("mainLayout");
            var self = this;
            if (setupResult.HostedPaymentStatus !== "Cancelled") {
                this.creditCardService.finalizeNewCard(setupResult)
                    .success(data => {
                        self.cardList = data;
                        self.decodeCardData();
                        self.setSelectedCard();
                    });
            }
        }

        iframeChanged(event) {

            var params = this.parseQueryString(event.data);
            var setupResult = {
                HostedPaymentStatus: params['HostedPaymentStatus'],
                TransactionSetupID: params['TransactionSetupID'],
                Setup_ID: params['TransactionSetupID'],
                ServicesID: params['ServicesID'],
                ExpressResponseCode: params['ExpressResponseCode'],
                ExpressResponseMessage: params['ExpressResponseMessage'],
                PaymentAccountID: params['PaymentAccountID'],
                LastFour: params['LastFour'],
                ValidationCode: params['ValidationCode'],
            };

            //var setupResult = params['setupresult'];
            this.finalizeNewCard(setupResult);
            $('#addNewCreditCardElement').foundation('reveal', 'close');
        }

        parseQueryString(queryString: string): any {
            var params = {}, queries, temp, i, l;

            // Split into key/value pairs
            queries = queryString.split("&");

            // Convert the array of strings into an object
            for (i = 0, l = queries.length; i < l; i++) {
                temp = queries[i].split('=');
                params[temp[0]] = temp[1];
            }
            return params;
        }

        selectCard(elementAcctId: string) {
            var self = this;
            this.creditCardService.selectCard(elementAcctId)
                .success(data => {
                    self.cardList = data;
                    self.decodeCardData();
                    self.setSelectedCard();
                });
        }

        setSelectedCard() {
            var self = this;
            delete self.cart.properties['creditCard'];
            for (var card in self.cardList.creditCards) {
                if (self.cardList.creditCards[card].isSelectedCard) {
                    self.selectedCard = self.cardList.creditCards[card];
                    if (self.cart) {
                        self.cart.properties['creditCard'] = JSON.stringify(self.selectedCard);
                        self.cartService.updateCart(self.cart);
                    }
                }
            }
        }

        decodeCardData() {
            var self = this;
            for (var card in self.cardList.creditCards) {
                var e = document.createElement('div');
                e.innerHTML = self.cardList.creditCards[card].cardHolder;
                self.cardList.creditCards[card].cardHolder = e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
                // e does not appear to have a parent -- how to delete from dom? e.parentElement.removeChild(e);
            }
        }
    }

    angular
        .module("insite")
        .controller("MorscoCreditCardController", MorscoCreditCardController)
        .filter('trustAsResourceUrl', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsResourceUrl(val);
        };
    }]);
}
