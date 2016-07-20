module insite.dealers {

    angular.module("insite")
        .directive("iscDealerWidgetView", [
            "coreService", (coreService: core.ICoreService) => {
                var directive: ng.IDirective = {
                    replace: true,
                    restrict: "E",
                    templateUrl: coreService.getApiUri("/Directives/Dealers/DealerWidgetView"),
                    controller: "DealerCollectionController",
                    controllerAs: "vm"
                }
                return directive;
            }
        ]);
}