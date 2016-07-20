module insite.cart {
    "use strict";

    export class CartLineNoteController {

        openLineNoteId: string;

        static $inject = [
            "$scope"
            , "cartService"
        ];

        constructor(protected $scope: ICartScope, protected cartService: ICartService) {
          
        }

        updateLine(cartLine: CartLineModel, refresh: boolean) {
            this.cartService.updateLine(cartLine, refresh);
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
    }

    angular
        .module("insite")
        .controller("CartLineNoteController", CartLineNoteController);
}
