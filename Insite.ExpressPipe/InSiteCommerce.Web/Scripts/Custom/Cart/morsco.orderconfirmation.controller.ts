module insite.cart {
    "use strict";

    export class Morsco_OrderConfirmationController extends OrderConfirmationController {

        isCatalog: string;

        static $inject = [
            "websiteService",
            "cartService",
            "promotionService",
            "coreService"
        ];
        constructor(
            protected websiteService: websites.IWebsiteService,
            protected cartService: ICartService,
            protected promotionService: promotions.IPromotionService,
            protected coreService: core.ICoreService) {
            super(cartService, promotionService, coreService);

        }

        init() {
            // get the current cart to update the mini cart
            this.cartService.getCart().then(result => {
                this.showRfqMessage = result.canRequestQuote && result.quoteRequiredCount > 0;
            });

            var confirmedOrderId = this.coreService.getQueryStringParameter("cartid", true);

            this.cartService.expand = "cartlines,carriers";

            this.cartService.getCart(confirmedOrderId).then(cart => {
                this.cart = cart;

                if (window.hasOwnProperty("dataLayer")) {
                    var data = {
                        "event": "transactionComplete",
                        "transactionId": cart.orderNumber,
                        "transactionAffiliation": cart.billTo.companyName,
                        "transactionTotal": cart.orderGrandTotal,
                        "transactionTax": cart.totalTax,
                        "transactionShipping": cart.shippingAndHandling,
                        "transactionProducts": []
                    };

                    for (var key in this.cart.cartLines) {
                        var cartLine = this.cart.cartLines[key];
                        data.transactionProducts.push({
                            "sku": cartLine.erpNumber,
                            "name": cartLine.shortDescription,
                            "price": cartLine.pricing.actualPrice,
                            "quantity": cartLine.qtyOrdered
                        });
                    }

                    window["dataLayer"].push(data);
                }

                this.promotionService.getCartPromotions(confirmedOrderId).success((result: PromotionCollectionModel) => {
                    this.promotions = result.promotions;
                });

				//Check if this is a quote and decide to split items or not
				if (cart.status != "Submitted" && cart.type != "Quote") {
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
					});
				} else {
					var catalogOrderCount = 0;
					cart.properties['nonCatalogProductCount'] = "0";
					this.websiteService.getWebsite('current').success(function (website) {
						cart.cartLines.forEach(cartLine => {
							cartLine.properties['productType'] = "catalog";

							if (cartLine.properties['sopDescription']) {
								cartLine.properties['sop'] = "special order";
							}

						});
					});

					cart.properties['catalogOrderCount'] = cart.lineCount.toString();
				}


                setTimeout(function () {
                    if ($(window).width() > 960) {
                        $('.summary').sticky({
                            topSpacing: 50,
                            bottomSpacing: $('#footer').outerHeight() + 20
                        });
                    }
                }, 250);
            });
        }

        formatDate(date: string) {
            var dateOut = new Date(date);
            return dateOut;
        }
    }

    angular
        .module("insite")
        .controller("OrderConfirmationController", Morsco_OrderConfirmationController);
}
