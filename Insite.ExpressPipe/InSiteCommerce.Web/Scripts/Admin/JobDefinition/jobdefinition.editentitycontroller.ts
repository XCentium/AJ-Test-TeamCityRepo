module insite_admin {
    import Core = insite.core;
    "use strict";

    export class EditEntityControllerJobDefinition extends EditEntityController {
        integrationJob: any;
        resultMessage: any;

        static $inject = [
            "$rootScope",
            "$scope",
            "$http",
            "$window",
            "$parse",
            "$attrs",
            "$timeout",
            "displayNameService",
            "$sessionStorage",
            "$location",
            "breadcrumbService",
            "odataService",
            "spinnerService",
            "fingerTabsService",
            "$routeParams",
            "$route",
            "FoundationApi",
            "$q"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $window: ng.IWindowService,
            protected $parse: ng.IParseService,
            protected $attrs: IEditEntityAttributes,
            protected $timeout: ng.ITimeoutService,
            protected displayNameService: IDisplayNameService,
            protected $sessionStorage: Core.IWindowStorage,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService,
            protected odataService: IOdataService,
            protected spinnerService: ISpinnerService,
            protected fingerTabsService: FingerTabsService,
            protected $routeParams: any,
            protected $route: any,
            protected $foundationApi: any,
            protected $q: ng.IQService
        ) {
            super($rootScope, $scope, $http, $window, $parse, $attrs, $timeout, displayNameService, $sessionStorage,
                $location, breadcrumbService, odataService, spinnerService, fingerTabsService, $routeParams, $route, $foundationApi, $q);

            this.initJobDefinition();
        }

        initJobDefinition() {
            this.loadDefaultIntegrationJob();
        }

        loadDefaultIntegrationJob() {
            this.$http.get('/api/v1/admin/integrationjobs/default?q=${new Date().getTime()}').success(integrationJob => {
                this.integrationJob = integrationJob;
                this.integrationJob.scheduleDateTime = new Date(new Date().toUTCString()); // set as default on entity definition?
            });
        }

        scheduleIntegrationJob() {
            this.resultMessage = "";
            this.$foundationApi.publish("scheduleIntegrationJob", "open");
        }

        saveIntegrationJob() {
            this.spinnerService.show();

            this.integrationJob.jobDefinitionId = this.model.id;
            this.integrationJob.status = "Queued"; // set as default on entity definition?

            this.$http({
                method: "POST",
                url: "/api/v1/admin/integrationjobs",
                data: this.integrationJob
            }).success(integrationJob => {
                this.spinnerService.hide();
                this.loadDefaultIntegrationJob(); // reset the integration job
                this.resultMessage = "Job Successfully Scheduled";
            }).error(integrationJob => {
                this.spinnerService.hide();
                this.loadDefaultIntegrationJob(); // reset the integration job
                this.resultMessage = "Error Scheduling Job";
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("EditEntityControllerJobDefinition", EditEntityControllerJobDefinition);
}