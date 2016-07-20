module insite_admin {
    "use strict";

    export class FilterContentManagersController {
        entityListCtrl: EntityListController;
        filterByPendingChanges: boolean;
        filterName = "OnlyShowContentWaitingForApproval";

        static $inject = [
            "$http",
            "$scope",
            "spinnerService",
            "FoundationApi"];
        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any
        ) {
            this.$scope.$watch("vm.entityListCtrl.filtersCollection", () => {
                if (this.entityListCtrl.filtersCollection.getByName(this.filterName).length > 0) {
                    this.filterByPendingChanges = true;
                }
            });

            this.$scope.$watch("vm.filterByPendingChanges", (newValue, oldValue) => {
                if (newValue !== oldValue) {
                    this.entityListCtrl.filtersCollection.remove(this.filterName);

                    if (this.filterByPendingChanges) {
                        var filter = new ListFilter();
                        filter.name = this.filterName;
                        filter.raw = "Contents/any(o: o/PublishToProductionOn eq null)";
                        this.entityListCtrl.filtersCollection.add(filter);
                    }

                    this.entityListCtrl.reloadList();
                }
            });
        }
    }

    var filterContentManagersDirective : ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            restrict: "EAC",
            templateUrl: "/admin/directives/FilterContentManagers",
            controller: "FilterContentManagersController",
            controllerAs: "vm",
            scope: {
                entityListCtrl: "="
            },
            bindToController: true
        };
        return directive;
    }

    angular
        .module("insite-admin")
        .controller("FilterContentManagersController", FilterContentManagersController)
        .directive("isaFilterContentManagers", filterContentManagersDirective);
}
