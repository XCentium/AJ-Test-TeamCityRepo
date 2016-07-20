import DashboardPanelCollectionModel = Insite.Dashboard.WepApi.V1.ApiModels.DashboardPanelCollectionModel;
import DashboardPanelModel = Insite.Dashboard.WepApi.V1.ApiModels.DashboardPanelModel;

module insite.dashboard {
    "use strict";

    export interface IDashboardService {
        getDashboardPanels(): ng.IHttpPromise<DashboardPanelCollectionModel>;
    }

    export class DashboardService implements IDashboardService {
        dashboardPanelsUri = this.coreService.getApiUri("/api/v1/dashboardpanels/");

        static $inject = ["$http", "coreService"];
        constructor(
            protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {
        }

        getDashboardPanels(): ng.IHttpPromise<DashboardPanelCollectionModel> {
            
            return this.$http.get(this.dashboardPanelsUri);
        }
    }

    angular
        .module("insite")
        .service("dashboardService", DashboardService);
} 