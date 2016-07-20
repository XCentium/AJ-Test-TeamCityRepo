var insite = insite || {};

insite.formBuilder = function($) {
    "use strict";
    var that = {};

    that.setupAjaxForm = function ($htmlResult, close, update) {
        $htmlResult.find(".fb-close").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            close();
        });

        that.setupFormValidation($htmlResult.find("form"));

        $htmlResult.find("form").submit(function (e) {
            e.preventDefault();
            var $form = $(this);

            if (!$form.valid()) {
                return;
            }

            $.loading.show();

            $.post($form.attr("action"), $form.serialize(), function (result) {
                if (typeof (result) === "string") {
                    $htmlResult.html($(result).html());
                    that.setupAjaxForm($htmlResult, close);

                    if (jQuery.isFunction(update)) {
                        update();
                    }

                    $.loading.hide(false);
                } else {
                    if (result.Success === true) {
                        close();
                        $.loading.show();
                        window.location.reload(true);
                    }
                }
            });
        });
    };

    that.setupFormValidation = function($form) {
        if ($form.length === 0) {
            return;
        }

        $form.removeData("validator");
        $form.removeData("unobtrusiveValidation");
        $.validator.unobtrusive.parse($form);
        var validator = $.data($form[0], "validator");
        validator.settings.ignore = ""; //we need to validate hidden things, like datepicker, ckeditor
    };

    that.loadModal = function(url) {
        $.loading.show();
        $.get(url, function(htmlResult) {
            var $htmlResult = $(htmlResult);
            that.setupAjaxForm($htmlResult, function() {
                $.loading.hideOverlay();
                $.modal.close();
            }, function() {
                $("#simplemodal-container").css("width", "auto"); //To reset the container.
                $(window).trigger("resize.simplemodal"); //To refresh the modal dialog.
            });

            $htmlResult.modal();
        });
        $.loading.hide(false);
    };

    that.loadSidePanel = function(url) {
        $.loading.show();
        $.get(url, function (htmlResult) {
            var $htmlResult = $(htmlResult);
            that.setupAjaxForm($htmlResult, function () {
                $.loading.hideOverlay();
                $(".fb-sidePanel__content").html("").parent().hide();
                $("html").css("overflow-y", "scroll");
            });

            $(".fb-sidePanel__content").html($htmlResult).parent().show();
            $("html").css("overflow-y", "hidden");
        });
        $.loading.hide(false);
    }

    that.updateSortOrder = function ($item) {
        var zones = [];
        var sortOrder = 0;
        $(".fb-formBuilder .fb-zone").each(function () {
            var $zone = $(this);
            zones.push({
                Name: $zone.data("zone"),
                ParentId: $zone.data("parentid"),
                SortOrder: sortOrder++,
                Children: $.map($zone.find("> .fb-zone__content > .fb-formElement"), function (o, i) {
                    return {
                        FormElementId: $(o).data("id"),
                        SortOrder: i
                    };
                })
            });
        });

        $item.find(".moveHandle, .loading-container").addClass("saving");
        $.post($(".fb-formBuilder").data("reorderurl"), { zones: zones }, function () {
            $item.find(".moveHandle, .loading-container").removeClass("saving");
        });
    };

    that.setup = function() {
        $(".fb-editor").on("click", ".fb-loadSidePanel", function(e) {
            e.preventDefault();
            that.loadSidePanel($(this).attr("href"));
        }).on("click", ".fb-loadModal", function(e) {
            e.preventDefault();
            that.loadModal($(this).attr("href"));
        });

        $(".fb-zone__content").sortable({
            connectWith: ".fb-zone__content",
            placeholder: "ui-sortable-placeholder",
            items: ".fb-formElement",
            update: function (event, ui) {
                that.updateSortOrder(ui.item);
            }
        });

        insite.core.setupAjaxError(function () {
            $.modal.close();
            $.loading.hide();
        });

        insite.core.displayModal = function (html, onClose) {
            $(html).modal({
                overlayClose: true, onClose: function () {
                    if (typeof (onClose) === "function") {
                        onClose();
                    } else {
                        $.modal.close();
                    }
                }
            });
        };

        $(".fb-zone__toggle").click(function () {
            var $fbZone = $(this).parents(".fb-zone:first");
            $fbZone.toggleClass("fb-zone--collapsed");
            if ($fbZone.hasClass("fb-zone--collapsed")) {
                $fbZone.find(".fb-zone__toggle:first").text("+");
            } else {
                $fbZone.find(".fb-zone__toggle:first").text("-");
            }
            
        });
    };

    return that;
}(jQuery);