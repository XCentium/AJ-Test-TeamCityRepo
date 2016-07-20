var insite = insite || {};

insite.adminBridge = function ($) {
    "use strict";
    var that = {};

    that.getAccessToken = {};

    angular.module("insite-admin", ["insite"]);

    angular.module("insite.cmsShell", ["insite-admin"])
        .service("bridgeService", ["adminSessionService", "$rootScope", function (adminSessionService, $rootScope) {
            $rootScope.$on("userLogoutWarning", function () {
                $.get("/ContentAdmin/Shell/UserLogoutWarning", function(htmlResult) {
                    var $htmlResult = $(htmlResult);
                    $htmlResult.find(".cms-actionButton").click(function() {
                        $.loading.show();
                        adminSessionService.refreshAccessToken().then(function () {
                            $.loading.hide();
                            $.modal.close();
                            adminSessionService.resetInactivityTimer();

                        }, function(error) {
                            $.loading.hide();
                            $.modal.close();
                            var errorMessage = error.error || error;
                            alert(errorMessage);
                        });
                    });
                    $htmlResult.modal();
                });
            });

            that.getAccessToken = function () {
                return adminSessionService.getAccessToken();
            }

            that.checkAccessToken = function() {
                return adminSessionService.checkAccessToken();
            }

            that.removeAccessToken = function () {
                return adminSessionService.removeAccessToken();
            }

            that.signOut = function() {
                adminSessionService.signOut().then(function() {
                    window.location = window.location;
                    window.location.reload(true);
                });
            }
        }])
        .run(["bridgeService", function (bridgeService) {
            // force it to initialize
        }]);

    that.setup = function () {
        // the body is already bootstrapped with ng-app and we don't want to move that right now, insite-admin depends on insite, and the storefront uses the insite module
        // these was the only good way to get the above service injected so we could make use of the code
        angular.bootstrap($("head"), ["insite.cmsShell"]);
    }

    return that;
}(jQuery);