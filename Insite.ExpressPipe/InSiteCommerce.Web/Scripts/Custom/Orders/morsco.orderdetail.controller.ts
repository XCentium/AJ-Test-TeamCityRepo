module insite.order {
    "use strict";

    interface KeyValuePair<T> {
        key: string;
        value: T;
    }

    export class morscoOrderDetailController extends OrderDetailController {

        static $inject = ["$scope", "orderService", "cartService", "coreService", "promotionService", "sessionService", "invoiceService", "productService", "spinnerService", "$rootScope"];

        constructor(
            protected $scope: ng.IScope,
            protected orderService: order.IOrderService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
			protected promotionService: promotions.IPromotionService,
			protected sessionService: ISessionService,
            protected invoiceService: invoice.IMorscoInvoiceService,
            protected productService: IProductService,
            protected spinnerService: core.SpinnerService,
            protected $rootScope: ng.IScope) {

			super($scope, orderService, cartService, coreService, promotionService);
        }

		init() {
            this.$scope.$on("settingsLoaded", (event, data) => {
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

            this.getOrder(this.orderNumber).then(result => { });

            if ($(window).width() > 960) {
                setTimeout(function () {
                    $('.summary').sticky({
                        topSpacing: 50,
                        bottomSpacing: $('#footer').outerHeight() + 20
                    });
                }, 250);
            }
        }

        getOrder(orderNumber: string) {
            var self = this;
            return this.orderService.getOrder(orderNumber, "orderlines").success(data => {
                self.order = data;
                self.getOrderLines(self.order.erpOrderNumber);
                self.order.erpOrderNumber = (data.status != "Invoiced" && data.erpOrderNumber != null && data.erpOrderNumber.indexOf(".") > 0)
                    ? data.erpOrderNumber.substring(0, data.erpOrderNumber.indexOf("."))
                    : data.erpOrderNumber;
				self.getBillTrustInvoiceFromDetailLink();
                self.btFormat = self.formatCityCommaStateZip(self.order.billToCity, self.order.billToState, self.order.billToPostalCode);
                self.stFormat = self.formatCityCommaStateZip(self.order.shipToCity, self.order.shipToState, self.order.shipToPostalCode);

				self.order.properties["orderSalesHistoryType"] = self.order.erpOrderNumber.substring(0, 2);

            }).error(error => {
                self.validationMessage = error.exceptionMessage;
            });
        }

        isParentOrder() {
            if (this.order != null && this.order.erpOrderNumber != null) {
                return this.order.erpOrderNumber.indexOf(".") < 0;   // If there is a '.' in the orderNumber, this is not a parent order.
            } else {
                return false;
            }
        }

        getOrderLines(orderid: string) {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            var genid = vars['genid'];

            if (genid == null) {
                var self = this;

                var url = "/api/morsco/History/GetOrderHistoryLines?erpOrderNumber=" + orderid;
                $.getJSON(url, function (data) {
                    var jsonObjectArray = $.parseJSON(data);
                    var row = angular.element(document.querySelector('#tblOrderItems'));
                    var newRow;
                    var shipDate;
                    var numOfShipments;
                    var trackingNumber;
                    var rowCnt = 0;

                    $.each(jsonObjectArray, function (i, obj) {
                        var documents: KeyValuePair<string>[] = [];
                        self.order.orderLines.forEach(function (orderLine) {
                            if (orderLine.productErpNumber == obj.ProductERPNumber)
                            {
                                self.updateQty(orderLine, true);
                                orderLine["brand"] = obj.Brand;
                                if (obj.MSDS) {
                                    documents.push({ key: 'MSDS', value: obj.MSDS });
                                }
                                if (obj.Catalog) {
                                    documents.push({ key: 'Catalog', value: obj.Catalog });
                                }
                                if (obj.Specifications) {
                                    documents.push({ key: 'Specifications', value: obj.Specifications });
                                }
                                if (obj.Installation) {
                                    documents.push({ key: 'Installation', value: obj.Installation });
                                }
                                //orderLine['documents'] = documents;
                                // probably not the best way
                                documents.forEach(function (document) {
                                    $('#order' + orderLine.productErpNumber).find('ul.documents').append('<li><a href="' + document.value + '" title="' + document.key + '" target="_blank"><i class="epicon epicon-' + document.key + '"></i><em class="hide">' + document.key + '</em></a></li>');
                                });
                            }
                        });

                        //shipDate = obj.ShipmentDate;
                        numOfShipments = obj.NumOfShipments;
                        trackingNumber = obj.FirstTrackingNumber;
                        rowCnt = rowCnt + 1;
                    });
                
                    if (rowCnt > 0) {
                        angular.element(document.querySelector('#orderLines')).removeClass('hide');
                    }

                    //Update the shipDate in the Order Detail section
                    //var shipDateLabel = angular.element(document.querySelector('#shipDate'));
                    //if (numOfShipments > 1) {
                    //    shipDateLabel.html("Multiple(" + numOfShipments + ")");
                    //}
                    //else {
                    //    shipDateLabel.html(shipDate);
                    //}


                    //tracking number
                    var trackingNumberLabel = angular.element(document.querySelector('#TrackingNumber'));
                    trackingNumberLabel.html(trackingNumber);
                });
            }
        }

		getBillTrustInvoiceFromDetailLink() {
            var selectedInvoices = [];
			var invoiceDate = new Date(this.order.properties['invoiceDate']);
			var compareDate = new Date(this.order.properties['earliestBilltrustInvoices']);
			var today = new Date();
			var yesturday = new Date();
			yesturday.setDate(today.getDate() - 1);

			if (invoiceDate && compareDate) {
				if (invoiceDate > compareDate && invoiceDate < yesturday) {
					selectedInvoices.push(this.order.erpOrderNumber);
				}
			}
            if (selectedInvoices.length > 0) {
                this.sessionService.getSession().then((result: SessionModel) => {
                    this.invoiceService.getInvoicePdfUrl(result.billTo.customerNumber, selectedInvoices).success(data => {
                        this.order.properties['invoiceUrl'] = data;
                        setTimeout(function () {
                            $(document).foundation('tooltip', 'reflow');
                        }, 500);
                    }).error(error => {
                        this.validationMessage = error.exceptionMessage;
                    });
                });
            }
        }

        openWishListPopup(productId: string, qty: number) {
            this.productService.getProductData("", productId).then(result => {
                result.product.qtyOrdered = qty;
                this.popupWishListSingleItem(result.product);
            });
        }

        popupWishListSingleItem(product: ProductDto) {
            var products: ProductDto[] = [];
            products.push(product);
            this.coreService.openWishListPopup(products);
        }

        popupWishList(products: ProductDto[]) {
            this.coreService.openWishListPopup(products);
        }

        addAllToList() {
            var products: ProductDto[] = [];
            this.order.orderLines.forEach(cartLine => {
                this.productService.getProductData("", cartLine.productId.toString()).then(result => {
                    result.product.qtyOrdered = cartLine.qtyOrdered;
                    products.push(result.product);
                });
            });
            this.popupWishList(products);
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
            var cartLine = this.convertToCartLine(line);
            cartLine.qtyOrdered = $('#qty-' + line.id).val();
            this.cartService.addLine(cartLine);
        }

        reorderAllProducts($event): void {
            $event.preventDefault();
            this.spinnerService.show("mainLayout");
            this.canReorderItems = false;
            var cartLines: CartLineModel[] = [];
            for (var i = 0; i < this.order.orderLines.length; i++) {
                if (this.order.orderLines[i].canAddToCart) {
                    var cartLine = this.convertToCartLine(this.order.orderLines[i]);
                    cartLine.qtyOrdered = $('#qty-' + this.order.orderLines[i].id).val();
                    cartLines.push(cartLine);
                }
            }
            if (cartLines.length > 0) {
                this.cartService.addLineCollection(cartLines);
            }
        }

        updateQty(product, hidePopup) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                if (!hidePopup) {
                    this.$rootScope.$broadcast("ProductQtyChanged", product);
                }
            }
        }

        isInt(n) {
            return n % 1 === 0;
        }

        formatDate(date: string) {
            var dateOut = new Date(date);
            return dateOut;
        }
    }

    angular
        .module("insite")
        .controller("OrderDetailController", morscoOrderDetailController);
}