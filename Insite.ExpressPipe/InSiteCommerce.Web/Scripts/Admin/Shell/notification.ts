module insite_admin {
    import JobListItemModel = Insite.Admin.Models.JobListItemModel;
    "use strict";

    export interface INotificationService {
        register(api);
        show(type: NotificationType, message: string, job?: JobListItemModel);
    }

    export class NotificationController {
        static $inject = ["notificationService", "$scope", "$location", "breadcrumbService"];

        constructor(
            protected notificationService: INotificationService,
            protected $scope: ng.IScope,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService
        ) {
            this.init();
        }

        init() {
            (<any>this.$scope).notificationOptions = {
                appendTo: ".notification-area",
                stacking: "up",
                autoHideAfter: 4000,
                hideOnClick: false,
                templates: [
                    {
                        type: "success",
                        template: angular.element("#successNotificationTemplate").html()
                    },
                    {
                        type: "error",
                        template: angular.element("#errorNotificationTemplate").html()
                    },
                    {
                        type: "canceled",
                        template: angular.element("#canceledNotificationTemplate").html()
                    }
                ]
            };

            var api = {
                show: (type: NotificationType, message: string, job?: JobListItemModel) => {
                    var locationPath = this.getLocationPath(job);
                    var isFailureJob = !!(job && job.isImport && job.isFailure);
                    var isExportSuccess = !!(job && job.isExport && job.file);
                    var isCanceledJob = !!(job && job.status === "Canceled" && job.file);
                    (<any>this.$scope).notificationContainer.show({
                        message: message,
                        locationPath: locationPath,
                        isExportSuccess: isExportSuccess,
                        isFailureJob: isFailureJob,
                        isCanceledJob: isCanceledJob
                    }, NotificationType[type].toLowerCase());
                }
            };

            this.notificationService.register(api);
        }

        getLocationPath(job: JobListItemModel) {
            if (job && job.isExport && job.file) {
                return job.file;
            } else if (job && job.isImport && job.isFailure) {
                return `/export/${this.breadcrumbService.pluralize(job.exportObject)}/details/${job.id}`;
            }

            return "";
        }

        downloadFile(locationPath: string) {
            this.$location.url(locationPath);
        }

        viewJob(locationPath: string) {
            this.$location.url(locationPath);
        }

        hideNotification(element) {
            $(element).remove();
        }
    }

    export class NotificationService implements INotificationService {
        api: any;

        register(api) {
            this.api = api;
        }

        show(type: NotificationType, message: string, job?: JobListItemModel): void {
            this.api.show(type, message, job);
        }
    }

    export enum NotificationType {
        Success,
        Error,
        Canceled
    }

    angular
        .module("insite-admin")
        .controller("NotificationController", NotificationController)
        .service("notificationService", NotificationService)
        .directive("isaNotification", () => {
            return {
                restrict: "EAC",
                link: (scope, element) => {
                    element.on("click", () => {
                        angular.element(element).parent(".k-widget.k-notification").remove();
                    });
                }
            };
        });
}