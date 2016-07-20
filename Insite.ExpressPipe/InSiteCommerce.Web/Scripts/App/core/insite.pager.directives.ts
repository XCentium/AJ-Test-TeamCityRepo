module insite.core {
    "use strict";

    angular.module("insite")
        .directive("iscPager", ["coreService", (coreService: ICoreService) => {
        var directive: ng.IDirective = {
            restrict: "E",
            replace: true,
            templateUrl: coreService.getApiUri("/Directives/Core/Pager"),
            scope: {
                pagination: "=",
                bottom: "@",
                updateData: "&",
                customContext: "=",
                storageKey: "=",
                pageChanged: "&"
            },
            controller: "PagerController",
            controllerAs: "vm",
            bindToController: true
        }
        return directive;
    }]);
}
