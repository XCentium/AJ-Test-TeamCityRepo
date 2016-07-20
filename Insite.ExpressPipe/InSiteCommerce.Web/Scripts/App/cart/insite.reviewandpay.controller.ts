module insite.cart {
    "use strict";

    export class ReviewAndPayController {

        cart: CartModel;
        cartId: string;
        cartIdParam: string;
        promotions: PromotionModel[];
        promotionAppliedMessage: string;
        promotionErrorMessage: string;
        submitErrorMessage: string;
        submitting: boolean;
        validating: boolean;
        cartUrl: string;

        static $inject = [
            "$scope"
            , "$window"
            , "cartService"
            , "promotionService"
            , "sessionService"
            , "coreService"
            , "spinnerService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected cartService: ICartService,
            protected promotionService: promotions.IPromotionService,
            protected sessionService: ISessionService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService) {

            this.init();
        }

        init() {
            this.cartId = this.coreService.getQueryStringParameter("cartId", true) || "current";
            this.get(true);

            $("#reviewAndPayForm").validate();
            this.$scope.$watch("vm.cart.paymentOptions.creditCard.expirationYear", (value) => {
                if (value) {
                    var now = new Date();
                    var minMonth = now.getFullYear() === value ? now.getMonth() : 0;
                    $("#expirationMonth").rules("add", { min: minMonth });
                    if (this.validating) {
                        $("#expirationMonth").valid();
                    }
                }
            });
        }

        get(isInit?: boolean) {

            var paymentMethod: Insite.Cart.Services.Dtos.PaymentMethodDto,
                saveCardType: string,
                saveCardHolderName: string,
                saveCardNumber: string,
                saveExpirationMonth: number,
                saveExpirationYear: number,
                saveSecurityCode: string;

            this.cartService.expand = "cartlines,shipping,tax,carriers,paymentoptions";
            this.cartService.getCart(this.cartId).then(cart => {
                var payerId = this.coreService.getQueryStringParameter("PayerID", true).toUpperCase();
                var token = this.coreService.getQueryStringParameter("token", true).toUpperCase();

                // save transients
                if (this.cart && this.cart.paymentOptions) {
                    paymentMethod = this.cart.paymentMethod;
                    saveCardType = this.cart.paymentOptions.creditCard.cardType;
                    saveCardHolderName = this.cart.paymentOptions.creditCard.cardHolderName;
                    saveCardNumber = this.cart.paymentOptions.creditCard.cardNumber;
                    saveExpirationMonth = this.cart.paymentOptions.creditCard.expirationMonth;
                    saveExpirationYear = this.cart.paymentOptions.creditCard.expirationYear;
                    saveSecurityCode = this.cart.paymentOptions.creditCard.securityCode;
                }

                this.cart = cart;

                // if cart does not have OrderLines, go to Cart page
                if (!this.cart.cartLines || this.cart.cartLines.length === 0 ) {
                    this.$window.location.href = this.cartUrl;
                }

                this.cartIdParam = this.cart.id === "current" ? "" : "?cartId=" + this.cart.id;

                // restore transients
                if (saveCardType) {
                    this.cart.paymentOptions.creditCard.cardType = saveCardType;
                    this.cart.paymentOptions.creditCard.cardHolderName = saveCardHolderName;
                    this.cart.paymentOptions.creditCard.cardNumber = saveCardNumber;
                    this.cart.paymentOptions.creditCard.expirationMonth = saveExpirationMonth;
                    this.cart.paymentOptions.creditCard.expirationYear = saveExpirationYear;
                    this.cart.paymentOptions.creditCard.securityCode = saveSecurityCode;
                }

                this.cart.carriers.forEach(carrier => {
                    if (carrier.id === this.cart.carrier.id) {
                        this.cart.carrier = carrier;
                        if (isInit) {
                             this.updateCarrier();
                        }
                    }
                });
                if (this.cart.carrier && this.cart.carrier.shipVias) {
                    this.cart.carrier.shipVias.forEach(shipVia => {
                        if (shipVia.id === this.cart.shipVia.id) {
                            this.cart.shipVia = shipVia;
                        }
                    });
                }

                var selectedMethod = paymentMethod || this.cart.paymentMethod;
                if (selectedMethod) {
                    this.cart.paymentOptions.paymentMethods.forEach(paymentMethod => {
                        if (paymentMethod.name === selectedMethod.name) {
                            this.cart.paymentMethod = paymentMethod;
                        }
                    });
                }

                if (payerId && token) {
                    this.cart.paymentOptions.isPayPal = true;
                    this.cart.status = "Cart";
                    this.cart.paymentOptions.payPalToken = token;
                    this.cart.paymentOptions.payPalPayerId = payerId;
                    this.cart.paymentMethod = null;
                }

                this.promotionService.getCartPromotions("current").success((result: PromotionCollectionModel) => {
                    this.promotions = result.promotions;
                });
            });
        }

        updateShipVia() {
            this.cartService.updateCart(this.cart).then(
                () => {
                    this.get();
                }
            );
        }

        updateCarrier(): void {
            if (this.cart.carrier && this.cart.carrier.shipVias) {
                if (this.cart.carrier.shipVias.length === 1 && this.cart.carrier.shipVias[0] !== this.cart.shipVia) {
                    this.cart.shipVia = this.cart.carrier.shipVias[0];
                    this.updateShipVia();
                }

                if (this.cart.carrier.shipVias.length > 1 && this.cart.carrier.shipVias.every(sv => sv.id !== this.cart.shipVia.id) &&
                    this.cart.carrier.shipVias.filter(sv => sv.isDefault).length > 0) {
                    this.cart.shipVia = this.cart.carrier.shipVias.filter(sv => sv.isDefault)[0];
                    this.updateShipVia();
                }
            }
        }

        submit(submitSuccessUri: string, signInUri: string) {
            this.submitting = true;
            this.validating = true;
            this.submitErrorMessage = "";
            // TODO: use angular validation
            var valid = $("#reviewAndPayForm").validate().form();
            if (!valid) {
                $("html, body").animate({
                    scrollTop: $("#reviewAndPayForm").offset().top
                }, 300);
                this.submitting = false;
                return;
            }

            this.sessionService.getIsAuthenticated()
                .then((isAuthenticated: boolean) => {
                    if (isAuthenticated) {
                        if (this.cart.requiresApproval) {
                            this.cart.status = "AwaitingApproval";
                        } else {
                            this.cart.status = "Submitted";
                        }

                        this.spinnerService.show("mainLayout", true);
                        this.cartService.updateCart(this.cart, true).success(result => {
                            this.cart.id = result.id;
                            this.$window.location.href = submitSuccessUri + "?cartid=" + this.cart.id;
                        }).error(error => {
                            this.submitting = false;
                            this.cart.paymentOptions.isPayPal = false;
                            this.submitErrorMessage = error.message;
                            this.spinnerService.hide();
                        });
                    } else {
                        this.$window.location.href = signInUri + "?returnUrl=" + this.$window.location.href;
                    }
                });
        }

        submitPaypal(returnUrl: string, signInUrl: string) {
            this.submitErrorMessage = "";
            $("#pmnt").hide();
            var valid = $("#reviewAndPayForm").validate().form();
            if (!valid) {
                $("html, body").animate({
                    scrollTop: $("#reviewAndPayForm").offset().top
                }, 300);
                $("#pmnt").show();
                return;
            }
            this.sessionService.getIsAuthenticated()
                .then((isAuthenticated: boolean) => {
                    if (isAuthenticated) {
                        this.spinnerService.show("mainLayout", true);
                        this.cart.paymentOptions.isPayPal = true;
                        this.cart.paymentOptions.payPalPaymentUrl = this.$window.location.host + returnUrl;
                        this.cart.paymentMethod = null;
                        this.cart.status = "PaypalSetup";
                        this.cartService.updateCart(this.cart, true).success(result => {
                            this.$window.location.href = result.paymentOptions.payPalPaymentUrl;
                        }).error(error => {
                            $("#pmnt").show();
                            this.cart.paymentOptions.isPayPal = false;
                            this.submitErrorMessage = error.message;
                            this.spinnerService.hide();
                        });
                    } else {
                        this.$window.location.href = signInUrl + "?returnUrl=" + this.$window.location.href;
                    }
                });
        }
    }

    angular
        .module("insite")
        .controller("ReviewAndPayController", ReviewAndPayController);
}
