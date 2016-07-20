module insite.catalog {
    "use strict";

    export class MorscoMinimumQtyController {

        qty = 0;
        minQty = 0;
        uom = '';

        static $inject = [
            "$scope",
            "coreService"
        ];

        constructor(protected $scope: ng.IScope,
            protected coreService: core.ICoreService) {
            this.init();
        }

        init() {
            //this.coreService.displayModal("#popup-min-qty");
            this.$scope.$on("ProductQtyChanged", (event, product: ProductDto) => {
                this.qty = product.qtyOrdered;
                this.minQty = parseInt(product.properties["minimumSellQty"]);
                this.uom = product.unitOfMeasureDisplay;
                this.showProductAvailabilityPopup();
            });
        }

        hideProductAvailabilityPopup() {
            this.coreService.closeModal("#popup-min-qty");
        }

        showProductAvailabilityPopup() {
            this.coreService.displayModal("#popup-min-qty");
        }
    };

    angular
        .module("insite")
        .controller("MorscoMinimumQtyController", MorscoMinimumQtyController);
}