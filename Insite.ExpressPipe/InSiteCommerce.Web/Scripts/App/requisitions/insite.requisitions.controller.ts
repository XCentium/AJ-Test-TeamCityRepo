module insite.requisitions {
    "use strict";

    export class RequisitionsController {
        requisitionCollection: RequisitionCollectionModel;
        requisition: RequisitionModel;
        pagination: PaginationModel;
        updateItemMessage: string;
        deleteItemMessage: string;
        deleteOrderLineMessage: string;
        message: string;		

        private requireQuote = {};
		private approvedRequisitionCollection = {};
	    paginationStorageKey = "DefaultPagination-Requisitions";
        showAddToCartConfirmationDialog: boolean;

        static $inject = [
            "requisitionService",
            "cartService",
            "paginationService",
            "coreService"
        ];

        constructor(
            protected requisitionService: IRequisitionService,
            protected cartService: cart.ICartService,
            protected paginationService: core.IPaginationService,
            protected coreService: core.ICoreService) {

            this.init();
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);
            this.getRequisitionCollection();
        }

        getRequisitionCollection() {
            this.requisitionService.getRequisitionCollection(this.pagination).success(result => {
                this.requisitionCollection = result;
                this.pagination = result.pagination;
				this.requisitionCollection.requisitions.forEach(requisition => {
					if (this.approvedRequisitionCollection[requisition.id]) {
						requisition.isApproved = true;
					}
	            });
            });
        }

        openRequisition(requisitionId: System.Guid) {
            this.message = "";
            this.requisitionService.getRequisition(requisitionId).success(result => {
                this.requisition = result;
                this.displayRequisition();
            });
        }

        patchRequisitionLine(requisitionLine: RequisitionLineModel) {
            this.message = "";
            this.requisitionService.patchRequisitionLine(requisitionLine).success((result: RequisitionModel) => {
                this.getRequisitionCollection();
                if (result === null) {
                    this.requisition.requisitionLineCollection = null;
                } else {
                    this.requisition = result;
                }
                if (requisitionLine.qtyOrdered <= 0) {
                    this.message = this.deleteItemMessage;
                } else {
                    this.message = this.updateItemMessage;
                }
            });
        }

        deleteRequisitionLine(requisitionLine: RequisitionLineModel) {
            this.message = "";
            this.requisitionService.deleteRequisitionLine(requisitionLine).success(() => {
                this.getRequisitionCollection();
                for (var i = 0; i < this.requisition.requisitionLineCollection.requisitionLines.length; i++) {
                    if (this.requisition.requisitionLineCollection.requisitionLines[i].id === requisitionLine.id) {
                        this.requisition.requisitionLineCollection.requisitionLines.splice(i, 1);
                        break;
                    }
                }
                if (this.requisition.requisitionLineCollection.requisitionLines.length === 0) {
                    this.message = this.deleteOrderLineMessage;
                } else {
                    this.message = this.deleteItemMessage;
                }
            });
        }

        displayRequisition() {
            this.coreService.displayModal(angular.element("#popup-requisition"));
        }

        addAllToCart() {
            var cartLines: Array<CartLineModel> = [];
			angular.forEach(this.approvedRequisitionCollection, value => {
                    cartLines.push(value);
            });

            if (cartLines.length > 0) {
                this.cartService.addLineCollection(cartLines).then(result => {
                    this.getRequisitionCollection();
                });
            }
        }

        convertForPrice(requisition: RequisitionModel): any {
            if (!requisition.quoteRequired) {
                return requisition;
            }
            if (this.requireQuote[requisition.id]) {
                return this.requireQuote[requisition.id];
            }

            var product = <ProductDto>{};
            product.id = <string>requisition.productId;
            product.quoteRequired = requisition.quoteRequired;
            this.requireQuote[requisition.id] = product;

            return product;
        }

		changeApprovedList(requisition: RequisitionModel): void {
			if (requisition.isApproved) {
				this.approvedRequisitionCollection[requisition.id] = requisition;
			} else {
				delete this.approvedRequisitionCollection[requisition.id];
			}
		}
    }

    angular
        .module("insite")
        .controller("RequisitionsController", RequisitionsController);
}