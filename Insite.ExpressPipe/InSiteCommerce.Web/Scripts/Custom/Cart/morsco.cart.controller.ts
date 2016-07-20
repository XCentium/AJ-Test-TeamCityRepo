module insite.cart {
    "use strict";

    export class MorscoCartController extends CartController {
        selectedCarrierId: string;
        selectedShipVia: string;
        isInit: boolean;
        warehouses: {};
        defaultWarehouses: any = {};

        static $inject = [
            "$scope",
            "$window",
            "cartService",
            "promotionService",
            "productService",
            "coreService",
            "websiteService",
            "spinnerService"
        ];

        constructor(
            protected $scope: ICartScope,
            protected $window: ng.IWindowService,
            protected cartService: ICartService,
            protected promotionService: promotions.IPromotionService,
            protected productService: IProductService,
            protected coreService: core.ICoreService,
            protected websiteService: websites.IWebsiteService,
            protected spinnerService: core.ISpinnerService) {

            super($scope, $window, cartService, promotionService);
        }

        getCartCallback() {
            //var self = this;
            //if (self.cart.properties['defaultWarehouse']) {
            //    var warehouseList = self.cart.properties['defaultWarehouse'].split(',');    
            //}
            
            //var validShipVia = false;
            //self.cart.carrier = self.cart.carriers[1];
            //self.selectedCarrierId = self.cart.carrier.id.toString();
            //self.selectedShipVia = self.cart.shipVia.id.toString();

            //if (self.cart.properties["shipmethod"]) {
            //    self.selectedCarrierId = self.cart.properties["shipmethod"];
            //}



            //self.cart.carriers.forEach(carrier => {
            //    if (carrier.id == self.selectedCarrierId) {
            //        self.cart.carrier = carrier;
            //    }
            //    carrier.shipVias.forEach(shipVia => {
            //        if ((carrier.id.toString() == self.selectedCarrierId) &&
            //            (shipVia.id.toString() == self.selectedShipVia)) {
            //            validShipVia = true;
            //        }

            //        warehouseList.forEach(warehouse => {
            //            if (shipVia.id.toString() == warehouse) {
            //                self.defaultWarehouses[carrier.id.toString()] = shipVia.id.toString();
            //            }
            //        });
            //    });
            //});
            //if (! validShipVia) {
            //    self.cart.properties["shipvia"] = self.defaultWarehouses[self.selectedCarrierId];
            //    self.selectedShipVia = self.defaultWarehouses[self.selectedCarrierId];
            //}


            //$('#shippingMethod').val(self.selectedShipVia);
            //$('#shippingMethod-' + self.selectedCarrierId).val(self.selectedShipVia);
        }

        protected initEvents(): void {
            this.isInit = true;
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.cartSettings;
                this.showInventoryAvailability = data.productSettings.showInventoryAvailability;
                this.cartService.expand = "cartlines,costcodes";
                if (this.settings.showTaxAndShipping) {
                    this.cartService.expand += ",shipping,tax";
                }
                var self = this;
                this.cartService.getCart();
                
            });
            var self = this;
            this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                self.cart = cart;
                self.cart.carriers.forEach(car => {
                    if (self.cart.carrier.id == car.id) {
                        self.cart.carrier.shipVias = car.shipVias;
                    }
                });
                if (self.isInit == true) {
                    self.getCartCallback();
                    self.isInit = false;
                }
                if (self.cart.properties['warehouses']) {
                    self.warehouses = JSON.parse(self.cart.properties['warehouses']);
                }
                this.websiteService.getWebsite('current').success(function (website) {
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
                });   
                this.setBranchQuantity();
                this.promotionService.getCartPromotions("current").success((result: PromotionCollectionModel) => {
                    this.promotions = result.promotions;
                });
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

        shippingMethodChange() {
            this.spinnerService.show("mainLayout", true);
            this.selectedCarrierId = $('input[name=selectedCarrier]:checked').val();
            
            this.cart.properties["shipmethod"] = this.selectedCarrierId;

            this.cart.carriers.forEach(carrier => {
                if (carrier.id.toString() === this.selectedCarrierId) {
                    this.cart.carrier = carrier;
                }
            });
            this.selectedShipVia = this.defaultWarehouses[this.selectedCarrierId];
            this.setShipVia();
            $('#shippingMethod').val(this.cart.properties["shipvia"]);
        }

        setShipVia() {
            //this.spinnerService.show("mainLayout", true);
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
            this.cartService.updateCart(this.cart).then(function () {
                self.cartService.getCart("current");
                self.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                    self.spinnerService.hide("mainLayout");
                });
            });	
        }

        updateShipVia() {
            this.spinnerService.show("mainLayout", true);
            this.selectedShipVia = $('#shippingMethod-' + this.selectedCarrierId).val();
            this.setShipVia();
        }

        addToList() {
            var products: ProductDto[] = [];
            this.cart.cartLines.forEach(cartLine => {
                this.productService.getProductData("", cartLine.productId.toString()).then(result => {
                    result.product.qtyOrdered = cartLine.qtyOrdered;
                    products.push(result.product);
                });    
            });
            this.popupWishList(products);
        }

        popupWishList(products: ProductDto[]) {
            this.coreService.openWishListPopup(products);
        }
    }

    angular
        .module("insite")
        .controller("CartController", MorscoCartController);
}