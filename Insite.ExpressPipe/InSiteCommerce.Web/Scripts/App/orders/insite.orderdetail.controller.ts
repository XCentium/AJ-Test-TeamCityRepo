module insite.order {
    "use strict";

    export class OrderDetailController {

        order: OrderModel;
        orderNumber: string;
        allowCancellationRequest = false;
        canReorderItems = false;
        allowRma = false;
        btFormat: string;
        stFormat: string;
        validationMessage: string;
        showCancelationConfirmation = false;
        showInventoryAvailability = false;
        promotions: PromotionModel[];
        static $inject = ["$scope", "orderService", "cartService", "coreService", "promotionService"];

        constructor(
            protected $scope: ng.IScope,
            protected orderService: order.IOrderService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected promotionService: promotions.IPromotionService) {

            this.init();
        }

        init() {
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.allowCancellationRequest = data.orderSettings.allowCancellationRequest;
                this.canReorderItems = data.orderSettings.canReorderItems;
                this.allowRma = data.orderSettings.allowRma;
                this.showInventoryAvailability = data.productSettings.showInventoryAvailability;
            });
            this.orderNumber = this.coreService.getQueryStringParameter("orderNumber", true);
            if (typeof this.orderNumber === "undefined") {
                // handle "clean urls" 
                var pathArray = window.location.pathname.split("/");
                var pathOrderNumber = pathArray[pathArray.length - 1];
                if (pathOrderNumber !== "OrderHistoryDetail") {
                    this.orderNumber = pathOrderNumber;
                }
            }

            this.getOrder(this.orderNumber).then(result => {
                if (result.data.id) {
                    this.promotionService.getCartPromotions(result.data.id).success((result: PromotionCollectionModel) => {
                    this.promotions = result.promotions;
                });
                }
            });
            
        }

        /* mimics the functionality in the html helper extension */
        formatCityCommaStateZip(city: string, state: string, zip: string) {
            var formattedString = "";
            if (city) {
                formattedString += city;
            }
            if (city && state) {
                formattedString += ", " + state + " " + zip;
            }
            return formattedString;
        }

        getOrder(orderNumber: string) {
          return this.orderService.getOrder(orderNumber, "orderlines,shipments").success(data => {
                this.order = data;
                this.btFormat = this.formatCityCommaStateZip(this.order.billToCity, this.order.billToState, this.order.billToPostalCode);
                this.stFormat = this.formatCityCommaStateZip(this.order.shipToCity, this.order.shipToState, this.order.shipToPostalCode);
            }).error(error => {
                this.validationMessage = error.exceptionMessage;
            });
        }

        reorderProduct($event, line: OrderLineModel): void {
            $event.preventDefault();
            line.canAddToCart = false;
            var reorderItemsCount = 0;
            for (var i = 0; i < this.order.orderLines.length; i++) {
                if (this.order.orderLines[i].canAddToCart) {
                    reorderItemsCount++;
                }
            }
            this.canReorderItems = reorderItemsCount !== 0;
            this.cartService.addLine(this.convertToCartLine(line));
        }

        reorderAllProducts($event): void {
            $event.preventDefault();
            this.canReorderItems = false;
            var cartLines: CartLineModel[] = [];
            for (var i = 0; i < this.order.orderLines.length; i++) {
                if (this.order.orderLines[i].canAddToCart) {
                    cartLines.push(this.convertToCartLine(this.order.orderLines[i]));
                }
            }
            if (cartLines.length > 0) {
                this.cartService.addLineCollection(cartLines);
            }
        }

        cancelAndReorder($event): void {
            this.reorderAllProducts($event);
            this.cancelOrder($event);
        }

        cancelOrder($event): void {
            //call update order with cancelation status
            
            var updateOrderModel = <OrderModel><any>{ status: "CancellationRequested" };
            updateOrderModel.erpOrderNumber = this.orderNumber;

            this.orderService.updateOrder(this.orderNumber, updateOrderModel).success(data => {
                this.order.status = data.status;
                this.showCancelationConfirmation = true;
            }).error(error => {
                this.validationMessage = error.exceptionMessage;
            });
        }

        protected convertToCartLine(line: OrderLineModel): CartLineModel {
            var cartLine = <CartLineModel>{};
            cartLine.productId = line.productId;
            cartLine.qtyOrdered = line.qtyOrdered;
            cartLine.unitOfMeasure = line.unitOfMeasure;
            return cartLine;
        }
    }

    angular
        .module("insite")
        .controller("OrderDetailController", OrderDetailController);
}