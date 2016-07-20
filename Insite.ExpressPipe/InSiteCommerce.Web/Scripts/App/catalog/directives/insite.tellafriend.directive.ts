///<reference path="../../../typings/angularjs/angular.d.ts"/>

module insite.catalog {

    angular
    .module("insite")
        .directive("iscTellAFriendPopup", ["coreService", (coreService: core.ICoreService) => {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    product: "="
                },
                templateUrl: coreService.getApiUri("/Directives/Catalog/TellAFriend"),
                controller: "TellAFriendController",
                controllerAs: "vm",
                bindToController: true
            };
        }]);
}