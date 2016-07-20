 /// <reference path="../../typings/angularjs/angular-route.d.ts" />

module insite_admin {
    "use strict";

    export interface IAdminActionCallbacks {
        success(returnModel: any);
        error(returnModel: any);
    }

    export interface IAdminActionService {
        executeEntityAction(formName: string, action: string, entityId: System.Guid, callbacks?: IAdminActionCallbacks): ng.IHttpPromise<any>;
        executeEntityCustomAction(formName: string, action: string, entityId: System.Guid, model: any, $scope: ng.IScope): void;
        executeEntityListAction(formName: string, action: string, selectedEntityIds: System.Guid[]): ng.IHttpPromise<any>;
        executeEntityListCustomAction(formName: string, action: string, selectedEntityIds: System.Guid[], $scope: ng.IScope): void;
    }

    export class AdminActionService implements IAdminActionService {
        static $inject = ["$http", "spinnerService", "$route", "$window", "notificationService"];

        constructor(
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $route: ng.route.IRouteService,
            protected $window: ng.IWindowService,
            protected notificationService: INotificationService
        ) { }

        executeEntityAction(formName: string, action: string, entityId: System.Guid, callbacks?: IAdminActionCallbacks): ng.IHttpPromise<any> {
            var data = {
                formName: formName,
                actionName: action,
                entityId: entityId
            };

            return this.executeAction("/admin/adminAction/Execute", data, callbacks);
        }

        executeEntityCustomAction(formName: string, action: string, entityId: System.Guid, model: any, $scope: ng.IScope): void {
            $scope.$broadcast(`AdminAction-Detail:${action}`, {
                formName: formName,
                model: model,
                entityId: entityId
            });
        }

        executeEntityListAction(formName: string, action: string, selectedEntityIds: System.Guid[]): ng.IHttpPromise<any> {
            var data = {
                formName: formName,
                actionName: action,
                selectedEntityIds: selectedEntityIds
            };

            return this.executeAction("/admin/adminAction/ExecuteListAction", data);
        }

        executeEntityListCustomAction(formName: string, action: string, selectedEntityIds: System.Guid[], $scope: ng.IScope): void {
            $scope.$broadcast(`AdminAction-List:${action}`, {
                formName: formName,
                selectedEntityIds: selectedEntityIds
            });
        }

        private executeAction(route: string, data: any, callbacks?: IAdminActionCallbacks): ng.IHttpPromise<any> {
            this.spinnerService.show();

            return this.$http.post(route, data)
                .success(model => {
                    this.spinnerService.hide();

                    var returnModel: any = model;
                    var actions = [];
                    var actionLookup = {};

                    if (returnModel.hasOwnProperty("actions")) {
                        actions = returnModel.actions;
                        for (var i = 0, len = actions.length; i < len; i++) {
                            actionLookup[actions[i]] = actions[i];
                        }
                    }

                    if (actionLookup["ShowErrorMessage"]) {
                        if (callbacks && callbacks.error) {
                            callbacks.error(returnModel);
                        } else {
                            this.notificationService.show(NotificationType.Error, returnModel.message);
                        }
                    } else if (actionLookup["ShowSuccessMessage"]) {
                        if (callbacks && callbacks.success) {
                            callbacks.success(returnModel);
                        } else {
                            this.notificationService.show(NotificationType.Success, returnModel.message);
                        }
                    }

                    if (actionLookup["ReloadEntity"]) {
                        this.$route.reload();
                    } else if (actionLookup["ReloadPage"]) {
                        this.$window.location.reload();
                    }
                }).error(() => {
                    this.spinnerService.hide();
                });
        }
    }

    angular
        .module("insite-admin")
        .service("adminActionService", AdminActionService);
}