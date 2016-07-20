module insite.dashboard {
    "use strict";

    export class DashboardQuickLinksController {
        quickLinks: DashboardPanelModel[];

        static $inject = ["$scope"];

        constructor(protected $scope: ng.IScope) {
            this.init();
        }

        init() {
            this.$scope.$on("quickLinksLoaded", (event, data) => {
                this.quickLinks = data;
            });
        }
    }

    angular
        .module("insite")
        .controller("DashboardQuickLinksController", DashboardQuickLinksController);
}