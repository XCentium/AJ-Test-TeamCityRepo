module insite.cart {
    "use strict";

    export class MorscoShippingController {
        selectedCarrier: any;
        selectedCarrierId: string;
        selectedShipVia: string;
        selectedShipViaId1: any;
        cart: CartModel;
        defaultWarehouses: any = {};

        quote: QuoteModel;
        cardList: any = {};
        selectedCard: any = {};
        redirectUrl: string = "";
        country: CountryModel;
        error: boolean = false;

        static $inject = [
            "$scope",
            "$rootScope",
            "cartService",
            "spinnerService",
            "specialOrderService",
            "websiteService"
        ];

        constructor(protected $scope: ng.IScope,
                    protected $rootScope: ng.IRootScopeService,
                    protected cartService: cart.ICartService,
                    protected spinnerService: core.ISpinnerService,
                    protected specialOrderService: cart.ISpecialOrderService,
                    protected websiteService: websites.IWebsiteService) {

            this.init();
        }

        init() {
            var self = this;
			if (self.cart.type != "Quote") {
				this.$scope.$on("cartLoaded", (event: ng.IAngularEvent, cart: CartModel, expand: string) => {
					self.cart = cart;
				});
			}
            var warehouseList = self.cart.properties['defaultWarehouse'].split(',');

            self.cart.carriers.forEach(carrier => {
                if (carrier.id == self.selectedCarrierId) {
                    self.cart.carrier = carrier;
                }
                carrier.shipVias.forEach(shipVia => {
                    if ((carrier.id.toString() == self.selectedCarrierId) &&
                        (shipVia.id.toString() == self.selectedShipVia)) {
                        validShipVia = true;
                    }

                    warehouseList.forEach(warehouse => {
                        if (shipVia.id.toString() == warehouse) {
                            self.defaultWarehouses[carrier.id.toString()] = shipVia.id.toString();
                        }
                    });
                });
            });
            var self = this;
            var validShipVia = false;
            if (!self.cart.carrier) {
                self.cart.carrier = self.cart.carriers[1];
            }
            self.selectedCarrier = self.cart.carrier;
            self.cart.properties["shipmethod"] = self.selectedCarrierId;
            self.selectedCarrierId = self.cart.carrier.id.toString();
            self.selectedShipVia = self.cart.shipVia.id.toString();

            if (self.cart.properties["shipmethod"]) {
                self.selectedCarrierId = self.cart.properties["shipmethod"];
            }

            $('#' + self.selectedCarrierId).val(self.selectedCarrierId);

            //this.selectedCarrierId = this.cart.carrier.id.toString();
            //this.selectedShipVia = this.cart.shipVia.id.toString();
        }

        shippingMethodChange() {
            this.spinnerService.show("mainLayout", true);
            this.selectedCarrierId = $('input[name=selectedCarrier]:checked').val();

            this.cart.properties["shipmethod"] = this.selectedCarrierId;

            this.cart.carriers.forEach(carrier => {
                if (carrier.id.toString() === this.selectedCarrierId) {
                    this.selectedCarrier = carrier
                    this.cart.carrier = carrier;
                }
            });
            this.selectedShipVia = this.defaultWarehouses[this.selectedCarrierId];
            this.setShipVia();
            //$('#shippingMethod').val(this.cart.properties["shipvia"]);
        }

        setShipVia() {
            this.spinnerService.show("mainLayout", true);
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

            // this.setBranchQuantity();
            if (this.cart.type != "Quote") {
                this.cartService.updateCart(this.cart)
                    .then(function() {
                        self.cartService.getCart("current");
                        self.$scope.$on("cartLoaded",
                        (event: ng.IAngularEvent, cart: CartModel, expand: string) => {
                            self.spinnerService.hide("mainLayout");
                        });
                    });
            } else {
                this.cart.properties["shipvia"] = this.selectedShipVia;
                this.cart.carrier.shipVias.forEach(shipVia => {
                    if (this.selectedShipVia == shipVia.id) {
                        this.cart.shipVia = shipVia;
                    }
                });
                //}
                var self = this;
                var params = {
                    quoteId: this.cart.id,
                    carrierId: this.cart.carrier.id.toString(),
                    shipViaId: this.cart.shipVia.id.toString(),
                };
                this.specialOrderService.updateQuote(params).then(function () {
                    self.cartService.getCart(self.cart.id);
                    self.$rootScope.$broadcast("getQuote", cart);
                });
            }
        }

        updateShipVia() {
            this.spinnerService.show("mainLayout", true);
            this.selectedShipVia = $('#shippingMethod').val();
            this.setShipVia();
        }


        parseQueryString(queryString: string) :any {
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

        
    }

    angular
        .module("insite")
        .controller("MorscoShippingController", MorscoShippingController)
        .filter('validShipVia', function () {
            return function (shipVias, cart, selectedCarrier) {
                var returnArray = [];
                if (!cart.properties['altWarehouse']) {
                    cart.properties['altWarehouse'] = '';
                }
                if (cart.properties['willCallCarrierId'] && cart.properties['willCallCarrierId'] != selectedCarrier.id) {
                    shipVias.forEach(function(shipVia) {
                        if (cart.properties['defaultWarehouse'].includes(shipVia.id) ||
                            cart.properties['altWarehouse'].includes(shipVia.id)) {
                            returnArray.push(shipVia);
                        }
                    });
                } else {
                    returnArray = shipVias;
                }
                return returnArray;
            };
        });
}
