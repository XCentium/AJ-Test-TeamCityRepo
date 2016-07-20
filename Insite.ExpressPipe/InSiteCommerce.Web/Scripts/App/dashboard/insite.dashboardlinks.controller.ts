module insite.dashboard {
    "use strict";

    export class DashboardLinksController {
        orderKey: string;
        quoteKey: string;
        requisitionKey: string;
        links: DashboardPanelModel[];
        panels: DashboardPanelModel[];

        static $inject = ["dashboardService", "$rootScope"];

        constructor(protected dashboardService: IDashboardService, protected $rootScope: ng.IRootScopeService) {
            this.init();
        }

        init() {
            this.getDashboardPanels();
        }

        getDashboardPanels(): void {
            this.dashboardService.getDashboardPanels().success((result: DashboardPanelCollectionModel) => {
                this.links = result.dashboardPanels.filter((x) => { return !x.isPanel });
                this.panels = result.dashboardPanels.filter((x) => { return x.isPanel });

                var quickLinks = result.dashboardPanels.filter((x) => { return x.isQuickLink });
                this.$rootScope.$broadcast("quickLinksLoaded", quickLinks);
            });
        }

        getCssClass(panelType: string): string {
            if (panelType === this.orderKey) {
                return "db-li-oapp";
            }
            if (panelType === this.requisitionKey) {
                return "db-li-req";
            }
            if (panelType === this.quoteKey) {
                return "db-li-quotes";
            }
            return "";
        }
    }

    angular
        .module("insite")
        .controller("DashboardLinksController", DashboardLinksController);
} 