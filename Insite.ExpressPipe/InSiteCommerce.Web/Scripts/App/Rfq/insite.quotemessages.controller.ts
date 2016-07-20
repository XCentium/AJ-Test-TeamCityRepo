module insite.quoteMessages {
    "use strict";

    export class QuoteMessagesController {
        quoteId: string;
        rfqMessage: string;

        static $inject = ["$scope", "coreService", "rfqService"];
        constructor(
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected rfqService: rfq.IRfqService) {

            this.init();
        }

        init() {
            this.quoteId = this.coreService.getQueryStringParameter("quoteId");
        }

        sendMessage(): any {
            var parameter = {
                quoteId: this.quoteId,
                message: this.rfqMessage
            };
            this.rfqService.submitRfqMessage(parameter).then((result) => {
                (<any>this.$scope).messageCollection.push(result);
                this.$scope.$broadcast("messagesloaded");
                this.rfqMessage = "";
            });
        }
    }

    angular
        .module("insite")
        .controller("QuoteMessagesController", QuoteMessagesController);
}