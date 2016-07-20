﻿module insite.quickorder {
    "use strict";

    enum MorscoUploadError {
        None,
        NotEnough,
        ConfigurableProduct,
        StyledProduct,
        Unavailable,
        InvalidUnit,
        NotFound,
        OutOfStock
    }

    export class MorscoOrderUploadController extends OrderUploadController {
        productPreProcessed: number;
        specialOrderProductCount: number = 0;
        specialOrderProducts: any[] = null;

        public static $inject = ["$scope", "productService", "cartService", "coreService", "spinnerService", "bulkUploadService", "specialOrderService", "$q"];

        constructor(
            protected $scope: ng.IScope,
            protected productService: catalog.IProductService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService,
            protected bulkUploadService: quickorder.IBulkUploadService,
            protected specialOrderService: cart.ISpecialOrderService,
            protected $q: ng.IQService) {

            super($scope, productService, cartService, coreService);
        }

        fileChange(): void {
            $('#hiddenFileUpload').val(null).click();
        }

        continueToCart(popupSelector?: string): void {
            if (popupSelector) {
                $('#orderUploadingPopup .progress .meter').width('0');
                this.coreService.closeModal(popupSelector);
            }

            this.allowCancel = false;
            setTimeout(() => {
                this.coreService.displayModal(angular.element("#orderUploadingPopup"));

                setTimeout(() => {
                    $('#orderUploadingPopup .progress .meter').addClass('delay');
                    $('#orderUploadingPopup .progress .meter').width('75%');
                }, 1000);

            }, 250);
            this.specialOrderService.createMultipleSpecialOrder(this.specialOrderProducts).then(() => {
                this.cartService.addLineCollectionFromProducts(this.products).then(() => {
                    this.coreService.closeModal("#orderUploadingPopup");
                    this.uploadedItemsCount = this.products.length + this.specialOrderProductCount;
                    setTimeout(() => {
                        this.showOrderUploadSuccessPopup();
                        this.morscoCleanupUploadData();
                    }, 250);
                });
            });
        }

        public uploadFile() {
            this.spinnerService.show("mainLayout", false);

            this.uploadCancelled = false;

            var f = this.file;
            var reader = new FileReader();
            var fileExtention = this.morscoGetFileExtention(f.name);

            reader.onload = (e) => {
                var data = e.target["result"];
                var arr = this.fixdata(data);
                try {
                    if (fileExtention === "xls" || fileExtention === "xlsx") {
                        var wb = this.XLSX.read(btoa(arr), { type: "base64" });
                        if (wb) {
                            this.processWb(wb);
                        }
                    }
                    else if (fileExtention === "csv") {
                        this.processCsv(arr);
                    }
                    else {
                        this.badFile = true;
                    }
                }
                catch (error) {
                    this.badFile = true;
                    this.spinnerService.hide("mainLayout");
                }

                if (!this.badFile && !this.uploadLimitExceeded) {
                    this.allowCancel = true;
                    $('#orderUploadingPopup .progress .meter').removeClass('delay');
                    this.coreService.displayModal(angular.element("#orderUploadingPopup"));
                }
                else {
                    this.$scope.$apply();
                    this.spinnerService.hide("mainLayout");
                }
            };
            reader.readAsArrayBuffer(f);
        }

        processWb(wb): void {
            this.bulkSearch = [];
            wb.SheetNames.forEach((sheetName) => {
                var opts = { header: 1 };
                var roa = this.XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName], opts);
                if (roa.length > 0) {
                    if (this.firstRowHeading) {
                        roa = roa.slice(1, roa.length);
                    }
                    roa = roa.filter(r => { return r[0] != null && r[0].length > 0; });
                    if (this.morscoLimitExceeded(roa.length)) {
                        return;
                    }

                    this.bulkSearch = roa.map(r => {
                        var obj = { PartNumber: r[0], Description: r[1], MfrName: r[2], Qty: r[3] };
                        if (obj.Qty && obj.Qty > 0) {
                            return obj;
                        } else {
                            return;
                        }
                    }).filter(function (x) {
                        return typeof x !== 'undefined';
                    });;
                }
            });
            this.bulkSearchProducts();
        }

        processCsv(data: string): void {
            this.bulkSearch = [];
            var newLineIndex = data.lastIndexOf("\r\n");
            if (newLineIndex + 2 === data.length) {
                data = data.substr(0, newLineIndex);
            }
            var results = Papa.parse(data);
            if (results.errors.length > 0) {
                this.badFile = true;
                return;
            }
            var rows = results.data;
            if (this.firstRowHeading) {
                rows = rows.slice(1, rows.length);
            }
            if (this.morscoLimitExceeded(rows.length)) {
                return;
            }
            rows.forEach((s) => {
                var objectToAdd = {};
                objectToAdd["PartNumber"] = s[0];
                if (s[1]) {
                    objectToAdd["Description"] = s[1];
                }
                if (s[2]) {
                    objectToAdd["MfrName"] = s[2];
                }
                if (s[3]) {
                    objectToAdd["Qty"] = s[3];
                } else {
                    objectToAdd["Qty"] = 0;
                }
                if (objectToAdd['Qty'] > 0 && (objectToAdd["PartNumber"] || objectToAdd["Description"])) {
                    this.bulkSearch.push(objectToAdd);
                }
            });
            this.bulkSearchProducts();
        }

        bulkSearchProducts(): void {
            this.productRequests = [];
            this.errorProducts = [];
            this.products = [];
            this.totalProductToProcess = this.bulkSearch.length;
            this.productProcessed = 0;
            this.specialOrderProducts = [];
            if (this.bulkSearch.length > 0) {
                this.bulkSearch.forEach((item, i) => {
                    var index = i + (this.firstRowHeading ? 2 : 1);
                    var parameter: catalog.IProductCollectionParameters = <any>{ extendedNames: [item.Name] };
                    var expandParameter = ["pricing"];
                    var self = this;
                    this.bulkUploadService.getBulkUploadProduct(item.PartNumber, item.Description, item.Qty)
                        .success(function (result) {
                            if (self.uploadCancelled) {
                                return;
                            }

                            var products = result.products;
                            if (products.length === 1) {
                                var product = products[0];
                                var error = self.morscoValidateProduct(product);
                                if (error === MorscoUploadError.None) {
                                    var errorProduct;
                                    var isErrorProdut: boolean = false;
									product.qtyOrdered = !item.Qty ? 1 : item.Qty;

									if (product.properties["minimumSellQty"] && parseInt(product.properties["minimumSellQty"]) > 1) {
										var intMinSellQty = parseInt(product.properties["minimumSellQty"]);
										var remainder = item.Qty % intMinSellQty;
										if (remainder != 0) {
											product.qtyOrdered = Math.ceil(item.Qty / intMinSellQty) * intMinSellQty;
										}
									}

                                    if (product.productUnitOfMeasures.some(u => u.unitOfMeasureDisplay === item.UM)) {
                                        var um = product.productUnitOfMeasures.filter(u => u.unitOfMeasure === item.UM)[0];
                                        product.selectedUnitOfMeasure = um.unitOfMeasure;
                                        product.selectedUnitOfMeasureDisplay = um.unitOfMeasureDisplay;
                                        product.unitOfMeasure = um.unitOfMeasure;
                                        product.unitOfMeasureDisplay = um.unitOfMeasureDisplay;
                                    }
                                    else if (item.UM) {
                                        errorProduct = self.morscoMapProductErrorInfo(index, MorscoUploadError.InvalidUnit, item.Name, product);
                                        errorProduct.umRequested = item.UM;
                                        self.errorProducts.push(errorProduct);
                                        isErrorProdut = true;
                                    }

                                    if (!isErrorProdut) {
                                        var baseUnits = product.productUnitOfMeasures.filter(u => u.isDefault)[0];
                                        var currentUnits = product.productUnitOfMeasures.filter(u => u.unitOfMeasure === product.unitOfMeasure)[0];
                                        if (!product.canBackOrder && baseUnits && currentUnits &&
                                            product.qtyOrdered * currentUnits.qtyPerBaseUnitOfMeasure > product.qtyOnHand * baseUnits.qtyPerBaseUnitOfMeasure) {
                                            errorProduct = self.morscoMapProductErrorInfo(index, MorscoUploadError.NotEnough, item.Name, product);
                                            errorProduct.conversionRequested = currentUnits.qtyPerBaseUnitOfMeasure;
                                            errorProduct.conversionOnHands = baseUnits.qtyPerBaseUnitOfMeasure;
                                            errorProduct.umOnHands = baseUnits.unitOfMeasureDisplay;
                                            self.errorProducts.push(errorProduct);
                                        }
                                        else {
                                            self.products.push(product);
                                            self.checkCompletion();
                                        }
                                    }
                                }
                                else {
                                    self.errorProducts.push(self.morscoMapProductErrorInfo(index, error, item.Name, product));
                                }
                            }
                            else {
                                if (!item.Description || item.Description == '') {
                                    if (item.PartNumber) {
                                        item.Description = item.PartNumber;
                                    }
                                    if (item.Description && item.MfrName) {
                                        item.Description += " ";
                                        item.Description += item.MfrName;
                                    }
                                }
                                if (item.Description && item.Description.length > 0) {
                                    self.specialOrderProducts.push(item);
                                }
                                self.specialOrderProductCount++;
                                self.checkCompletion();
                            }
                        })
                        .error(function (error) {
                            if (error.status === 404) {
                                self.errorProducts.push(
                                    self.morscoMapProductErrorInfo(
                                        index,
                                        MorscoUploadError.NotFound,
                                        item.Name,
                                        <ProductDto>{
                                            qtyOrdered: item.Qty,
                                            unitOfMeasureDisplay: item.UM,
                                            shortDescription: item.Desc,
                                            /* I'm sure this is incorrect - Ryan*/
                                            properties: item.MFR
                                        }
                                    )
                                );
                                self.checkCompletion();
                            }
                        });
                });
            } else {
                this.badFile = true;
                this.$scope.$apply();
                this.spinnerService.hide("mainLayout");
            }
        }

        checkCompletion(): void {
            this.productProcessed++;
            if (!this.uploadCancelled && this.productProcessed === this.totalProductToProcess) {
                if (this.bulkSearch.length - this.specialOrderProductCount === this.products.length) {
                    this.continueToCart();
                }
                else {
                    this.coreService.closeModal("#orderUploadingPopup");
                    setTimeout(() => {
                        this.coreService.displayModal(angular.element("#orderUploadingIssuesPopup"));
                    }, 250); // Foundation.libs.reveal.settings.animation_speed
                }
            }
        }
        morscoValidateProduct(product: ProductDto): MorscoUploadError {
            if (product.qtyOnHand === 0 && !product.canBackOrder) {
                return MorscoUploadError.OutOfStock;
            }
            if (product.canConfigure || (product.isConfigured && !product.isFixedConfiguration)) {
                return MorscoUploadError.ConfigurableProduct;
            }
            if (product.isStyleProductParent) {
                return MorscoUploadError.StyledProduct;
            }
            if (!product.canAddToCart) {
                return MorscoUploadError.Unavailable;
            }
            return MorscoUploadError.None;
        }

        private morscoGetFileExtention(fileName: string): string {
            var splittedFileName: string[] = fileName.split(".");
            return splittedFileName.length > 0 ? splittedFileName[splittedFileName.length - 1].toLowerCase() : "";
        }

        private morscoCleanupUploadData(): void {
            this.productRequests = null;
            this.errorProducts = null;
            this.products = null;
            this.specialOrderProducts = null;
            this.specialOrderProductCount = 0;
        }

        private morscoMapProductErrorInfo(index: number, error: MorscoUploadError, name: string, product: ProductDto): any {
            return {
                index: index,
                error: MorscoUploadError[error],
                name: name,
                qtyRequested: product.qtyOrdered,
                umRequested: product.unitOfMeasureDisplay,
                qtyOnHands: product.qtyOnHand,
                shortDescription: product.shortDescription,
                properties: product.properties
            }
        }

        private morscoLimitExceeded(rowsCount: number): boolean {
            this.uploadLimitExceeded = rowsCount > 500;
            return this.uploadLimitExceeded;
        }
    }

    angular.module("insite")
        .controller("OrderUploadController", MorscoOrderUploadController);
}