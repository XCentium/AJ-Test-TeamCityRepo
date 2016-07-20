
module insite.rfq {
    "use strict";

    export class MorscoQuoteDetailsController extends QuoteDetailsController {
		openLineNoteId = "";
        selectedCarrierId: string;
        selectedShipVia: string;
        selectedShipViaId1: string;
        warehouses: {};
        defaultWarehouses: any = {};
        website: any;

        static $inject = ["$window", "$rootScope", "$scope", "coreService", "rfqService", "specialOrderService", "spinnerService", "cartService", "customProductService", "websiteService",];

        constructor(protected $window: ng.IWindowService,
					protected $rootScope: ng.IScope,
					protected $scope: ng.IScope,
					protected coreService: core.ICoreService,
					protected rfqService: rfq.IRfqService,
					protected specialOrderService: cart.ISpecialOrderService,
                    protected spinnerService: core.ISpinnerService,
                    protected cartService: cart.ICartService,
                    protected customProductService: catalog.ICustomProductService,
                    protected websiteService: websites.IWebsiteService) {
            super($window, $rootScope, $scope, coreService, rfqService);
            var self = this;
            this.websiteService.getWebsite('current').success(function (website) {
                self.website = website;
            });
        }

        init() {
            this.initEvents();
            this.quoteId = this.coreService.getQueryStringParameter("quoteId");
            this.$scope.$on("getQuote",
                (event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                    this.getQuote();
                });
            this.$rootScope.$broadcast("getQuote", cart);
            this.validateForm();
        }
        getQuote(): void {
            var self = this;

            this.rfqService.getQuote(this.quoteId).then((result) => {
                var validShipVia = false;
                self.quote = result;
                var today = new Date();
                if (self.quote.statusDisplay === "QuoteRequested") {
                    self.quote.statusDisplay = "Requested";
                }

                if (!self.quote.carrier) {
                    self.quote.carrier = self.quote.carriers[1];
                    self.selectedCarrierId = self.quote.carrier.id.toString();
                }

                self.quote.properties['shipmethod'] = self.selectedCarrierId;
                if (self.quote.shipVia) {
                    self.quote.shipVia = self.quote.shipVia;
                    self.selectedShipVia = self.quote.shipVia.id.toString();
                } else {
                    self.quote.shipVia = self.quote.carrier.shipVias[0]
                    self.selectedShipVia = self.quote.carrier.shipVias[0].id.toString();
                }
                
                if (!self.quote.carrier) {
                    self.quote.carrier = self.quote.carriers[1];
                    self.selectedCarrierId = self.quote.carriers[0].id.toString();
                    self.selectedShipVia = self.quote.shipVia.id.toString();
                }
                var warehouseList = self.quote.properties['defaultWarehouse'].split(',');
                if (self.quote.expirationDate && self.quote.status != 'QuoteRequested' && self.quote.status != 'QuoteRejected') {
                    var expDate = new Date(self.quote.expirationDate.toString());
					if (expDate >= today) {
                        self.quote.statusDisplay = 'Active';
					} else {
                        self.quote.statusDisplay = 'Expired';
					}
                    if (self.quote.status == "QuoteSubmitted") {
                        self.quote.statusDisplay = 'Order Pending';
					}
				}

                if (self.quote.properties['warehouses']) {
                    self.warehouses = JSON.parse(self.quote.properties['warehouses']);
                }

                if (self.quote && self.quote.calculationMethods && self.quote.calculationMethods.length > 0) {
                    self.calculationMethod = self.quote.calculationMethods[0];
                    self.changeCalculationMethod();
                }

                self.quote.carriers.forEach(carrier => {
                    carrier.shipVias.forEach(shipVia => {
                        if (shipVia.id.toString() == self.selectedShipVia) {
                            self.selectedCarrierId = carrier.id.toString();
                            self.quote.carrier = carrier;
                            validShipVia = true;
                        }

                        warehouseList.forEach(warehouse => {
                            if (shipVia.id.toString() == warehouse) {
                                self.defaultWarehouses[carrier.id.toString()] = shipVia.id.toString();
                            }
                        });
                    });
                });
                if (!validShipVia) {
                    self.quote.properties["shipvia"] = self.defaultWarehouses[self.selectedCarrierId];
                    self.selectedShipVia = self.defaultWarehouses[self.selectedCarrierId];
                }

                self.quote.properties["shipmethod"] = self.selectedCarrierId;
                self.quote.properties["shipvia"] = self.selectedShipVia;

                $('#shippingMethod').val(self.selectedShipVia);
                $('#shippingMethod-' + self.selectedCarrierId).val(self.selectedShipVia);
                self.setBranchQuantity();
                setTimeout(function () {
                    $(document).foundation('tooltip', 'reflow');
                }, 500);
            });
        }

		deleteConfirmationPopup() {
			$('#declineQuoteConfirmation').foundation('reveal', 'open');
        }

		declineThisQuote(uri: string) {
            var quoteInfo = {
                quoteId: this.quoteId,
                status: "QuoteRejected"
            };
			this.specialOrderService.updateQuote(quoteInfo).then((data) => {
				this.$window.location.href = uri + "?quoteId=" + this.quoteId;
			});
		}

		reQuote() {
			//var quoteId = this.quoteId = this.coreService.getQueryStringParameter("quoteId");
			//this.specialOrderService.reQuote(quoteId)
			//	.success(function (data) {
				
			//	})
			//	.error(function (error) {

			//	});
		}

		updateSubTotal() {
            this.rfqService.getQuote(this.quoteId).then((result) => {
                this.quote.orderSubTotal = result.orderSubTotal;
                this.quote.orderSubTotalDisplay = result.orderSubTotalDisplay;
                this.quote.quoteLineCollection = result.quoteLineCollection;
            });
        }

		removeLine(quoteLine: QuoteLineModel) {
			var self = this;
			this.spinnerService.show();
			this.specialOrderService.removeQuoteLine(quoteLine).then(function () {
				self.$window.location.href = self.$window.location.href;
			});
        }

        shippingMethodChange() {
            this.spinnerService.show("mainLayout", true);
            this.selectedCarrierId = $('input[name=selectedCarrier]:checked').val();

            this.quote.properties["shipmethod"] = this.selectedCarrierId;

            this.quote.carriers.forEach(carrier => {
                if (carrier.id.toString() === this.selectedCarrierId) {
                    this.quote.carrier = carrier;
                }
            });
            this.selectedShipVia = this.defaultWarehouses[this.selectedCarrierId];
            this.setShipVia();
            $('#shippingMethod').val(this.quote.properties["shipvia"]);
        }

        setShipVia() {
            this.quote.properties["shipvia"] = this.selectedShipVia;
            this.quote.carrier.shipVias.forEach(shipVia => {
                if (this.selectedShipVia == shipVia.id) {
                    this.quote.shipVia = shipVia;
                }
            });
            //}
            var self = this;
            var params = {
                quoteId: this.quote.id,
                carrierId: this.quote.carrier.id.toString(),
                shipViaId: this.quote.shipVia.id.toString(),
            };
            this.specialOrderService.updateQuote(params).then(function () {
                self.getQuote();
            });
        }

        setShipVia2() {
            var found = false;
            this.quote.properties["shipvia"] = this.selectedShipVia;
            this.quote.shipVia = this.quote.carrier.shipVias[0];
            this.quote.carrier.shipVias.forEach(shipVia => {
                if (this.selectedShipVia == shipVia.id) {
                    this.quote.shipVia = shipVia;
                    found = true;
                }
            });
            if (!found) {
                this.quote.shipVia = this.quote.carrier.shipVias[0];
                this.selectedShipVia = this.quote.carrier.shipVias[0].id.toString();
            }

            this.quote.properties["shipmethod"] = this.quote.carrier.id.toString();
            this.quote.properties["shipvia"] = this.quote.shipVia.id.toString();
            this.quote.properties['carrier'] = this.quote.carrier.id.toString();
            var params = {
                quoteId: this.quote.id,
                carrierId: this.quote.carrier.id.toString(),
                shipViaId: this.quote.shipVia.id.toString(),
            };
            var self = this;
            this.specialOrderService.updateQuote(params).then(function () {
                self.getQuote();
            });
        }

        updateShipVia() {
            this.spinnerService.show("mainLayout", true);
            this.selectedShipVia = $('#shippingMethod-' + this.selectedCarrierId).val();
            this.setShipVia();

        }

        setBranchQuantity() {
            this.quote.quoteLineCollection.forEach(cartLine => {
                var branches = JSON.parse(cartLine.properties["branches"]);
                var availability = JSON.parse(cartLine.properties["availability"]);

                if (branches[this.quote.shipVia.id.toString()]) {
                    if (branches[this.quote.shipVia.id.toString()] < 0) {
                        cartLine.properties['qtyonhand'] = '0';
                    } else {
                        cartLine.properties['qtyonhand'] = branches[this.quote.shipVia.id.toString()];
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
                    if (websiteList.indexOf(this.website.name) > -1) {
                        productType = "catalog";
                    }
                }

                if (productType == 'noncatalog') {

                    if (cartLine.properties['sopDescription']) {
                        productType = "special order";
                    }
                }

                if (cartLine.properties['specifications']) {
                    cartLine.properties['specifications'] = JSON.parse(cartLine.properties['specifications']);
                }

                cartLine.properties['productType'] = productType;
            });
            this.spinnerService.hide("mainLayout");
        }

        acceptCheckout(url): void {
            this.validateForm();
            if (!this.formValid) {
                return;
            }
            //if (!this.isCartEmpty) {
            //    angular.element("#rfqPopupCartNotificationLink").trigger("click");
            //} else {
            //    this.continueCheckout(url);
            //}

			this.continueCheckout(url);
        }
    }


    angular
        .module("insite")
        .controller("QuoteDetailsController", MorscoQuoteDetailsController);
}