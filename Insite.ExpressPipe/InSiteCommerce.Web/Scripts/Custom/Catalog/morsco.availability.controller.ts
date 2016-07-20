module insite.catalog {
    "use strict";

    export class MorscoAvailabilityPopupController {

        productAvailability: IProductAvailability;
        product: ProductDto;
        availability: {} = {};
        warehouses: {} = {};
        stockList: { [id: string]: any; } = {};

        static $inject = [
            "$scope",
            "coreService",
            "customProductService"
        ];

        constructor(protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected customProductService: catalog.ICustomProductService) {
            this.init();
        }

        init() {
            this.$scope.$on("availabilityLocationsPopupClicked",(event, message) => {
                this.customProductService.getAvailability().then(
                    (result: IProductAvailability) => {
                        this.productAvailability = result;
                        var branches = result.availability["StockList"];

                        for (var i = 0, emp; i < branches.length; i++) {
                            emp = branches[i];
                            this.stockList[emp.Branch] = emp.Stock_Qty;
                        }
                        this.availability = result.availability;
                        
                        this.warehouses = result.warehouses;
                    },
                    (error) => {
                    }
                );;

            });
        }

        openAvailabilityPopup() {
            this.coreService.displayModal("#popup-availability-shipping-tax");
        }

        showProductAvailabilityPopup(product: ProductDto, warehouses: {}) {
            this.customProductService.setAvailability(warehouses, product.properties['availability'], product);
            this.coreService.displayModal("#popup-availability");
        }
    };

    angular
        .module("insite")
        .controller("MorscoAvailabilityPopupController", MorscoAvailabilityPopupController);
}