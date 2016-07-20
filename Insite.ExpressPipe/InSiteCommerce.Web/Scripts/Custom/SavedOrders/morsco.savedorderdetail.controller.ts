module insite.savedorders {
    "use strict";

    export class MorscoSavedOrderDetailController extends SavedOrderDetailController {

        selectedCarrierId: string;
        selectedShipVia: string;
        isInit: boolean;
        warehouses: {};
        defaultWarehouses: any = {};

        static $inject = [
            "$scope",
            "$window",
            "cartService",
            "coreService",
            "spinnerService",
            "websiteService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService,
            protected websiteService: websites.IWebsiteService) {

            super($scope, $window, cartService, coreService, spinnerService);
        }

        init() {
            this.isInit = true;
            this.$scope.$on("settingsLoaded",(event, data) => {
                data.productSettings.showAddToCartConfirmationDialog = false; //We do not need a popups for this page
                this.showInventoryAvailability = data.productSettings.showInventoryAvailability;
            });

            var cartId = this.coreService.getQueryStringParameter("cartid", true);
            var self = this;

            this.cartService.expand = "cartlines,costcodes";
            this.cartService.getCart(cartId);
            this.$scope.$on("cartIdLoaded", (event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                this.getCartCallback(cart);

                if ($(window).width() > 960) {
                    setTimeout(function () {
                        $('.summary').sticky({
                            topSpacing: 50,
                            bottomSpacing: $('#footer').outerHeight() + 20
                        });
                    }, 250);
                }
            });
        }

		getCartCallback(cart: CartModel) {
			var self = this;
			self.cart = cart;
			var addToCartCount = self.cart.cartLines.filter(l => l.canAddToCart).length;
			this.canAddToCart = addToCartCount >= 1;
			this.canAddAllToCart = addToCartCount >= self.cart.cartLines.length;
			if (self.isInit == true) {
				self.getCartInit();
				self.isInit = false;
			}
			if (self.cart.properties['warehouses']) {
				self.warehouses = JSON.parse(self.cart.properties['warehouses']);
			}
			self.websiteService.getWebsite('current').success(function (website) {
				var nonCatalogProductCount = 0;
				var catalogOrderCount = 0;

				self.cart.cartLines.forEach(cartLine => {
					if (cartLine.properties['specifications']) {
						cartLine.properties['specifications'] = JSON.parse(cartLine.properties['specifications']);
					}

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
				self.cart.properties['nonCatalogProductCount'] = nonCatalogProductCount.toString();
				self.cart.properties['catalogOrderCount'] = catalogOrderCount.toString();
				self.cart.properties['totalOrderCount'] = (catalogOrderCount + nonCatalogProductCount).toString();
			});
			self.setBranchQuantity();
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
        
        getCartInit() {
            var self = this;
            var warehouseList = self.cart.properties['defaultWarehouse'].split(',');

            self.cart.carrier = self.cart.carriers[0];
            self.selectedCarrierId = self.cart.carrier.id.toString();
            self.selectedShipVia = self.cart.shipVia.id.toString();

            if (self.cart.properties["shipmethod"]) {
                self.selectedCarrierId = self.cart.properties["shipmethod"];
                self.cart.carriers.forEach(carrier => {
                    if (carrier.id == self.selectedCarrierId) {
                        self.cart.carrier = carrier;
                    }
                    carrier.shipVias.forEach(shipVia => {
                        warehouseList.forEach(warehouse => {
                            if (shipVia.id.toString() == warehouse) {
                                self.defaultWarehouses[carrier.id.toString()] = shipVia.id.toString();
                            }
                        });
                    });
                });
            }
            if (self.cart.properties['shipvia']) {
                self.selectedShipVia = self.cart.properties["shipvia"];
                self.cart.carrier.shipVias.forEach(shipVia => {
                    if (shipVia.id == self.selectedShipVia) {
                        self.cart.shipVia = shipVia;
                    }
                });
            } else {
                self.cart.properties["shipvia"] = self.defaultWarehouses[self.selectedCarrierId];
            }
            //$('#shippingMethod').val(self.cart.properties["shipvia"]);
            $('#shippingMethod-' + self.selectedCarrierId).val(self.selectedShipVia);

        }

        shippingMethodChange() {
            this.selectedCarrierId = $('input[name=selectedCarrier]:checked').val();

            this.cart.properties["shipmethod"] = this.selectedCarrierId;

            this.cart.carriers.forEach(carrier => {
                if (carrier.id.toString() === this.selectedCarrierId) {
                    this.cart.carrier = carrier;
                }
            });
            this.selectedShipVia = this.cart.properties["shipvia"];
            this.setShipVia();
            $('#shippingMethod').val(this.cart.properties["shipvia"]);
        }

        setShipVia() {
            //if (this.selectedCarrierId != this.cart.properties["willCallCarrierId"]) {
            //    this.cart.shipVia = this.cart.carrier.shipVias[0];
            //    this.selectedShipVia = this.cart.shipVia.id.toString();
            //} else {
            this.cart.properties["shipvia"] = this.selectedShipVia;
            this.cart.carrier.shipVias.forEach(shipVia => {
                if (this.selectedShipVia == shipVia.id) {
                    this.cart.shipVia = shipVia;
                }
            });
            //}
            var self = this;

            this.setBranchQuantity();

            var cartId = this.coreService.getQueryStringParameter("cartid", true);
            // TODO: Fix this - Ryan
            this.cartService.updateCart(this.cart).then(function () {
                //self.cartService.getCart(cartId);
            });


        }
    }

    angular
        .module("insite")
        .controller("SavedOrderDetailController", MorscoSavedOrderDetailController);
}