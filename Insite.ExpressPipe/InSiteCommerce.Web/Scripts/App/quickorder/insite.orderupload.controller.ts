// controller for the quickorder cms small widget

///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/angularjs/angular.d.ts"/>
///<reference path="../catalog/insite.product.service.ts"/>
///<reference path="../cart/insite.cart.service.ts"/>
///<reference path="../../typings/xlsx/xlsx.d.ts"/>
///<reference path="../../typings/papaparse/papaparse.d.ts"/>
module insite.quickorder {
    "use strict";

    enum UploadError {
        None,
        NotEnough,
        ConfigurableProduct,
        StyledProduct,
        Unavailable,
        InvalidUnit,
        NotFound,
        OutOfStock
    }

    export class OrderUploadController {
        fileName: string = null;
        file: any = null;
        XLSX: any;
        Papa: any;
        firstRowHeading: boolean = false;
        badFile: boolean = false;
        uploadLimitExceeded: boolean = false;
        uploadCancelled: boolean = false;
        allowCancel: boolean = true;
        productRequests: ng.IPromise<ProductCollectionModel>[];

        errorProducts: any[] = null;
        products: ProductDto[];
        bulkSearch: any = null;
        uploadedItemsCount: number = 0;
        totalProductToProcess: number;
        productProcessed: number;

        public static $inject = ["$scope", "productService", "cartService", "coreService"];

        constructor(
            protected $scope: ng.IScope,
            protected productService: catalog.IProductService,
            protected cartService: cart.ICartService,
            protected coreService: core.ICoreService) {
            this.init();
        }

        init() {
            this.XLSX = XLSX;
            this.Papa = Papa;

            angular.element("#hiddenFileUpload").data("_scope", this.$scope);
            this.$scope.$on("settingsLoaded",(event, data) => {
                data.productSettings.showAddToCartConfirmationDialog = false; //We have custom popups for this page
            });
        }

        showOrderUploadSuccessPopup() {
            var $popup = angular.element("#orderUploadSuccessPopup");
            if ($popup.length > 0) {
                this.coreService.displayModal($popup);
            }
        }

        public setFile(arg) {
            if (arg.files.length > 0) {
                this.file = arg.files[0];
                this.$scope.$apply(this.fileName = this.file.name);
                var fileExtention = this.getFileExtention(this.file.name);
                this.badFile = ["xls", "xlsx", "csv"].indexOf(fileExtention) === -1;
                this.uploadLimitExceeded = false;
                this.$scope.$apply();
            }
        }

        public uploadFile() {
            this.uploadCancelled = false;

            var f = this.file;
            var reader = new FileReader();
            var fileExtention = this.getFileExtention(f.name);

            reader.onload = (e) => {
                var data = e.target["result"];
                var arr = this.fixdata(data);
                try
                {
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
                }

                if (!this.badFile && !this.uploadLimitExceeded) {
                    this.allowCancel = true;
                    this.coreService.displayModal(angular.element("#orderUploadingPopup"));
                }
                else {
                    this.$scope.$apply();
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
                    if (this.limitExceeded(roa.length)) {
                        return;
                    }
                    this.bulkSearch = roa.map(r => {
                        var obj = { Name: r[0], Qty: r[1], UM: r[2] };
                        return obj;
                    });
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
            if (this.limitExceeded(rows.length)) {
                return;
            }
            rows.forEach((s) => {
                if (s[0] == null || s[0].length === 0)
                    return;
                var objectToAdd = {};
                objectToAdd["Name"] = s[0];
                if (s[1]) {
                    objectToAdd["Qty"] = s[1];
                }
                if (s[2]) {
                    objectToAdd["UM"] = s[2];
                }
                this.bulkSearch.push(objectToAdd);
            });
            this.bulkSearchProducts();
        }

        bulkSearchProducts(): void {
            this.productRequests = [];
            this.errorProducts = [];
            this.products = [];
            this.totalProductToProcess = this.bulkSearch.length;
            this.productProcessed = 0;

            if (this.totalProductToProcess === 0) {
                this.badFile = true;
                return;
            }

            this.bulkSearch.forEach((item, i) => {
                var index = i + (this.firstRowHeading ? 2 : 1);
                var parameter: catalog.IProductCollectionParameters = <any>{ extendedNames: [item.Name] };
                var expandParameter = ["pricing"];
                var request = this.productService.getProductCollectionData(parameter, expandParameter);
                this.productRequests.push(<any>request);
                request.then(
                    result => {
                        if (this.uploadCancelled) {
                            return;
                        }
                        var products = result.products;
                        if (products.length === 1) {
                            var product = products[0];
                            var error = this.validateProduct(product);
                            if (error === UploadError.None)
                            {
                                var errorProduct;
                                var isErrorProdut: boolean = false;

                                product.qtyOrdered = !item.Qty ? 1 : item.Qty;
                                if (product.productUnitOfMeasures.some(u => u.unitOfMeasureDisplay === item.UM))
                                {
                                    var um = product.productUnitOfMeasures.filter(u => u.unitOfMeasure === item.UM)[0];
                                    product.selectedUnitOfMeasure = um.unitOfMeasure;
                                    product.selectedUnitOfMeasureDisplay = um.unitOfMeasureDisplay;
                                    product.unitOfMeasure = um.unitOfMeasure;
                                    product.unitOfMeasureDisplay = um.unitOfMeasureDisplay;
                                }
                                else if (item.UM)
                                {
                                    errorProduct = this.mapProductErrorInfo(index, UploadError.InvalidUnit, item.Name, product);
                                    errorProduct.umRequested = item.UM;
                                    this.errorProducts.push(errorProduct);
                                    isErrorProdut = true;
                                }

                                if (!isErrorProdut)
                                {
                                    var baseUnits = product.productUnitOfMeasures.filter(u => u.isDefault)[0];
                                    var currentUnits = product.productUnitOfMeasures.filter(u => u.unitOfMeasure === product.unitOfMeasure)[0];
                                    if (!product.canBackOrder && baseUnits && currentUnits &&
                                        product.qtyOrdered * currentUnits.qtyPerBaseUnitOfMeasure > product.qtyOnHand * baseUnits.qtyPerBaseUnitOfMeasure)
                                    {
                                        errorProduct = this.mapProductErrorInfo(index, UploadError.NotEnough, item.Name, product);
                                        errorProduct.conversionRequested = currentUnits.qtyPerBaseUnitOfMeasure;
                                        errorProduct.conversionOnHands = baseUnits.qtyPerBaseUnitOfMeasure;
                                        errorProduct.umOnHands = baseUnits.unitOfMeasureDisplay;
                                        this.errorProducts.push(errorProduct);
                                    }
                                    else
                                    {
                                        this.products.push(product);
                                    }
                                }
                            }
                            else
                            {
                                this.errorProducts.push(this.mapProductErrorInfo(index, error, item.Name, product));
                            }
                        }
                        else
                        {
                            this.errorProducts.push(this.mapProductErrorInfo(index, UploadError.NotFound, item.Name, <ProductDto> {
                                qtyOrdered: item.Qty,
                                unitOfMeasureDisplay: item.UM
                            }));
                        }
                            
                        this.checkCompletion();
                    },
                    error =>
                    {
                        if (error.status === 404)
                        {
                            this.errorProducts.push(this.mapProductErrorInfo(index, UploadError.NotFound, item.Name, <ProductDto> {
                                qtyOrdered: item.Qty,
                                unitOfMeasureDisplay: item.UM
                            }));
                            this.checkCompletion();
                        }
                    });
            });
        }

        checkCompletion(): void {
            this.productProcessed++;
            if (!this.uploadCancelled && this.productProcessed === this.totalProductToProcess) {
                if (this.bulkSearch.length === this.products.length) {
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

        validateProduct(product: ProductDto): UploadError {
            if (product.qtyOnHand === 0 && !product.canBackOrder) {
                return UploadError.OutOfStock;
            }
            if (product.canConfigure || (product.isConfigured && !product.isFixedConfiguration)) {
                return UploadError.ConfigurableProduct;
            }
            if (product.isStyleProductParent) {
                return UploadError.StyledProduct;
            }
            if (!product.canAddToCart) {
                return UploadError.Unavailable;
            }
            return UploadError.None;
        }

        fixdata(data) {
            var o = "", l = 0, w = 10240;
            for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        }

        cancelUpload(): void {
            this.uploadCancelled = true;
            this.coreService.closeModal("#orderUploadingPopup");
            for (var i = 0; i < this.productRequests.length; i++) {
                (<any>this.productRequests[i]).cancel();
            }
            this.cleanupUploadData();
            this.fileName = null;
            this.file = null;
        }

        closeIssuesPopup(): void {
            this.coreService.closeModal("#orderUploadingIssuesPopup");
            this.cleanupUploadData();
        }

        continueToCart(popupSelector?: string): void {
            if (popupSelector) {
                this.coreService.closeModal(popupSelector);
            }

            this.allowCancel = false;
            setTimeout(() => {
                this.coreService.displayModal(angular.element("#orderUploadingPopup"));
            }, 250);

            this.cartService.addLineCollectionFromProducts(this.products).then(() => {
                this.coreService.closeModal("#orderUploadingPopup");
                this.uploadedItemsCount = this.products.length;
                setTimeout(() => {
                    this.showOrderUploadSuccessPopup();
                    this.cleanupUploadData();
                }, 250);
            });
        }

        private getFileExtention(fileName: string): string {
            var splittedFileName: string[] = fileName.split(".");
            return splittedFileName.length > 0 ? splittedFileName[splittedFileName.length - 1].toLowerCase() : "";
        }

        private cleanupUploadData(): void {
            this.productRequests = null;
            this.errorProducts = null;
            this.products = null;
        }

        private mapProductErrorInfo(index: number, error: UploadError, name: string, product: ProductDto): any {
            return {
                index: index,
                error: UploadError[error],
                name: name,
                qtyRequested: product.qtyOrdered,
                umRequested: product.unitOfMeasureDisplay,
                qtyOnHands: product.qtyOnHand
            }
        }

        private limitExceeded(rowsCount: number): boolean {
            this.uploadLimitExceeded = rowsCount > 500;
            return this.uploadLimitExceeded;
        }
    }

    angular.module("insite")
        .controller("OrderUploadController", OrderUploadController);
}