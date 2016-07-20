import CountryModel = Insite.Websites.WebApi.V1.ApiModels.CountryModel;

module insite.cart {
    "use strict";

    export class CheckoutAddressController {

        cart: CartModel;
        cartId: string;
        countries: CountryModel[];
        selectedShipTo: ShipToModel;
        shipTos: ShipToModel[];
        continueCheckoutInProgress = false;
        isReadOnly = false;

        static $inject = [
            "$scope",
            "$window",
            "cartService",
            "customerService",
            "websiteService",
            "coreService"
        ];

        constructor(
            protected $scope: ICartScope,
            protected $window: ng.IWindowService,
            protected cartService: ICartService,
            protected customerService: customers.ICustomerService,
            protected websiteService: websites.IWebsiteService,
            protected coreService: core.ICoreService)
        {
            this.init();
        }

        init() {
            this.cartId = this.coreService.getQueryStringParameter("cartId");

            this.cartService.expand = "shiptos,validation";

            this.cartService.getCart(this.cartId).then(cart => {

                this.cart = cart;

                this.websiteService.getCountries("states").success(result => {

                    this.countries = result.countries;

                    var billTo = this.cart.billTo;
                    this.setObjectToReference(this.countries, billTo, "country");
                    if (billTo.country) {
                        this.setObjectToReference(billTo.country.states, billTo, "state");
                    }
                    this.shipTos = angular.copy(billTo.shipTos);

                    var shipToBillTo: ShipToModel;
                    this.shipTos.forEach(shipTo => {
                        if (shipTo.country && shipTo.country.states) {
                            this.setObjectToReference(this.countries, shipTo, "country");
                            this.setObjectToReference(shipTo.country.states, shipTo, "state");
                        }

                        if (shipTo.id === billTo.id) {
                            shipToBillTo = shipTo;
                        }
                    });
                    this.selectedShipTo = this.cart.shipTo;
                    
                    // if allow ship to billing address, remove the billto returned in the shipTos array and put in the actual billto object
                    // so that updating one side updates the other side
                    if (shipToBillTo) {
                        billTo.label = shipToBillTo.label;
                        this.shipTos.splice(this.shipTos.indexOf(shipToBillTo), 1); // remove the billto that's in the shiptos array
                        this.shipTos.unshift(<ShipToModel><any>billTo); // add the actual billto to top of array
                    }

                    this.shipTos.forEach(shipTo => {
                        if (this.cart.shipTo && shipTo.id === this.cart.shipTo.id || !this.selectedShipTo && shipTo.isNew) {
                            this.selectedShipTo = shipTo;
                        }
                    });

                    if (this.selectedShipTo && this.selectedShipTo.id === billTo.id) {
                        // Don't allow editing the Bill To from the Ship To column.  Only allow
                        // editing of Bill To from the Bill To column. So, if ship to is the bill to change
                        // the ship to fields to readonly.
                        this.isReadOnly = true;
                    }
                });
            });
        }

        checkSelectedShipTo() {
            if (this.selectedShipTo.id === this.cart.billTo.id) {
                this.isReadOnly = true;
            } else {
                this.isReadOnly = false;
            }
        }
    
        continueCheckout(continueUri: string) {
            var valid = $("#addressForm").validate().form();
            if (!valid) {
                return;
            }

            this.continueCheckoutInProgress = true;

            if (this.cartId) {
                continueUri += "?cartId=" + this.cartId;
            }

            if (this.$scope.addressForm.$pristine) {
                this.$window.location.href = continueUri;
                return;
            }

            // if the ship to has been changed, set the shipvia to null so it isn't set to a ship via that is no longer valid
            if (this.cart.shipTo && this.cart.shipTo.id !== this.selectedShipTo.id) {
                this.cart.shipVia = null;
            }

            this.customerService.updateBillTo(this.cart.billTo).success(() => {
                var shipToMatches = this.cart.billTo.shipTos.filter(shipTo => { return shipTo.id === this.selectedShipTo.id; });
                if (shipToMatches.length === 1) {
                    this.cart.shipTo = this.selectedShipTo;
                }

                if (this.cart.shipTo.id !== this.cart.billTo.id) {
                    this.customerService.addOrUpdateShipTo(this.cart.shipTo).success((shipTo: ShipToModel) => {
                        if (this.cart.shipTo.isNew) {
                            this.cart.shipTo = shipTo;
                        }

                        this.updateCart(this.cart, continueUri);
                    }).error(() => {
                        this.continueCheckoutInProgress = false;
                    });
                } else {
                    this.updateCart(this.cart, continueUri);
                }
            }).error(() => {
                this.continueCheckoutInProgress = false;
            });
        }

        setObjectToReference(references, object, objectPropertyName) {
            references.forEach(reference => {
                if (object[objectPropertyName] && reference.id === object[objectPropertyName].id) {
                    object[objectPropertyName] = reference;
                }
            });
        }

        updateCart(cart: CartModel, continueUri: string) {
            this.cartService.updateCart(cart).then(() => {
                this.$window.location.href = continueUri;
            }, () => {
                this.continueCheckoutInProgress = false;
            });
        }
    }

    angular
        .module("insite")
        .controller("CheckoutAddressController", CheckoutAddressController);
}
