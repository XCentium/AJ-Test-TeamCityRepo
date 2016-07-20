module insite.cart {
    "use strict";

    export class MorscoReviewAndPayController extends ReviewAndPayController {

        shipmentRequestedDate: string;
        specialHandlingInstructions: string;
        warehouses: any = {};

        static $inject = [
            "$scope"
            , "$window"
            , "cartService"
            , "promotionService"
            , "sessionService"
            , "coreService"
            , "spinnerService"
            , "websiteService"
            , "$rootScope"
        ];

        constructor(
            protected $scope: ng.IScope,
			protected $window: ng.IWindowService,
			protected cartService: ICartService,
			protected promotionService: promotions.IPromotionService,
			protected sessionService: ISessionService,
			protected coreService: core.ICoreService,
			protected spinnerService: core.ISpinnerService,
            protected websiteService: websites.IWebsiteService,
            protected $rootScope: ng.IRootScopeService) {

            super($scope, $window, cartService, promotionService, sessionService, coreService, spinnerService);
            
        }

        init() {
            this.cartId = this.coreService.getQueryStringParameter("cartId", true) || "current";
            this.get(true);

            $("#reviewAndPayForm").validate();
        }

        get(isInit?: boolean) {

            var paymentMethod: Insite.Cart.Services.Dtos.PaymentMethodDto,
                saveCardType: string,
                saveCardHolderName: string,
                saveCardNumber: string,
                saveExpirationMonth: number,
                saveExpirationYear: number,
                saveSecurityCode: string;

            var self = this;
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


                self.cart = cart;
                if (cart.properties['warehouses']) {
                    self.warehouses = JSON.parse(cart.properties['warehouses']);
                }
                // if cart does not have OrderLines, go to Cart page
                if (!this.cart.cartLines || this.cart.cartLines.length === 0 ) {
                    this.$window.location.href = this.cartUrl;
                }

				
				//Check if this is a quote and decide to split items or not
				if (cart.status != "QuoteProposed" && cart.type != "Quote") {
					this.websiteService.getWebsite('current').success(function (website) {
						var nonCatalogProductCount = 0;
						var catalogOrderCount = 0;
						cart.cartLines.forEach(cartLine => {

							var productType = "noncatalog";
							if (cartLine.properties['catalogWebSite']) {
								var websiteList = cartLine.properties['catalogWebSite'].split(",");
								if (websiteList.indexOf(website.name) > -1) {
									productType = "catalog";
									catalogOrderCount += 1;
								}
							}

							if (productType == 'noncatalog') {
								nonCatalogProductCount += 1;
								if (cartLine.properties['sopDescription']) {
									productType = "special order";
								}
							}

							cartLine.properties['productType'] = productType;
						});
						cart.properties['nonCatalogProductCount'] = nonCatalogProductCount.toString();
						cart.properties['catalogOrderCount'] = catalogOrderCount.toString();
					});
				} else {
					var catalogOrderCount = 0;
					cart.properties['nonCatalogProductCount'] = "0";
					this.websiteService.getWebsite('current').success(function (website) {
						cart.cartLines.forEach(cartLine => {
							cartLine.properties['productType'] = "catalog";
						});
					});

					cart.properties['catalogOrderCount'] = cart.lineCount.toString();
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
                    if (carrier.id === this.cart.properties['shipmethod']) {
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
                } else {
                    this.cart.paymentMethod = this.cart.paymentOptions.paymentMethods[0];
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

                setTimeout(function () {
                    if ($(window).width() > 960) {
                        $('.summary').sticky({
                            topSpacing: 50,
                            bottomSpacing: $('#footer').outerHeight() + 20
                        });
                    }
                }, 250);

                this.setBranchQuantity();
            });
        }

        formatDate(date: string) {
            var dateOut = new Date(date);
            return dateOut;
        }

        submit(submitSuccessUri: string, signInUri: string) {
			this.submitting = true;
            this.validating = true;
			var self = this;
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

            if (this.cart.paymentMethod.isCreditCard && !this.cart.properties['creditCard']) {
                self.$rootScope.$broadcast("showApiErrorPopup", {message: "Please add a valid credit card or change payment type before submitting this order."});
                return;
            }
            this.sessionService.getIsAuthenticated()
                .then((isAuthenticated: boolean) => {
                    if (isAuthenticated) {
						//custom morsco
						this.cart.properties["paymentMethodName"] = this.cart.paymentMethod.description;
						this.cart.properties["specialHandlingInstructions"] = this.specialHandlingInstructions;
						//

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

        setBranchQuantity() {
            this.cart.cartLines.forEach(cartLine => {
                var branches = JSON.parse(cartLine.properties["branches"]);
                var availability = JSON.parse(cartLine.properties["availability"]);
                if (branches[this.cart.shipVia.id.toString()]) {
                    if (branches[this.cart.shipVia.id.toString()] < 0) {
                        cartLine.properties['qtyonhand'] = '0';
                    } else {
                        cartLine.properties['qtyonhand'] = branches[this.cart.shipVia.id.toString()];
                    }

                } else {
                    cartLine.properties['qtyonhand'] = "0";
                }

                if (parseInt(cartLine.properties['qtyonhand']) > 0) {
                    cartLine.availability["messageType"] = 1;
                    cartLine.availability["message"] = "In Stock";
                } else if (availability.StockQty > 0) {
                    cartLine.availability["messageType"] = 2;
                    cartLine.availability["message"] = "In Stock at Other Locations";
                } else {
                    cartLine.availability["messageType"] = 3;
                    cartLine.availability["message"] = "Available for Order";
                }
            });
        }
    }

    angular
        .module("insite")
        .controller("ReviewAndPayController", MorscoReviewAndPayController);
}