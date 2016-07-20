(() => {
    "use strict";

    function toggleElement() {
        return {
            link: (scope, element, attrs) => {
                element.on("click", () => {
                    // change the icon
                    element.find("i").toggleClass("icon-expand-more icon-expand-less").addClass("icon");
                    // show and hide the content
                    angular.element(document.getElementById(`${attrs.elementId}`)).toggle();
                });
            },
            restrict: "A"
        };
    }

    angular.module("insite-admin")
        .directive("isaToggleElement", toggleElement);
})();
