module insite_admin {
    emitRepeatFinished.$inject = ["$timeout"];

    function emitRepeatFinished($timeout) {
        return {
            restrict: "A",
            link: function(scope) {
                if (scope.$last) {
                    $timeout(function() {
                        scope.$emit("repeatfinished");
                    }, 0);
                }
            }
        };
    }

    angular.module("insite-admin")
        .directive("emitRepeatFinished", emitRepeatFinished);
}
