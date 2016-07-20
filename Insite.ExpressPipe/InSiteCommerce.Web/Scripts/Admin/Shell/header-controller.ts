module insite_admin {
    import Core = insite.core;
    import JobListItemModel = Insite.Admin.Models.JobListItemModel;
    "use strict";

    export class HeaderController {
        user: string;
        websitesList: any[];
        isContentEditor: boolean;
        jobsList: any[];
        completedJobsList: any[];
        activeJobsNumber: number;
        isJobPopapOpened = false;
        refreshPromise: ng.IPromise<any>;
        lastJobRequestTime: Date;
        masterEditModeIsEnabled: boolean;
        private modal: any;

        static $inject = [
            "$rootScope",
            "adminSessionService",
            "$location",
            "$window",
            "spinnerService",
            "$http",
            "jobListService",
            "FoundationApi",
            "$interval",
            "breadcrumbService",
            "notificationService",
            "$q",
            "ModalFactory",
            "websiteService",
            "$localStorage",
            "$sessionStorage"
        ];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected adminSessionService: IAdminSessionService,
            protected $location: ng.ILocationService,
            protected $window: ng.IWindowService,
            protected spinnerService: ISpinnerService,
            protected $http: ng.IHttpService,
            protected jobListService: IJobListService,
            protected $foundationApi: any,
            protected $interval: ng.IIntervalService,
            protected breadcrumbService: IBreadcrumbService,
            protected notificationService: INotificationService,
            protected $q: ng.IQService,
            protected modalFactory: any,
            protected websiteService: IWebsiteService,
            protected $localStorage: Core.IWindowStorage,
            protected $sessionStorage: Core.IWindowStorage) {

            if (this.adminSessionService.isAuthenticated()) {
                this.init();
            }
        }

        init() {
            this.completedJobsList = [];
            this.loadUserInfo();
            this.loadJobs().then(() => {
                this.refreshPromise = this.$interval(() => {
                    this.loadJobs();
                }, 30000);
            });
            this.$rootScope.$on("userProfileChanged", () => {
                this.loadUserInfo();
            });
            this.$rootScope.$on("jobNumberChanged", () => {
                this.loadJobs();
            });
            this.$foundationApi.subscribe("sitePreviewPopup", (msg: any) => {
                if (msg[0] === "toggle" && !this.websitesList) {
                    this.loadWebsites();
                }
            });
            this.$foundationApi.subscribe("jobsPopup", (msg: any) => {
                if (msg[0] === "toggle") {
                    this.isJobPopapOpened = !this.isJobPopapOpened;
                    if (this.isJobPopapOpened) {
                        this.cancelReloadingJobs();
                        this.startReloadingJobs(3000);
                    } else {
                        this.cancelReloadingJobs();
                        this.startReloadingJobs(30000);
                    }
                } else if (msg[0] === "hide") {
                    this.isJobPopapOpened = false;
                    this.cancelReloadingJobs();
                    this.startReloadingJobs(30000);
                }
            });

            this.$http.get("/admin/debug/MasterEditModeStatus").success((model) => {
                this.masterEditModeIsEnabled = (<any>model).isEnabled;
            });

            this.$rootScope.$on("userLogoutWarning", () => {
                this.createWarningModal();
            });
        }

        isAuthenticated(): boolean {
            return this.adminSessionService.isAuthenticated();
        }

        debugMenuIsEnabled(): boolean {
            var hasRole = this.adminSessionService.hasRole("ISC_System");

            if (!hasRole) {
                angular.element("#debugPopup").remove();
            }

            return hasRole;
        }

        contentEditorIsEnabled(): boolean {
            return this.adminSessionService.hasRole("ISC_ContentAdmin") ||
                this.adminSessionService.hasRole("ISC_ContentApprover") ||
                this.adminSessionService.hasRole("ISC_ContentEditor");
        }

        navigateTo(url: string): void {
            this.$location.url(url);
        }

        clearLocalStorage(): void {
            this.$localStorage.removeAll();
            this.$sessionStorage.removeAll();

            this.$window.location.reload();
        }

        clearCache(): void {
            this.spinnerService.show();

            this.$http.get("/admin/debug/clearcache").success(() => {
                this.$window.location.reload();
            });
        }

        enableMasterEditMode(): void {
            this.spinnerService.show();
            this.$http.post("/admin/debug/EnableMasterEditMode", null).success(() => {
                this.$window.location.reload();
            });
        }

        disableMasterEditMode(): void {
            this.spinnerService.show();
            this.$http.post("/admin/debug/DisableMasterEditMode", null).success(() => {
                this.$window.location.reload();
            });
        }

        loadUserInfo() {
            this.$http.get("/api/v1/admin/userprofiles/current?$select=firstName,lastName,userName,id", { bypassErrorInterceptor: true }).then((result: any) => {
                this.user = result.data.firstName + " " + result.data.lastName;
                if (this.user === " ") {
                    this.user = result.data.userName;
                }

                var dataLayer = window["dataLayer"];
                if (dataLayer.length > 0 && (typeof (dataLayer[dataLayer.length - 1]["event"]) === "undefined" || dataLayer[dataLayer.length - 1]["event"] !== "logIn")) {
                    var data = {
                        "userId": result.data.id,
                        "ISCVer": window["currentVersion"],
                        "event": "pageLoad"
                    };

                    window["dataLayer"].push(data);
                }
            });
        }

        loadWebsites() {
            this.websiteService.loadWebsites().success((result: any) => {
                this.websitesList = result.value;
            });
        }

        openWebsite(website: any) {
            var currentDomainName = this.$location.host();
            var url = this.websiteService.getWebsiteUrl(website.domainName, currentDomainName);

            if (website.microSiteIdentifiers !== "") {
                url += `/${website.microSiteIdentifiers}`;
            }

            if (this.isContentEditor) {
                url += "/ContentAdmin/Shell?frameUrl=/";
            }

            this.$window.open(url);
        }

        loadJobs(): ng.IPromise<any> {
            var pageSize = 5;
            var page = 1;

            return this.jobListService.getJobList(pageSize, page).then((result: any) => {
                this.jobsList = result.jobs;
                this.activeJobsNumber = result.activeJobs;
                if (this.lastJobRequestTime) {
                    this.jobListService.getJobList(null, null, null, this.lastJobRequestTime).then((res: any) => {
                        this.completedJobsList = res.jobs;
                        if (this.completedJobsList.length > 0) {
                            this.completedJobsList.forEach((job: JobListItemModel) => {
                                if (job.isExport && job.file && job.status === "Canceled") {
                                    this.notificationService.show(NotificationType.Canceled, `${job.exportObject} ${job.file} is canceled`, job);
                                } else if (job.isExport && job.file) {
                                    this.notificationService.show(NotificationType.Success, `${job.exportObject} ${job.file} is ready`, job);
                                } else if (job.isImport && job.isFailure) {
                                    this.notificationService.show(NotificationType.Error, `${job.exportObject} import ${job.file} has errors`, job);
                                }
                            });
                        }
                    });
                }
                this.lastJobRequestTime = new Date();
            });
        }

        startReloadingJobs(interval: number) {
            this.loadJobs().then(() => {
                this.refreshPromise = this.$interval(() => {
                    this.loadJobs();
                }, interval);
            });
        }

        cancelReloadingJobs() {
            this.$interval.cancel(this.refreshPromise);
        }

        openJob(job: JobListItemModel) {
            this.jobListService.deactivate(job.id);
            if (job.isExport) {
                this.$location.url(`/export/${this.breadcrumbService.pluralize(job.exportObject)}/details/${job.id}`);
            } else if (job.isImport) {
                this.$location.url(`/import/${this.breadcrumbService.pluralize(job.exportObject)}/details/${job.id}`);
            }
            this.$foundationApi.publish("jobsPopup", ["hide"]);
        }

        downloadJobFile(job: JobListItemModel, $event: Event) {
            $event.stopPropagation();
            this.jobListService.deactivate(job.id);
        }

        getAccessTokenQueryString() {
            return "access_token=" + this.adminSessionService.getAccessToken();
        }

        signOut() {
            this.spinnerService.show();
            this.adminSessionService.signOut().then(() => {
                this.$location.url("/");
                this.$window.location.reload();
            });
        }

        createWarningModal() {
            if (!this.modal) {
                var submitAction = () => {
                    this.spinnerService.show();
                    this.adminSessionService.refreshAccessToken().then(() => {
                        this.spinnerService.hide();
                        this.modal.deactivate();
                        this.adminSessionService.resetInactivityTimer();

                    }, (error) => {
                        this.spinnerService.hide();
                        var errorMessage = error.error || error;
                        this.notificationService.show(NotificationType.Error, errorMessage);
                    });

                };
                var config = {
                    id: "logoutWarning",
                    class: "modal--medium",
                    templateUrl: "simpleModalDialog",
                    contentScope: {
                        modalDialogText: "The system will log you out in 3 minutes.",
                        modalDialogTitle: "Warning",
                        submitButtonName: "Keep me logged in",
                        modalSubmitAction: submitAction
                    }
                }
                this.modal = new this.modalFactory(config);
            }

            this.modal.activate();
        }
    }

    angular
        .module("insite-admin")
        .controller("HeaderController", HeaderController);
}