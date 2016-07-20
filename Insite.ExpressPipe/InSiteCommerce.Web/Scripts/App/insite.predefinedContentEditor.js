var insite = insite || {};

insite.predefinedContentEditor = function ($) {
    "use strict";

    var internal = {};
    var that = insite.contentCore($, internal);
    var windowProxy = new Porthole.WindowProxy("/scripts/libraries/porthole/proxy.html");

    that.setup = function(contentMode) {
        $("body").addClass("isc-editing");
        that.toggleEditingStyles(contentMode === "Editing");
    };

    that.toggleEditingStyles = function (isEditing) {
        if (isEditing) {
            $("body").addClass("isc-edit-on")
                .on("click", ".isc-content-block,.isc-unapprovedcontent-block", function(e) {
                e.preventDefault();
                e.stopPropagation();

                var $this = $(this);
                windowProxy.post({
                    action: internal.loadSlidePanelAction,
                    value: {
                        url: "/contentadmin/predefinedcontent/edit?contentmanagerid=" +
                            $this.attr("data-contentmanagerid") + "&name=" + $this.attr("data-contentmanagername")
                    }
                });
            });
        } else {
            $("body").removeClass("isc-edit-on");
            $(".isc-content-block,.isc-unapprovedcontent-block").unbind("click");
        }
    };

    return that;
}(jQuery);
