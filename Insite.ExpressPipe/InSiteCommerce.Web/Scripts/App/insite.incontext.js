var insite = insite || {};

insite.incontext = function ($) {
    "use strict";
    var internal = {};
    var that = insite.contentCore($, internal);
    var windowProxy = new Porthole.WindowProxy("/scripts/libraries/porthole/proxy.html");
    windowProxy.addEventListener(function (messageEvent) {
        switch (messageEvent.data.action) {
            case internal.rearrangeItems:
                $(".cms-rearrangeable").addClass("cms-rearrangingItems").find(".cms-zone").sortable({
                    handle: ".cms-moveHandle",
                    connectWith: ".cms-zone",
                    placeholder: "ui-sortable-placeholder",
                    cursorAt: { right: 10, top: 10 },
                    update: function (event, ui) {
                        internal.updateSortOrder(ui.item);
                    }
                });
                break;
            case internal.saveRearrange:
                that.showLoading();
                var zones = [];
                $(".cms-zone").each(function () {
                    var $zone = $(this);
                    zones.push({
                        Zone: $zone.attr("data-zone"),
                        ContentItemId: $zone.attr("data-contentItemId"),
                        Children: $.map($zone.find("> .cms-contentItem"), function (o) {
                            return {
                                ContentItemId: $(o).attr("data-contentItemId"),
                                SortOrder: $(o).attr("data-sortOrder")
                            };
                        })
                    });
                });

                $.ajax({
                    url: messageEvent.data.url,
                    type: "POST",
                    headers: { "Authorization": "Bearer " + insite.adminBridge.getAccessToken() },
                    data: JSON.stringify(zones),
                    contentType: "application/json; charset=utf-8",
                    success: function () {
                        that.hideLoading();
                        window.location = window.location;
                    }
                });
                break;
            default:
                console.log("Nothing set up to handle action" + messageEvent.data.action + " value: " + messageEvent.data.value);
                break;
        }

    });

    that.showLoading = function () {
        windowProxy.post({
            action: internal.showLoadingAction
        });
    };

    that.hideLoading = function () {
        windowProxy.post({
            action: internal.hideLoadingAction
        });
    };

    that.updateAdminShell = function (adminShellModel) {
        windowProxy.post({
            action: internal.updateAdminShellAction,
            value: adminShellModel
        });
    };

    that.loadShellModal = function (url) {
        windowProxy.post({
            action: internal.loadShellModalAction,
            value: { url: url }
        });
    };

    that.loadSlidePanel = function (url) {
        windowProxy.post({
            action: internal.loadSlidePanelAction,
            value: { url: url }
        });
    };

    that.checkPopupOverlap = function (popup) {
        var popupTop = popup.offset().top;
        if (popupTop < 0) {
            popup.addClass("pushDown");
            return;
        }
        var headerOffset = $("#header").offset();
        if (headerOffset) {
            var headerTop = headerOffset.top;
            if (headerTop > popupTop && ((headerTop - popupTop) < popup.height())) {
                popup.addClass("pushDown");
            }
        }
    };

    that.setup = function (options) {
        var isInEditOrReviewMode = options.contentMode === "Editing" || options.contentMode === "Reviewing";
        if (isInEditOrReviewMode) {
            internal.getUserProfile(function (userProfile) {
                if (typeof(userProfile) === "undefined" || userProfile === null || (!userProfile.isUserContentEditor && !userProfile.isUserContentApprover)) {
                    $.removeCookie("cms_CurrentContentMode", { path: "/" });
                }
            });
        }

        var shellAlreadyLoaded = (window.parent != null && window.parent.location.toString().toLowerCase().indexOf("/contentadmin") !== -1);

        if (!shellAlreadyLoaded && window.innerWidth <= 1024) {
            return;
        }

        //if the shell is not yet loaded
        if (window.parent === null || window.location === window.parent.location) {
            internal.getUserProfile(function(userProfile) {
                if (userProfile && (userProfile.isUserContentEditor || userProfile.isUserContentApprover)) {
                    var $button = $(".cms-shell-controls button");
                    $button.click(function(e) {
                        window.location = options.cmsShellLoadUrl;
                    }).parent().show();
                }
            });
            if (isInEditOrReviewMode) {
                window.location = options.cmsShellLoadUrl;
            }
        }
        //if current action prefix is not in ContentAdmin, reload
        else if (window.parent.location.toString().toLowerCase().indexOf((insiteMicrositeUriPrefix + "/contentadmin").toLowerCase()) === -1) {
            window.parent.location = options.cmsShellLoadUrlWithoutPersona;
        }
        else {
            insite.incontext.updateAdminShell(options.shellModel);
            insite.predefinedContentEditor.setup(options.contentMode);

            $(".cms-displayInfo").click(function (e) {
                e.preventDefault();
                var container = $(this).parents(".cms-contentItemInfo").toggleClass("cms-showInfoPop");
                if (container.hasClass("cms-showInfoPop")) {
                    that.checkPopupOverlap(container.find(".cms-infoPop"));
                }
            });
            $(".cms-closeInfo").click(function (e) {
                e.preventDefault();
                var $el = $(this).parents(".cms-contentItemInfo").removeClass("cms-showInfoPop");
                $el.find(".cms-infoPop").removeClass("pushDown");
            });
            $(".cms-loadShellModal").click(function (e) {
                e.preventDefault();
                that.loadShellModal($(this).attr("href"));
            });
            $(".cms-loadSlidePanel").click(function (e) {
                e.preventDefault();
                that.loadSlidePanel($(this).attr("href"));
            });
        }
    };

    return that;
}(jQuery);