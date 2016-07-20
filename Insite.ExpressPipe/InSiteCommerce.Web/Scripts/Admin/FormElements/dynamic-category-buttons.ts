module insite_admin {
    "use strict";

    export class DynamicCategoryButtonsController {
        model: any;
        isModelDirty: boolean;
        previewEntities: any;
        propertiesToSelect: string;

        static $inject = ["$http", "FoundationApi", "$route", "spinnerService", "notificationService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $foundationApi: any,
            protected $route: any,
            protected spinnerService: ISpinnerService,
            protected notificationService: INotificationService) {
        }

        preview(): void {
            if (this.isModelDirty) {
                this.notificationService.show(NotificationType.Error, "Please save your changes before previewing.");
                return;
            }
            this.$http.get(`/admin/dynamiccategories/preview/${this.model.id}`, { bypassErrorInterceptor: true }).then((result) => {
                var entityIds = <Array<string>>result.data;
                if (entityIds.length === 0) {
                    this.notificationService.show(NotificationType.Error, "No products found that match the following rules.");
                    return;
                }
                var filter = `id eq ${entityIds.join(" or id eq ")}`;
                this.$http.get(`/api/v1/admin/products?$filter=${filter}&$select=${this.propertiesToSelect}`).then((entities: any) => {
                    this.previewEntities = entities.data.value;
                    this.$foundationApi.publish("previewDynamicCategory", "open");
                });
            }, () => {
                this.notificationService.show(NotificationType.Error, "Please try again and contact support if you continue to have issues.");
            });
        }

        generate(): void {
            if (this.isModelDirty) {
                this.notificationService.show(NotificationType.Error, "Please save your changes before generating.");
                return;
            }
            this.spinnerService.show();
            this.$http.post(`/admin/dynamiccategories/generate/${this.model.id}`, null).then(() => {
                this.$route.reload();
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("DynamicCategoryButtonsController", DynamicCategoryButtonsController)
        .directive("isaDynamicCategoryButtons", <any>function () {
            return {
                restrict: "E",
                controller: "DynamicCategoryButtonsController",
                controllerAs: "vm",
                scope: {},
                bindToController: {
                    model: "=",
                    isModelDirty: "=",
                    propertiesToSelect: "@"
                },
                templateUrl: "DynamicCategoryButtonsTemplate"
            }
        });

}