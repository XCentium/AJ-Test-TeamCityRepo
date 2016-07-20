(function () {
    "use strict";

    isPopupClickOverride.$inject = ["FoundationApi"];

    /**
     * Overrides Foundation's popup click functionality with our own implementation.
     * NOTE: This will override Foundations event listeners!
     * @returns {{link: link, restrict: string}}
     */
    function isPopupClickOverride(foundationApi) {
        return {
            link: function (scope, element, attrs) {
                scope.isActive = false;

                //Remove Foundation's click event on the element
                element.off("click");

                var target = attrs.zfPopupToggle;
                var id = attrs.id || foundationApi.generateUuid();
                attrs.$set("id", id);

                function registerListener() {
                    document.body.addEventListener("click", listenerLogic);
                }

                function deregisterListener() {
                    document.body.removeEventListener("click", listenerLogic);
                }

                function listenerLogic(e) {
                    var el = e.target;
                    var insidePopup = false;

                    do {
                        if (el.id && el.id === target) {
                            insidePopup = true;
                            break;
                        }

                    } while ((el = el.parentNode));

                    var isToggleElement = (e.target.attributes["zf-popup-toggle"] && e.target.attributes["zf-popup-toggle"].value === target)
                        || (e.target.parentNode && e.target.parentNode.attributes["zf-popup-toggle"] && e.target.parentNode.attributes["zf-popup-toggle"].value === target);
                    if ((insidePopup && isToggleElement) || (!insidePopup && !isToggleElement)) {
                        foundationApi.publish(target, ["hide", id]);
                        deregisterListener();
                        scope.isActive = false;
                        scope.$apply();
                    }
                }

                element.on("click", onClick);

                function onClick(e) {
                    scope.isActive = !scope.isActive;

                    foundationApi.publish(target, ["toggle", id]);
                    e.preventDefault();

                    if (scope.isActive) {
                        registerListener();
                    } else {
                        deregisterListener();
                    }
                }
            },
            restrict: "A",
            scope: true
        };
    }

    angular.module("insite-admin")
        .directive("isPopupClickOverride", isPopupClickOverride);
})();
