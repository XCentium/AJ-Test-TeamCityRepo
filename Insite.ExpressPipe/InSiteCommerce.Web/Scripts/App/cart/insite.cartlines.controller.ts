module insite.cart {
    "use strict";

    export class CartLinesController {

        openLineNoteId = "";
        isUpdateInProgress = false;
        
        static $inject = [
            "$scope",
            "cartService",
            "spinnerService"
        ];

        constructor(protected $scope: ICartScope,
            protected cartService: ICartService,
            protected spinnerService: core.ISpinnerService) {
            this.init();
        }

        init() {
            this.$scope.$on("cartLoaded", () => {
                this.isUpdateInProgress = false;
            });
        }

        updateLine(cartLine: CartLineModel, refresh: boolean) {
            if (refresh) {
                this.isUpdateInProgress = true;
            }
            if (parseFloat(cartLine.qtyOrdered.toString()) === 0) {
                this.cartService.removeLine(cartLine);
            } else {
                this.cartService.updateLine(cartLine, refresh);
                this.spinnerService.show();
            }
        }

        removeLine(cartLine: CartLineModel) {
            this.spinnerService.show();
            this.cartService.removeLine(cartLine);
        }

        quantityKeyPress(keyEvent: KeyboardEvent, cartLine: CartLineModel) {
            if (keyEvent.which === 13) {
                this.updateLine(cartLine, true);
            }
        }

        notesKeyPress(keyEvent: KeyboardEvent, cartLine: CartLineModel) {
            if (keyEvent.which === 13) {
                this.updateLine(cartLine, false);
            }
        }

        notePanelClicked(lineId: string) {
            if (this.openLineNoteId === lineId)
                this.openLineNoteId = "";
            else
                this.openLineNoteId = lineId;
        }

        getSumQtyPerUom(productId: System.Guid, cartLines: CartLineModel[]): number {
            return cartLines.reduce((sum, current) => {
                return current.productId === productId
                    ? sum + current.qtyPerBaseUnitOfMeasure * current.qtyOrdered
                    : sum;
            }, 0);
        }
    }

    angular
        .module("insite")
        .controller("CartLinesController", CartLinesController);
}
