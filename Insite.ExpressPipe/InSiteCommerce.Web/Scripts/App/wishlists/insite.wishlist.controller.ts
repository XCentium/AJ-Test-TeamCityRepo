module insite.wishlist {
    "use strict";

    export class WishListController {
        wishListCount: number;
        wishListCollection: WishListModel[] = [];
        selectedWishList: WishListModel;
        paginationStorageKey = "DefaultPagination-WishList";
        productSettings: ProductSettingsModel;
        wishListSettings: WishListSettingsModel;

        static $inject = ["$scope", "coreService", "WishListService", "productService", "cartService", "paginationService"];
        constructor(
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected wishListService: IWishListService,
            protected productService: catalog.IProductService,
            protected cartService: cart.ICartService,
            protected paginationService: core.IPaginationService) {

            this.init();
        }

        init() {
            this.getWishListCollection();

            this.$scope.$on("settingsLoaded",(event, data) => {

                this.productSettings = data.productSettings;
                this.wishListSettings = data.wishListSettings;
            });
        }

        mapData(data: any): void {
            this.wishListCount = data.wishListCollection.length;
            if (this.wishListCount > 0) {
                this.wishListCollection = data.wishListCollection;

                var wishListId = this.coreService.getQueryStringParameter("wishListId");

                if (wishListId.length > 0) {
                    this.selectedWishList = this.wishListCollection.filter(x => x.id === wishListId)[0];
                } else {
                    this.selectedWishList = this.wishListCollection[0];
                }

                this.getSelectedWishListDetails();
            }
        }

        getWishListCollection(): void {
            this.wishListService.getWishListCollection().then((result) => {
                this.mapData(result);
            });
        }

        getSelectedWishListDetails(): void {
            this.selectedWishList.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey, this.selectedWishList.pagination);

            this.wishListService.getWishListDetails(this.selectedWishList).success((result: WishListModel) => {
                this.selectedWishList = result;
            });
        }

        deleteWishList(): void {
            this.wishListService.deleteWishList(this.selectedWishList).then(() => {
                this.coreService.displayModal(angular.element("#popup-deletewishlist"));
                this.getWishListCollection();
            });
        }

        deleteLine(line: WishListLineModel): void {
            this.wishListService.deleteLine(line).then(() => {
                this.getSelectedWishListDetails();
            });
        }

        updateLine(line: WishListLineModel): void {
            if (line.qtyOrdered === 0) {
                this.deleteLine(line);
            } else {
                this.wishListService.patchLine(line).then(() => {
                    var sameProductLines = this.selectedWishList.wishListLineCollection.filter((wl: WishListLineModel) => {
                        return wl.productId === line.productId;
                    });
                    if (sameProductLines.length > 1) {
                        this.getSelectedWishListDetails();
                    }
                });
            }
        }

        quantityKeyPress(line: WishListLineModel): void {
            this.updateLine(line);
        }

        addLineToCart(line: any): void {
            this.cartService.addLine(line);
        }

        addAllToCart(): void {
            this.cartService.addLineCollection(this.selectedWishList.wishListLineCollection);
        }

        allQtysIsValid() {
            if (!this.selectedWishList || !this.selectedWishList.wishListLineCollection) {
                return false;
            }

            return this.selectedWishList.wishListLineCollection.every((wishListLine: WishListLineModel) => {
                return wishListLine.qtyOrdered && parseFloat(wishListLine.qtyOrdered.toString()) > 0;
            });
        }

        changeUnitOfMeasure(line: WishListLineModel): void {
            var product = this.mapWishlistLineToProduct(line);
            product = this.productService.changeUnitOfMeasure(product, false);
            line = this.mapProductToWishlistLine(product, line);
            if (!product.quoteRequired) {
                this.productService.getProductPrice(product).then(result => {
                    line.pricing = result;
                });
            }
            this.updateLine(line);
        }

        protected mapProductToWishlistLine(product: ProductDto, line: WishListLineModel): WishListLineModel {
            line.productUnitOfMeasures = product.productUnitOfMeasures;
            line.unitOfMeasureDisplay = product.unitOfMeasureDisplay;
            line.unitOfMeasure = product.unitOfMeasure;
            line.canShowUnitOfMeasure = product.canShowUnitOfMeasure;
            line.selectedUnitOfMeasure = product.selectedUnitOfMeasure;
            return line;
        }

        protected mapWishlistLineToProduct(line: WishListLineModel): ProductDto {
            return <ProductDto>{
                id: line.productId,
                productUnitOfMeasures: line.productUnitOfMeasures,
                unitOfMeasure: line.unitOfMeasure,
                selectedUnitOfMeasure: line.selectedUnitOfMeasure,
                quoteRequired: line.quoteRequired,
            };
        }
    }

    angular
        .module("insite")
        .controller("WishListController", WishListController);
}