import MessageCollectionModel = Insite.Message.WebApi.V1.ApiModels.MessageCollectionModel;
import MessageModel = Insite.Message.WebApi.V1.ApiModels.MessageModel;

module insite.message {
    "use strict";

    export interface IMessageService {
        getMessages(): ng.IHttpPromise<MessageCollectionModel>;
        updateMessage(message: MessageModel): ng.IHttpPromise<MessageModel>;
    }

    export class MessageService implements IMessageService {
        messageServiceUri = this.coreService.getApiUri("/api/v1/messages/");

        static $inject = ["$http", "$q", "coreService"];
        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getMessages(): ng.IHttpPromise<MessageCollectionModel> {
            return this.$http.get(this.messageServiceUri);
        }

        updateMessage(message: MessageModel): ng.IHttpPromise<MessageModel> {
            return this.$http({
                method: "PATCH",
                url: message.uri,
                data: message
            });
        }
    }

    angular
        .module("insite")
        .service("messageService", MessageService);
} 