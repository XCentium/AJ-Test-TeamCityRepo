module insite.message {
    "use strict";

    export class MessageController {
        messages: MessageModel[];
        readCount: number = 0;
        unreadCount: number = 0;
        showRead: boolean = true;
        
        static $inject = ["$window", "$scope", "coreService", "messageService"];
        constructor(protected $window: ng.IWindowService,
            protected $scope: ng.IScope,
            protected coreService: core.ICoreService,
            protected messageService: message.IMessageService) {

            this.init();
        }

        init() {
            this.getMessages();
        }

        isBlank(text: string): boolean {
            return !text || text.trim() === "";
        }

        getMessages(): void {
            this.messageService.getMessages().success(result => {
                this.messages = result.messages;
                for (var index in this.messages)
                {
                    if (this.messages[index].isRead)
                    {
                        this.readCount++;
                    }
                    else
                    {
                        this.unreadCount++;
                    }
                }
            });
        }

        switchMessageStatus($event, message: MessageModel): void {
            message.isRead = !message.isRead;
            if (message.isRead)
            {
                this.readCount++;
                this.unreadCount--;
            }
            else
            {
                this.readCount--;
                this.unreadCount++;
            }

            this.messageService.updateMessage(message);
        }

        switchShowRead(): void {
            this.showRead = !this.showRead;
        }

        expand($event, message): void {
            message.isExpand = !message.isExpand;
        }
    }

    angular
        .module("insite")
        .controller("MessageController", MessageController);
} 