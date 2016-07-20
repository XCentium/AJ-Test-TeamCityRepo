module insite.cart {
	"use strict";

	export class MorscoSpecialOrderController {

		cart: CartModel;
		quantity: number;
        description: string;
        isValid = true;

		static $inject = [
			"cartService",
			"$scope",
			"$rootScope",
			"coreService",
			"specialOrderService",
            "websiteService",
            "spinnerService"
		];

		constructor(protected cartService: ICartService,
					protected $scope: ng.IScope,
					protected $rootScope: ng.IRootScopeService,
					protected coreService: core.ICoreService,
					protected specialOrderService: cart.ISpecialOrderService,
                    protected websiteService: websites.IWebsiteService,
                    protected spinnerService: core.ISpinnerService) {
			this.init();
		}

		init() {
            this.quantity = 1;
            $('#specialOrderForm').find('input[type="number"]').on('blur', function () {
                if ($(this).val() < 1) {
                    $(this).val($(this).attr('min'));
                }
            });
		}

		createSpecialOrder() {
			var qty = this.quantity;
			var desc = this.description;
            var self = this;
            if (this.description) {
                this.isValid = true;
                $('#specialOrderForm').foundation('reveal', 'close');
                this.spinnerService.show("mainLayout");

                this.specialOrderService.createSpecialOrder(qty.toString(), desc)
                    .success(function (data) {
                    self.coreService.displayModal("#popup-productaddedtocart");
                    self.cartService.getCart();

                    setTimeout(function () {
                        self.coreService.closeModal("#popup-productaddedtocart");
                    }, 3000);
                })
                    .error(function (error) {
                    self.$rootScope.$broadcast("showApiErrorPopup", { message: 'The requested special order product cannot be added to the cart.' });
                }).finally(function () {
                    self.description = "";
                    self.quantity = 1;
                });
            } else {
                this.isValid = false;
            }
		}

		cancelSpecialOrder() {
			$('#specialOrderForm').foundation('reveal', 'close');
			this.description = "";
			this.quantity = 1;
		}
	}

	angular
		.module("insite")
		.controller("MorscoSpecialOrderController", MorscoSpecialOrderController);
}
