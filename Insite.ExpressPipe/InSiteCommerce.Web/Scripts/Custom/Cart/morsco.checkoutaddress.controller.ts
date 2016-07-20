module insite.cart {
    "use strict";

    export class MorscoCheckoutAddressController extends CheckoutAddressController {

        shipPref: string;
		requestedDate: string;
		checkoutRequestedDeliveryTimes: any[];
		checkoutRequestedPickupTimes: any[];
		selectedDeliveryTime: string;
		selectedPickupTime: string;
		tomorrow: Date;

        constructor(
            protected $scope: ICartScope,
            protected $window: ng.IWindowService,
            protected cartService: ICartService,
            protected customerService: customers.ICustomerService,
            protected websiteService: websites.IWebsiteService,
            protected coreService: core.ICoreService,
			protected $rootScope: ng.IRootScopeService) {
            super($scope, $window, cartService, customerService, websiteService, coreService);
        }

        init() {



            this.tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

            this.cartId = this.coreService.getQueryStringParameter("cartId");
            this.shipPref = 'available';

            this.cartService.expand = "shiptos,validation,cartlines";

            this.cartService.getCart(this.cartId).then(cart => {

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

                this.cart = cart;

				if (this.cart.properties['deliveryMethod'] == 'Delivery') {
					this.checkoutRequestedDeliveryTimes = JSON.parse(this.cart.properties["checkoutRequestedDeliveryTimes"]);
					this.checkoutRequestedDeliveryTimes.forEach(deliveryTime => {
						if (deliveryTime.Default) this.selectedDeliveryTime = deliveryTime.Time;
					});
				} else {
					this.checkoutRequestedPickupTimes = JSON.parse(this.cart.properties["checkoutRequestedPickupTimes"]);
					this.checkoutRequestedPickupTimes.forEach(pickupTime => {
						if (pickupTime.Default) this.selectedPickupTime = pickupTime.Time;
					});
				}

                if (this.cart.properties['shipmentPreference']) {
                    this.shipPref = this.cart.properties['shipmentPreference'];
                }

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

					var self = this;
                    if (this.cart.properties["canChangeAddress"] && this.cart.properties["canChangeAddress"].toString().toLowerCase() == "true") {
						var createNew: any;
						for (var i = 0, len = this.shipTos.length; i < len; i++) {
							if (this.shipTos[i].label == "Create New") {
								createNew = this.shipTos[i];
								break;
							}
						}
						
						this.shipTos.forEach(shipTo => {
							if (shipTo.id == this.selectedShipTo.id) {
								this.shipTos = [];
								this.shipTos[0] = shipTo;
							}
						});
						this.shipTos.unshift(createNew);
                    } else if(this.cart.shipTo.customerSequence != ""){
						this.shipTos.forEach(shipTo => {
							if (shipTo.id == this.selectedShipTo.id) {
								this.shipTos = [];
								this.shipTos[0] = shipTo;
							}
						});
                    }

                    this.shipToChanged();

                    //update cart to get default shipmentRequestedDate saved
                    if (!this.cart.properties['shipmentRequestedDate'] ||
                        this.cart.properties['shipmentRequestedDate'] == '') {
                        this.cart.properties['shipmentRequestedDate'] = this.formatDate(this.tomorrow);
                        this.cartService.updateCart(this.cart);
                    }

					if (this.cart.properties['shipmentRequestedDate']) {
						var savedDate = new Date(this.cart.properties['shipmentRequestedDate']);

						if (savedDate < this.tomorrow) {
							this.cart.properties['shipmentRequestedDate'] = this.formatDate(this.tomorrow);
						} else {
							this.cart.properties['shipmentRequestedDate'] = savedDate.getMonth() + '/' + savedDate.getDate() + '/' + savedDate.getFullYear();
						}
					}

					

                });
            });

            if ($(window).width() > 960) {
                setTimeout(function () {
                    $('.summary').sticky({
                        topSpacing: 50,
                        bottomSpacing: $('#footer').outerHeight() + 20
                    });
                }, 250);
            }
        }

        changeShipPref(event) {
            this.shipPref = event.target.value;
            if (this.shipPref != 'date') {
                //delete this.cart.properties['shipmentRequestedDate'];
            } else {
                setTimeout(function () {
                    $('.datepicker').trigger('click');
                }, 100);
            }
        }

        continueCheckout(continueUri: string) {
            //setdirty to make the insite controller work properly on super
            this.$scope.addressForm.$setDirty();

            if (!this.cart.properties['shipmentRequestedDate'] ||
                this.cart.properties['shipmentRequestedDate'] == '') {
				$('.ship-date .error').show();
				return false;
            } else {
				$('.ship-date .error').hide();
			}

			if (this.cart.properties['deliveryMethod'] == 'Delivery') {
				if (this.selectedDeliveryTime == null) {
					this.selectedDeliveryTime = $('#RequestedDeliveryTimes').val();
				}
				this.cart.properties['selectedDeliveryTime'] = this.selectedDeliveryTime;

				if (this.cart.properties['selectedPickupTime']) {
					this.cart.properties['selectedPickupTime'] = '';
				}

			}

			if (this.cart.properties['deliveryMethod'] == 'Pickup') {

				if (this.selectedPickupTime == null) {
					this.selectedPickupTime = $('#RequestedPickupTimes').val();
				}

				this.cart.properties['selectedPickupTime'] = this.selectedPickupTime;

				if (this.cart.properties['selectedDeliveryTime']) {
					this.cart.properties['selectedDeliveryTime'] = '';
				}
			}
			            
            this.cart.properties['shipmentPreference'] = this.shipPref;
            super.continueCheckout(continueUri);
        }

        shipToChanged() {

            if (this.selectedShipTo.label !== "Create New") {
                this.selectedShipTo.validation.companyName.isDisabled = true;
                this.selectedShipTo.validation.address1.isDisabled = true;
                this.selectedShipTo.validation.address2.isDisabled = true;
                this.selectedShipTo.validation.city.isDisabled = true;
                this.selectedShipTo.validation.state.isDisabled = true;
                this.selectedShipTo.validation.postalCode.isDisabled = true;
                this.selectedShipTo.validation.phone.isDisabled = true;
                this.isReadOnly = true;
            }
            else {
               
                this.selectedShipTo.validation.companyName.isDisabled = false;
                this.selectedShipTo.validation.address1.isDisabled = false;
                this.selectedShipTo.validation.address2.isDisabled = false;
                this.selectedShipTo.validation.city.isDisabled = false;
                this.selectedShipTo.validation.state.isDisabled = false;
                this.selectedShipTo.validation.postalCode.isDisabled = false;
                this.selectedShipTo.validation.phone.isDisabled = false;
                this.selectedShipTo.country = this.countries[0];
                this.selectedShipTo.validation.phone.isRequired = false;
                this.isReadOnly = false;
            }
        }

        formatDate(date: Date) {
            return (date.getMonth() + 1).toString()
                    + '/' + date.getDate().toString()
                    + '/' + date.getFullYear().toString();
        }
    }
    angular
        .module("insite")
        .controller("CheckoutAddressController", MorscoCheckoutAddressController);
}
