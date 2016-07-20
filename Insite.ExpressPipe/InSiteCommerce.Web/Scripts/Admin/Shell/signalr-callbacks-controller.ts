module insite_admin {
    "use strict";

    export class SignalRCallbacksController {
        static $inject = ["$rootScope", "$window", "notificationService", "adminSessionService"];

        connection: any;

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $window: ng.IWindowService,
            protected notificationService: INotificationService,
            protected adminSessionService: IAdminSessionService
        ) {
            this.init();
        }

        init() {
            this.connection = ((<any>jQuery).connection);
            this.connection.hub.qs = {
                "access_token": () => {
                    var token = this.$window.localStorage.getItem("admin-accessToken");
                    return token ? token : "";
                }
            };
            this.connection.rebuildSearchIndexHub.client.statusUpdate = (indexType, status) => this.searchStatusUpdate(indexType, status);

            if (this.adminSessionService.isAuthenticated()) {
                this.startConnection();
            }

            this.$rootScope.$on("signed-in", () => {
                // Need to stop the connection to change the hub configuration
                this.connection.hub.stop();
                this.startConnection();
            });
        }

        startConnection() {
            this.connection.hub.start().done(() => {
                this.connection.rebuildSearchIndexHub.server.joinGroup();
            });
        }

        searchStatusUpdate(indexType, indexRun) {
            switch (indexRun.Status) {
                case "InProgress":
                    this.notificationService.show(NotificationType.Success, "Rebuilding search index.");
                    this.$rootScope.$broadcast("search-index-rebuilding", indexType, indexRun);
                    break;
                case "Success":
                    this.notificationService.show(NotificationType.Success, "Search index rebuid completed.");
                    this.$rootScope.$broadcast("search-index-finished", indexType, indexRun);
                    break;
                case "Failure":
                    this.notificationService.show(NotificationType.Error, "Rebuild of search index failed, please try again.");
                    this.$rootScope.$broadcast("search-index-finished", indexType, indexRun);
                    break;
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("SignalRCallbacksController", SignalRCallbacksController)
        .directive("isaSignalrCallbacks", () => {
            return {
                restrict: "E",
                controller: "SignalRCallbacksController"
            };
        });
}