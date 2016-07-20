// controller for the quickorder cms small widget

///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/angularjs/angular.d.ts"/>
///<reference path="../../App/catalog/insite.product.service.ts"/>
///<reference path="../../App/cart/insite.cart.service.ts"/>
///<reference path="../../typings/xlsx/xlsx.d.ts"/>
///<reference path="../../typings/papaparse/papaparse.d.ts"/>

module insite.quickorder {
    "use strict";

    export class MorscoOrderUploadSuccessPopupController {

        public static $inject = ["$scope", "productService", "cartService", "coreService", "spinnerService", "$window"];

        constructor(
            protected $scope: ng.IScope,
            protected productService: catalog.IProductService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService,
            protected $window: ng.IWindowService) {
        }

        goToCartFinally(url?: string) {
            this.spinnerService.show("mainLayout", false);
            this.$window.location.href = url;
        }

    }

    angular.module("insite")
        .controller("MorscoOrderUploadSuccessPopupController", MorscoOrderUploadSuccessPopupController);
}