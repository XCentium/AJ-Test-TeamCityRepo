module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("stCustomPageselect", () => {
            return {
                restrict: "E",
                template: "<input type='text' ng-class=\"invalidPage ? 'invalid' : ''\" ng-model='inputPage' ng-change='delaySelectPage(inputPage)' />",
                link(scope, element, attrs) {
                    var theScope = <any>scope;
                    theScope.$watch("currentPage", page => {
                        theScope.invalidPage = false;
                        theScope.inputPage = page;
                    });
                    var theTimeout;
                    theScope.delaySelectPage = (page) => {
                        console.log("delay: " + page);
                        clearTimeout(theTimeout);

                        var pageNumber = Number(page);
                        if (pageNumber === NaN || parseInt(page, 10) !== Number(page)) {
                            theScope.invalidPage = true;
                        } else if (pageNumber < 1 || pageNumber > theScope.numPages) {
                            theScope.invalidPage = true;
                        } else {
                            theScope.invalidPage = false;
                        }

                        theTimeout = setTimeout(() => {
                            theScope.selectPage(page);
                        }, 500);

                    };
                }
            }
        });
}