(function () {
    "use strict";

    function toggleSidebar() {
        return {
            link: function (scope, element) {
                element.on('click', function () {
                    angular.element(document.getElementsByTagName("body")).toggleClass("is-collapsed");
                });
            },
            restrict: "A"
        };
    }

    angular.module("insite-admin")
        .directive("toggleSidebar", toggleSidebar);
})();
