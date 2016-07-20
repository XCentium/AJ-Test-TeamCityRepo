module insite.account {
    "use strict";

    export class MyAccountAddressController {

        billTo: BillToModel;
        countries: CountryModel[];
        shipTo: ShipToModel;
        isReadOnly = false;

        static $inject = ["$window", "customerService", "websiteService"];

        constructor(protected $window: ng.IWindowService,
            protected customerService: customers.ICustomerService,
            protected websiteService: websites.IWebsiteService){
            this.init();
        }

        init() {
            this.getBillTo();
        }

        save() {

            var valid = $("#addressForm").validate().form();
            if (!valid) {
                return;
            }

            this.customerService.updateBillTo(this.billTo).success(() => {
                if (this.shipTo.id !== this.billTo.id) {
                    var shipTo = this.shipTo;
                    if (this.shipTo["shipTos"]) {
                        /* In the situation the user selects the billTo as the shipTo we need to remove the shipTos collection
                           from the object to prevent a circular reference when serializing the object. See the unshift command below. */
                        angular.copy(this.shipTo, shipTo);
                        delete shipTo["shipTos"];
                    }

                    this.customerService.addOrUpdateShipTo(shipTo).success(result => {
                        if (this.shipTo.isNew) {
                            this.getBillTo(result);
                        }
                        (<any>angular.element("#saveSuccess")).foundation("reveal", "open");
                    });
                } else {
                    (<any>angular.element("#saveSuccess")).foundation("reveal", "open");
                }
            });
        }

        getBillTo(selectedShipTo?: ShipToModel) {
            this.customerService.getBillTo("shiptos,validation,country,state").success(result => {
                this.billTo = result;
                this.websiteService.getCountries("states").success(result => {
                    this.countries = result.countries;

                    this.setObjectToReference(this.countries, this.billTo, "country");
                    if (this.billTo.country) {
                        this.setObjectToReference(this.billTo.country.states, this.billTo, "state");
                    }

                    var shipTos = this.billTo.shipTos;

                    var shipToBillTo: ShipToModel;
                    shipTos.forEach(shipTo => {
                        this.setObjectToReference(this.countries, shipTo, "country");
                        if (shipTo.country) {
                            this.setObjectToReference(shipTo.country.states, shipTo, "state");
                        }
                        if (shipTo.id === this.billTo.id) {
                            shipToBillTo = shipTo;
                        }
                    });

                    // if allow ship to billing address, remove the billto returned in the shipTos array and put in the actual billto object
                    // so that updating one side updates the other side
                    if (shipToBillTo) {
                        this.billTo.label = shipToBillTo.label;
                        shipTos.splice(shipTos.indexOf(shipToBillTo), 1); // remove the billto that's in the shiptos array
                        shipTos.unshift(<ShipToModel><any>this.billTo); // add the actual billto to top of array
                    }

                    if (selectedShipTo) {
                        shipTos.forEach(shipTo => {
                            if (shipTo.id === selectedShipTo.id) {
                                this.shipTo = shipTo;
                            }
                        });
                    } else {
                        this.shipTo = shipTos[0];
                    }

                    if (this.shipTo && this.shipTo.id === this.billTo.id) {
                        // Don't allow editing the Bill To from the Ship To column.  Only allow
                        // editing of Bill To from the Bill To column. So, if ship to is the bill to change
                        // the ship to fields to readonly.
                        this.isReadOnly = true;
                    }
                });
            });
        }

        setObjectToReference(references, object, objectPropertyName) {
            references.forEach(reference => {
                if (object[objectPropertyName] && (reference.id === object[objectPropertyName].id)) {
                    object[objectPropertyName] = reference;
                }
            });
        }

        checkSelectedShipTo() {
            if (this.shipTo.id === this.billTo.id) {
                this.isReadOnly = true;
            } else {
                this.isReadOnly = false;
            }
        }
    }

    angular
        .module("insite")
        .controller("MyAccountAddressController", MyAccountAddressController);
}
