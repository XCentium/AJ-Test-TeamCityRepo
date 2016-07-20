module insite_admin {
    "use strict";

    function isaTable() {
        return {
            link: function(scope, element) {
                var $el = $(element),
                    $tableHeader = $el.find(".table-header");

                scope.$on("repeatfinished", () => offSetTableHeader());
                scope.$on("tabselected", () => {
                    if (isInsideActiveTab()) {
                        offSetTableHeader();
                    }
                });

                function offSetTableHeader() {
                    setTableHeaderPaddingRight(0);
                    setTableHeaderRightBorderWidth(1);

                    var headerWidth = getWidthTableHeaderTable();
                    var contentWidth = getWidthOfTableContentRow();

                    if (headerWidth === contentWidth || contentWidth === 0) {
                        setTableHeaderRightBorderWidth(0);
                    } else {
                        headerWidth -= getTableHeaderLeftRightBorderWidth();
                        setTableHeaderPaddingRight(headerWidth - contentWidth);
                    }
                }

                function isInsideActiveTab() {
                    return $el.closest(".finger-tab-content.is-active").length > 0;
                }

                function getTableHeaderLeftRightBorderWidth() {
                    var borderLeftWidth = parseInt($tableHeader.css("border-left-width"), 10), borderRightWidth = parseInt($tableHeader.css("border-right-width"), 10);

                    return borderLeftWidth + borderRightWidth;
                }

                function getWidthTableHeaderTable() {
                    return $tableHeader.find("table").width();
                }

                function getWidthOfTableContentRow() {
                    return $el.find(".table-content table tbody").width();
                }

                function setTableHeaderRightBorderWidth(pixels) {
                    $tableHeader.css("border-right-width", pixels + "px");
                }

                function setTableHeaderPaddingRight(pixels) {
                    $tableHeader.css("padding-right", pixels + "px");
                }
            },
            replace: true,
            restrict: "AE",
            template: '<div class="fixed-table-container grid-block vertical" ng-transclude></div>',
            transclude: true
        };
    }

    function isaTableHeader() {
        return {
            link: function() {},
            replace: true,
            restrict: "AE",
            template: '<section class="table-header flex-none" ng-transclude></section>',
            transclude: true
        };
    }

    function isaTableContent() {
        return {
            link: function() {},
            replace: true,
            restrict: "AE",
            template: `<section class="table-content grid-block"><div ng-class="{ 'grid-block': !entityListCtrl.ditchGridBlocks }" ng-transclude></div></section>`,
            transclude: true
        };
    }

    angular.module("insite-admin")
        .directive("isaTable", isaTable)
        .directive("isaTableHeader", isaTableHeader)
        .directive("isaTableContent", isaTableContent);
}
