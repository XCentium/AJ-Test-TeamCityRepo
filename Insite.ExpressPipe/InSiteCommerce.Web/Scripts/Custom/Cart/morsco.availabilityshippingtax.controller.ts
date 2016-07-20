module insite.catalog {
    "use strict";

    export class MorscoAvailabilityShippingTax {

        static $inject = [
            "coreService"
        ];

        constructor(
            protected coreService: core.ICoreService) {
        }

        openAvailabilityPopup() {
            this.coreService.displayModal("#popup-availability-shipping-tax");
        }
    };

    angular
        .module("insite")
        .controller("MorscoAvailabilityShippingTax", MorscoAvailabilityShippingTax);
}