module insite.wishlist {
    "use strict";

    export class MorscoWishListController  extends WishListController{
       
        attributeTypeArray = {}; 
        settings: ProductSettingsModel;
        settingsDeferred: ng.IDeferred<boolean>;
        warehouses: any = {};
        pageLoaded: boolean = false;

        static $inject = ["$scope", "coreService", "WishListService", "productService", "cartService", "paginationService", "customProductService", "spinnerService"];
        constructor(
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected wishListService: IWishListService,
            protected productService: catalog.IProductService,
            protected cartService: cart.ICartService,
            protected paginationService: core.IPaginationService,
            protected customProductService: catalog.ICustomProductService,
            protected spinnerService: core.ISpinnerService) {

            super($scope, coreService, wishListService, productService, cartService, paginationService);
        }

        init() {
            //this.settingsDeferred = this.$q.defer();

            this.getWishListCollection();

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.productSettings = data.productSettings;
                this.wishListSettings = data.wishListSettings;
            });
            /*
            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.productSettings;
                this.settingsDeferred.resolve(true);
            });
            */
        }

        getUrlVars() {
            var parms = {};
            var temp;
            var querystring = window.location.hash.slice(1);
            var items = querystring.slice(1).split("&");   // remove leading ? and split
            for (var i = 0; i < items.length; i++) {
                temp = items[i].split("=");
                if (temp[0]) {
                    if (temp.length < 2) {
                        temp.push("");
                    }
                    parms[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
                }
            }
            return (parms);
        }


        download() {
            var csv = '';
            csv = "Part#" + "," + "CustomerPart#" + "," + "UPC#" + "," + "Mfr Name" + "," + "Mfr Item" + "," + "Description" + "," + "Quantity" + "," + "Price" + "," + "UOM" + "\n";
            this.selectedWishList.wishListLineCollection.forEach(function (line) {
				var customerPartNumber = (line.properties['sku'] ? line.properties['sku'] : '');
				if (line.properties['sku'] == line.manufacturerItem) {
					customerPartNumber = "";
				}

				var csvLine = '"' + line.erpNumber + '\t"' + "," +
                    '"' + customerPartNumber + '\t"' + "," +
                    '"' + (line.properties['upcCode'] ? line.properties['upcCode'] : '') + '\t"' + "," +
                    '"' + (line.properties['manufacturerName'] ? line.properties['manufacturerName'] : '') + '\t"' + "," +
                    '"' + (line.manufacturerItem ? line.manufacturerItem : '') + '\t"' + "," +
                    '"' + line.shortDescription + '\t"' + "," + 
                    '"' + line.qtyOrdered + ' "' + "," +
                    '"' + line.pricing.actualPriceDisplay + '"' + "," +
                    '"' + line.unitOfMeasure + '"' + "\n";
                csv += csvLine;
            });
            var blob = new Blob([csv], {
                type: "text/csv",
            });
            saveAs(blob, this.selectedWishList.name + ".csv");
            var wlItems = this.selectedWishList;
        }

        mapData(data: any): void {
			if (data.properties["warehouses"]) {
                this.warehouses = JSON.parse(data.properties["warehouses"]);
            }

            this.wishListCount = data.wishListCollection.length;
            if (this.wishListCount > 0) {
                this.wishListCollection = data.wishListCollection;

                var wishListId = '';
				var queryStringHash = this.getUrlVars();
				if (queryStringHash['wishListId']) {
					wishListId = queryStringHash['wishListId'];
				}

                if (wishListId.length > 0) {
                    this.selectedWishList = this.wishListCollection.filter(x => x.id === wishListId)[0];
                } else {
                    this.selectedWishList = this.wishListCollection[0];
                }

                this.getSelectedWishListDetails();
            }
        }

        getSelectedWishListDetails(): void {
			var baseUrl = window.location.href.split('#')[0];
			window.location.replace(baseUrl + '#/&wishListId=' + this.selectedWishList.id);

            this.selectedWishList.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey, this.selectedWishList.pagination);
            this.wishListService.getWishListDetails(this.selectedWishList).success((result: WishListModel) => {
                var self = this;
                angular.forEach(result.wishListLineCollection, function (item) {
                    self.updateProperties(item);
                });
                this.selectedWishList = result;
                this.pageLoaded = true;
            });
        }

        updateProperties(line: WishListLineModel) {
            var product: ProductDto;
            //var expandParameter = ["documents", "specifications", "styledproducts", "htmlcontent", "attributes", "crosssells", "pricing"];
            var expandParameter = ["attributes", "pricing"];
            this.productService.getProductData(null, line.productId.toString(), expandParameter).then(result => {
                var self = this;
                angular.forEach(result.product.properties, function (value, key) {
                    self.setProperties(line, key, value);
                });
                if (result.product.sku) {
                    line.properties['sku'] = result.product.sku;
                }
                if (result.product.sku) {
                    line.properties['upcCode'] = result.product.upcCode;
                }
                // For some reason UOM is not filled on wl line.
                var availability = JSON.parse(result.product.properties["availability"]);
                line.properties['qtyOnHand'] = availability.StockQty;
                if (availability.StockQty > 0) {
                    line.availability['messageType'] = 1;
                    line.availability['message'] = "In Stock";
                }
                line.unitOfMeasure = result.product.unitOfMeasure;
                this.attributeTypeArray[line.id.toString()] = result.product.attributeTypes;

                setTimeout(function () {
                    $(document).foundation('tooltip', 'reflow');
                }, 500);
            });
        }

        getAttributes(lineId: string) {
            return this.attributeTypeArray[lineId];
        }

        setProperties(line, key, value) {
            line.properties[key] = value;
        }

        showProductAvailabilityPopup(product: ProductDto, warehouses: {}) {
            this.customProductService.setAvailability(warehouses, product.properties['availability'], product);
            this.coreService.displayModal("#popup-availability");
        }

        deleteLine(line: WishListLineModel): void {
            this.spinnerService.show("mainLayout");
            super.deleteLine(line);
        }

		deleteConfirmationPopup() {
			$('#deleteListConfirmation').foundation('reveal', 'open');
        }

        quantityKeyPress(line: WishListLineModel): void {
            this.updateQty(line);
        }

        updateQty(product) {
            if (product.properties['minimumSellQty'] && !this.isInt(product.qtyOrdered / parseInt(product.properties['minimumSellQty']))) {
                var qty = Math.ceil(product.qtyOrdered / parseInt(product.properties['minimumSellQty']));
                product.qtyOrdered = qty * parseInt(product.properties['minimumSellQty']);
                this.$scope.$broadcast("ProductQtyChanged", product);
            }
            this.updateLine(product);
        }

        isInt(n) {
            return n % 1 === 0;
        }

    }

    angular
        .module("insite")
        .controller("WishListController", MorscoWishListController);
}