module insite.message {
    "use strict";

    export class MorscoMessageController extends MessageController {
        
        toggleMessage($event) {
            $($event.currentTarget).parents('.message').toggleClass('expand');
        }
    }

    angular
        .module("insite")
        .controller("MessageController", MorscoMessageController);
} 