module insite.dashboard {
    "use strict";

    export class DashboardOptionsController {
        dashboardIsHomepage: boolean;

        static $inject = ["$scope", "sessionService"];

        constructor(
            protected $scope: ng.IScope,
            protected sessionService: account.ISessionService) {
            this.init();
        }

        init() {
            this.$scope.$on("sessionLoaded", (event: ng.IAngularEvent, session: SessionModel) => {
                this.dashboardIsHomepage = session.dashboardIsHomepage;
            });
        }

        changeDashboardHomepage($event): void {
            var checkbox = $event.target;
            var session = <SessionModel>{};
            session.dashboardIsHomepage = checkbox.checked;
            this.sessionService.updateSession(session).success((result) => {
                this.dashboardIsHomepage = result.dashboardIsHomepage;
            });
        }
    }

    angular
        .module("insite")
        .controller("DashboardOptionsController", DashboardOptionsController);
}