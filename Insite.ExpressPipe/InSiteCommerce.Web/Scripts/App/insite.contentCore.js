var insite = insite || {};

insite.contentCore = function ($, internal) {
    "use strict";
    var that = {};

    internal.updateAdminShellAction = "updateAdminShell";
    internal.showLoadingAction = "showLoading";
    internal.hideLoadingAction = "hideLoading";
    internal.loadShellModalAction = "loadShellModal";
    internal.loadSlidePanelAction = "loadSlidePanel";
    internal.rearrangeItems = "rearrangeItems";
    internal.saveRearrange = "saveRearrange";

    internal.updateSortOrder = function ($item) {
        var $next = $item.next(".cms-contentItem");
        var $prev = $item.prev(".cms-contentItem");
        var previousSortOrder = null;
        var nextSortOrder = null;
        if ($next.length > 0) {
            nextSortOrder = parseInt($next.attr("data-sortOrder"));
        }
        if ($prev.length > 0) {
            previousSortOrder = parseInt($prev.attr("data-sortOrder"));
        }

        if (nextSortOrder === null && previousSortOrder === null) {
            $item.attr("data-sortOrder", 0);
        } else if (nextSortOrder === null) {
            $item.attr("data-sortOrder", previousSortOrder + 512);
        } else if (previousSortOrder === null) {
            $item.attr("data-sortOrder", nextSortOrder - 512);
        } else {
            var newSortOrder = (previousSortOrder + nextSortOrder) / 2;
            $item.attr("data-sortOrder", newSortOrder);
            if (newSortOrder % 1 !== 0) { //we hit a breaking point where we are not a whole number, renumber all contentItems in this zone
                newSortOrder = 0;
                $item.parent().find(".cms-contentItem").each(function (index, element) {
                    $(element).attr("data-sortOrder", newSortOrder);
                    newSortOrder += 512;
                });
            }
        }
    };

    internal.getUserProfile = function (onComplete) {
        var accessToken = insite.adminBridge.getAccessToken();
        if (accessToken !== "" && accessToken !== null) {
            // TODO SB what about refresh tokens?
            $.ajax({
                url: "/api/v1/admin/userProfiles/current",
                type: "GET",
                headers: { "Authorization": "Bearer " + accessToken },
                success: function(userProfile) {
                    $.ajax({
                        url: "/api/v1/admin/userProfiles(" + userProfile.id + ")/roles",
                        type: "GET",
                        headers: { "Authorization": "Bearer " + accessToken },
                        success: function(roles) {
                            for (var x = 0; x < roles.length; x++) {
                                var role = roles[x].toLowerCase();
                                if (role === "isc_contentadmin") {
                                    userProfile.isUserContentAdmin = true;
                                    userProfile.isUserContentEditor = true;
                                    userProfile.isUserContentApprover = true;
                                } else if (role === "isc_contenteditor") {
                                    userProfile.isUserContentEditor = true;
                                } else if (role === "isc_contentapprover") {
                                    userProfile.isUserContentApprover = true;
                                }
                            }

                            onComplete(userProfile);
                        }
                    });

                },
                error: function() {
                    insite.adminBridge.removeAccessToken();
                }
            });
        } else {
            onComplete(null);
        }

    }

    return that;
};
