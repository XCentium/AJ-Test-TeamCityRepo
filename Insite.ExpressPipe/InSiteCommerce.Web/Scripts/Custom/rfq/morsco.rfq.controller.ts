module insite.rfq {
    "use strict";

    export class MorscoRfqController extends RfqController {
        poNumber: string;
        warehouses: {};

        static $inject = ["$window", "$scope", "cartService", "rfqService", "accountService", "sessionService", "websiteService", "specialOrderService"];

        constructor(
            protected $window: ng.IWindowService,
            protected $scope: ng.IScope,
            protected cartService: cart.ICartService,
            protected rfqService: rfq.IRfqService,
            protected accountService: account.IAccountService,
            protected sessionService: account.ISessionService,
            protected websiteService: websites.IWebsiteService,
            protected specialOrderService: cart.ISpecialOrderService) {

            super($window, $scope, cartService, rfqService, accountService, sessionService);
        }

        initEvents(): void {
            this.$scope.$on("cartLoaded", (event, cart: CartModel) => {
                if (!this.cart) {
                    this.mapData(cart);
                }
                if (cart.properties['warehouses']) {
                    this.warehouses = JSON.parse(cart.properties['warehouses']);
                }
				this.websiteService.getWebsite('current').success(function (website) {
					var cat = [];
					var noncat = [];
					cart.cartLines.forEach(cartLine => {
						if (cartLine.properties['specifications']) {
							cartLine.properties['specifications'] = JSON.parse(cartLine.properties['specifications']);
                        }

                        var availability = JSON.parse(cartLine.properties["availability"]);
                        var branches = JSON.parse(cartLine.properties["branches"]);
                        
                        if (branches[cart.shipVia.id.toString()]) {
                            if (branches[cart.shipVia.id.toString()] < 0) {
                                cartLine.properties['qtyonhand'] = '0';
                            } else {
                                cartLine.properties['qtyonhand'] = branches[cart.shipVia.id.toString()];
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

						var productType = "noncatalog";
						if (cartLine.properties['catalogWebSite']) {
							var websiteList = cartLine.properties['catalogWebSite'].split(",");
							if (websiteList.indexOf(website.name) > -1) {
								productType = "catalog";
							}
						}

						if (productType == 'noncatalog') {
							if (cartLine.properties['sopDescription']) {
								productType = "special order";
							}
						}

						cartLine.properties['productType'] = productType;
						if (productType == 'catalog') {
							cat.push(cartLine);
						} else {
							noncat.push(cartLine);
						}
						cart.cartLines = cat.concat(noncat);
                    });

                    $(document).foundation('tooltip', 'reflow');
				});

                this.cart = cart;

                if ($(window).width() > 960) {
                    setTimeout(function () {
                        $('.summary').sticky({
                            topSpacing: 50,
                            bottomSpacing: $('#footer').outerHeight() + 20
                        });
                    }, 250);
                }
                
            });
            this.$scope.$on("sessionLoaded", (event: ng.IAngularEvent, session: SessionModel) => {
                this.session = session;
            });
            this.$scope.$on("settingsLoaded", (event, data) => {
                this.quoteSettings = data.quoteSettings;
            });
        }

        submitQuote(submitSuccessUri): any {
			var valid = angular.element("#submitQuoteForm").validate().form();
            if (!valid) {
                return;
            }
            var jobName = this.cart.billTo.companyName;
            if (this.cart.shipTo && this.cart.shipTo.companyName && this.cart.shipTo.companyName != '') {
                jobName = this.cart.shipTo.companyName;
            }
            var parameters = {
                quoteId: this.cart.id,
                userId: this.selectedUser,
                note: this.notes,
                jobName: jobName,
                isJobQuote: this.isJobQuote,
            };
            
            this.disableSubmit = true;
            var self = this;
            this.rfqService.submitQuote(parameters).then((result) => {
                var params = {
                    quoteId: result.id,
                    poNumber: encodeURIComponent(this.poNumber),
                };
                self.specialOrderService.updateQuote(params).then((data) => {
                    this.$window.location.href = submitSuccessUri + "?quoteId=" + result.id;
                });
            }, () => {
	            this.disableSubmit = false;
            });
        }
    }

    angular
        .module("insite")
        .controller("RfqController", MorscoRfqController);
}