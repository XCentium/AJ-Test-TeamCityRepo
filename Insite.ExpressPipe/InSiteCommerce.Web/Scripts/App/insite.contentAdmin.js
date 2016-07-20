var insite = insite || {};

insite.contentAdmin = function($) {
    "use strict";
    var internal = {};
    var that = insite.contentCore($, internal);

    var $siteFrame;
    var $shell;
    var windowProxy;

    that.updateShell = function (model) {
        if (typeof (model) === "string") {
            that.shellViewModel = ko.mapping.fromJSON(model, {}, that.shellViewModel);
        } else if (typeof (model) === "object") {
            that.shellViewModel = ko.mapping.fromJS(model, {}, that.shellViewModel);
        }
        $(".makeFancy").trigger("update.fs");
    };

    var reloadShell = function(url) {
        $.loading.show();
        $.post(url, function () {
            that.reloadSiteFrame();
            insite.contentAdmin.tree.update();
            $.loading.hide();
        });
    };

    that.reloadShell = function () {
        var $selectedModeButton = $(".btn-edit.selected, .btn-review.selected");
        if ($selectedModeButton.length === 1) {
            reloadShell($selectedModeButton.attr("href").toLowerCase());
        } else {
            reloadShell($(".btn-edit").attr("href").toLowerCase().replace("editing", "viewing"));
        }
    };

    that.shellViewModel = function() {
        var self = {};

        self.TreeFilters = ko.observableArray();
        self.ContentTree = ko.observable();
        self.ContentTree.Visible = ko.observable($.cookie("ContentTree.Visible") || false);
        self.ContentTree.Expanded = ko.observable(false);
        self.ContentTree.ActiveNode = ko.observable();
        self.ContentTree.ActiveNode({ Key: ko.observable(), MenuUrls: ko.observableArray() });
        self.ContentTree.ExpandedNodes = ko.observableArray();
        self.ContentTreeNodes = ko.observableArray();

        self.UserProfile = ko.observable();
        self.UserProfile.userName = ko.observable();
        self.UserProfile.id = ko.observable();

        self.CurrentContentItem = ko.observable();

        self.ToggleShell = function () {
            $("body").toggleClass("cmsOn");
        };

        self.ToggleFuture = function () {
            $(".publish-date-time").toggleClass("open");
        };

        self.UpdateContext = function () {
            $.loading.show();
            $.ajaxPostJson($shell.attr("data-updateContextAction"), { languageId: self.CurrentLanguageId(), personaId: self.CurrentPersonaId(), deviceType: self.CurrentDeviceType() }, function () {
                that.reloadSiteFrame();
            });
        };

        self.ViewPageWithContext = function (pageState) {
            self.CurrentLanguageId(pageState.LanguageId());
            self.CurrentPersonaId(pageState.PersonaId());
            self.CurrentDeviceType(pageState.DeviceType());
            $(".makeFancy").trigger("update.fs");
            self.UpdateContext();
        }

        self.RemoveFilter = function(filter) {
            self.TreeFilters.remove(filter);
        };

        self.ClearFilters = function() {
            self.TreeFilters.removeAll();
        }

        self.AddFilter = function (filter) {
            for (var x = 0; x < self.TreeFilters().length; x++) {
                var existingFilter = self.TreeFilters()[x];
                if (existingFilter.Type === filter.Type && existingFilter.Key === filter.Key && existingFilter.Value === filter.Value) {
                    return;
                }
            }

            self.TreeFilters.push(filter);
        };

        self.ContentTree.Visible.subscribe(function (value) {
            $.cookie("ContentTree.Visible", value.toString());
        });

        self.BearerToken = ko.observable();

        return self;
    }();

    that.confirm = function(message, okCallback, cancelCallback) {
        if (confirm(message)) {
            if (typeof (okCallback) === "function") {
                okCallback();
            }
        } else {
            if (typeof (cancelCallback) === "function") {
                cancelCallback();
            }
        }
    };

    that.refreshShell = function () {
        $.get($shell.attr("data-refreshUrl"), function (jsonResult) {
            that.updateShell(jsonResult);
            $.loading.hide();
        });
    };

    that.reloadSiteFrame = function () {
        that.loadFrameUrl(that.getFrameUrl());
        that.refreshShell();
    };

    that.getFrameUrl = function () {
        var contentDocument = $siteFrame[0].contentDocument;
        if (contentDocument === null || typeof (contentDocument) === "undefined") {
            return "/";
        }
        return contentDocument.location.pathname + contentDocument.location.search;
    };

    that.loadIfNewUrl = function(potentialUrl) {
        if (potentialUrl !== null && potentialUrl !== "" && potentialUrl.toLowerCase() !== that.getFrameUrl().toLowerCase()) {
            that.loadFrameUrl(potentialUrl);
        }
    };

    that.loadFrameUrl = function (frameUrl) {
        try {
            var document = $siteFrame[0].contentWindow.document;
            document.open();
            document.write("<html></html>");
            document.close();
            $siteFrame[0].contentWindow.location.replace(frameUrl);
        } catch (e) {
            $siteFrame.attr("src", frameUrl);
        }
    };

    that.getHashedFrameUrl = function () {
        return window.location.hash.replace("#/frameUrl=", "");
    }

    that.setupFrameLoading = function () {
        window.onpopstate = function (e) {
            var frameUrl = that.getHashedFrameUrl();
            if (frameUrl !== "" && frameUrl !== that.getFrameUrl()) {
                that.loadFrameUrl(frameUrl);
            }
        };
        //TODO CMS 3.7.1 we can make it nicer with this http://stackoverflow.com/questions/17315013/detect-when-an-iframe-starts-to-load-new-url
        $siteFrame.load(function (e) {
            internal.getUserProfile(function(userProfile) {
                if (userProfile === null || typeof(userProfile) === "undefined") {
                    that.redirectToSignIn();
                    return;
                }
            });

            //TODO CMS 3.7.1 can we just reload on certain conditions?
            that.refreshShell();
            var loadedFrameUrl = that.getFrameUrl();
            if (loadedFrameUrl.toLowerCase().indexOf("/contentadmin") >= 0)
                return;
            var hashFrameUrl = that.getHashedFrameUrl();
            if (hashFrameUrl !== loadedFrameUrl) {
                history.replaceState(null, null, "#frameUrl=" + loadedFrameUrl);
            }
            $.loading.hide();
        });

        //for page reloads, we have to pull the frameUrl out of the query string
        var reloadFrameUrl = that.getHashedFrameUrl();
        if (reloadFrameUrl !== "") {
            that.loadFrameUrl(reloadFrameUrl);
        } else {
            that.loadFrameUrl($shell.attr("data-homePage"));
        }
    };

    that.setupIFrameCommunication = function() {
        windowProxy = new Porthole.WindowProxy("/scripts/libraries/porthole/proxy.html", "siteIFrame");
        windowProxy.addEventListener(function (messageEvent) {
            switch (messageEvent.data.action) {
                case internal.updateAdminShellAction:
                    insite.contentAdmin.updateShell(messageEvent.data.value);
                    break;
                case internal.showLoadingAction:
                    $.loading.show();
                    break;
                case internal.hideLoadingAction:
                    $.loading.hide();
                    break;
                case internal.loadShellModalAction:
                    that.loadShellModal(messageEvent.data.value.url);
                    break;
                case internal.loadSlidePanelAction:
                    that.loadSlidePanel(messageEvent.data.value.url);
                    break;
                default:
                    console.log("Nothing set up to handle action" + messageEvent.data.action + " value: " + messageEvent.data.value);
                    break;
            }
        });
    };

    that.isCustomErrorEnabled = function () {
        return $("html").attr("data-isCustomErrorEnabled").toLowerCase() === "true";
    };

    that.setupFormValidation = function ($form) {
        if ($form.length === 0) {
            return;
        }
        $form.removeData("validator");
        $form.removeData("unobtrusiveValidation");
        $.validator.unobtrusive.parse($form);
        var validator = $.data($form[0], "validator");
        validator.settings.ignore = ""; //we need to validate hidden things, like datepicker, ckeditor
    }

    var setupPanel = function ($htmlResult, close, update) {
        $htmlResult.find("select").fancySelect();
        var $ckeditorTextAreas = $htmlResult.find(".ckeditor");
        if ($ckeditorTextAreas.length > 0) {
            $ckeditorTextAreas.ckeditor(function () {
                var editor = this;
                CKFinder.setupCKEditor(editor, "/Scripts/Libraries/ckfinder/2.4.1/", "UserFiles");
                editor.setReadOnly($ckeditorTextAreas.hasClass("readonly"));
            });
            //TODO CMS 3.7.1 review what buttons should be added back in.
        }

        insite.core.datepicker($htmlResult.find(".isc-datepicker"));
        insite.core.timepicker($htmlResult.find(".isc-timepicker"));

        $htmlResult.find(".cms-close").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            close();
        });

        that.setupFormValidation($htmlResult.find("form"));

        if ($htmlResult.hasClass("cms-publishModal")) {
            var flipVariantState = function ($checkbox) {
                if ($checkbox.is(":checked")) {
                    $checkbox.parent().find("input[type=hidden]").prop("disabled", false);
                } else {
                    $checkbox.parent().find("input[type=hidden]").prop("disabled", true);
                }
            }
            $htmlResult.find(".cms-publishVariantToggle").click(function (e) {
                var $this = $(this);
                flipVariantState($this);
            }).each(function() {
                flipVariantState($(this));
            });

            $htmlResult.find("form").submit(function (e) {
                var $form = $(this);
                var formatDate = insite.core.dateTimeFormat.toLowerCase().replace("yyyy", "yy");
                var PublishOn_Date_String = $form.find("[name=PublishOn_Date]").val();
                PublishOn_Date_String = PublishOn_Date_String ? $.datepicker.parseDate(formatDate, PublishOn_Date_String.trim()).toDateString() : "";
                $form.find("[name=PublishOn]").val(PublishOn_Date_String + " " + $form.find("[name=PublishOn_Time]").val());
            });
        }
        else if ($htmlResult.hasClass("cms-reorderModal")) {
            $htmlResult.find(".cms-reorderList").sortable({
                connectWith: ".cms-reorderList",
                placeholder: "ui-sortable-placeholder",
                update: function (event, ui) {
                    internal.updateSortOrder(ui.item);

                    $htmlResult.find(".cms-reorderList").each(function() {
                        var $this = $(this);
                        if ($this.find("li:not(.cms-emptyPlaceHolder)").length === 0) {
                            $this.addClass("cms-emptyList");
                        } else {
                            $this.removeClass("cms-emptyList");
                        }
                    });
                    $(".cms-rootReorderList").removeClass("cms-sortingActive");
                },
                start: function() {
                    $(".cms-rootReorderList").addClass("cms-sortingActive");
                },
                beforeStop: function (ev, ui) {
                    var $droppedItem = $(ui.item);
                    var droppedItemType = $droppedItem.attr("data-contentType");
                    var $dropContainer = $(ui.placeholder).closest(".cms-contentItem");
                    var dropContainerType = $dropContainer.attr("data-contentType");

                    if (($droppedItem.hasClass("ap-Any") || $droppedItem.hasClass("ap-" + dropContainerType)) &&
                        ($dropContainer.hasClass("ac-Any") || $dropContainer.hasClass("ac-" + droppedItemType)))
                        return;

                    $(this).sortable("cancel");
                }
            });

            $htmlResult.find(".cms-saveButton").click(function (e) {
                e.preventDefault();
                var pages = [];
                $.loading.show($(e.target).hasClass("overlay-on-top"));
                $htmlResult.find(".cms-contentItem").each(function () {
                    var $item = $(this);
                    pages.push({
                        ContentKey: $item.attr("data-contentKey"),
                        Children: $.map($item.find("> > .cms-contentItem"), function (o) {
                            return {
                                ContentKey: $(o).attr("data-contentKey"),
                                SortOrder: $(o).attr("data-sortOrder")
                            };
                        })
                    });
                });

                $(this).ajaxPostJson(pages, function (result) {
                    if (result.Success === true) {
                        close();
                        that.reloadSiteFrame();
                    }
                });
            });

        }
        var $submitButton;
        $htmlResult.find("form").find("button[type=submit],input[type=submit]").click(function (e) {
            $submitButton = $(this);
        });
        $htmlResult.find("form").submit(function (e) {
            e.preventDefault();
            var $form = $(this);

            var $iscDateWrap = $(".isc-datewrap");
            $iscDateWrap.each(function() {
                var $this = $(this);

                var dateValue = $this.find(".isc-datepicker").val();
                $this.find(".isc-datetimevalue").val(dateValue);
                if (dateValue === "") //short circuit if there is no date, so the required validation works
                    return;

                if ($this.find(".isc-timepicker").length > 0) {
                    $this.find(".isc-datetimevalue").val(dateValue + " " + $this.find(".isc-timepicker").val());
                }

            });

            //using switchbar for ckeditor recreates the ckeditor when you switch modes, we need to ensure we set the textarea value from the active instance of ckeditor
            $ckeditorTextAreas.each(function () {
                var $this = $(this);
                $this.val(CKEDITOR.instances[$this.attr("id")].getData());
            });

            if (!$form.valid()) {
                return;
            }
            $.loading.show();
            var formData = $form.serialize();
            if (typeof ($submitButton) !== "undefined") {
                formData += "&" + $submitButton.attr("name") + "=" + $submitButton.val();
            }
            $.post($form.attr("action"), formData, function (result) {
                if (typeof (result) === "string") {
                    var $slidePanel = $("#cms-slidePanel");
                    var currentScroll = $slidePanel.scrollTop();
                    $htmlResult.html($(result).html());
                    setupPanel($htmlResult, close);
                    $slidePanel.scrollTop(currentScroll);
                    setTimeout(function() {
                        $slidePanel.scrollTop(currentScroll);
                    }, 10);

                    if (jQuery.isFunction(update))
                        update();

                    $.loading.hide(false);
                } else {
                    if (result.Success === true) {
                        close();

                        if (result.reloadShell === true) {
                            that.reloadShell();
                        } else {
                            if (typeof (result.Url) === "string") {
                                that.loadFrameUrl(result.Url);
                            } else {
                                that.reloadSiteFrame();
                            }
                        }
                    } else if (result.ReloadShell === true) {
                            that.reloadShell();
                    }
                    //TODO CMS 3.7.1 if result.success == false then what?
                }
            });
        });
    }

    that.loadSlidePanel = function (url) {
        var $slidePanel = $("#cms-slidePanel");
        var hidePanel = function() {
            $.loading.hideOverlay();
            $slidePanel.removeClass("open");
            //TODO CMS 3.7.1 we probably don't always want to reload the tree here
            insite.contentAdmin.tree.update();
        }

        $.loading.show();
        $.get(url, function(htmlResult) {
            var $htmlResult = $(htmlResult);
            setupPanel($htmlResult, hidePanel);
            $slidePanel.find(".cms-wrapper").html($htmlResult);
            $slidePanel.addClass("open");
            $.loading.hide(false);
            $.loading.showOverlay();
            $slidePanel.scrollTop(0);
            $slidePanel.css("overflow-y", "hidden");
            setTimeout(function () {
                $slidePanel.scrollTop(0).css("overflow-y", "auto");
            }, 50);
            $slidePanel.resizable({
                handles: 'w',
                start: function () {
                    $("iframe").css('z-index', '-1').css('position', 'relative');
                },
                stop: function () {
                    $("iframe").css('z-index', '0').css('position', 'static');
                }
            });
            $slidePanel.find(".ui-resizable-w").css("height", $(window).height() + 'px');
            $(window).resize(function () {
                $slidePanel.find(".ui-resizable-w").css("height", $(window).height() + 'px');
            });
        });
    };

    that.loadShellModal = function (url) {
        $.loading.show();
        //TODO CMS 3.7.1 when you publish in the future, then go in and clear the future publish date, you end up with two overlays on the page, simplemodal + pageoverlay, which makes things much darker
        $.get(url, function (htmlResult) {
            var $htmlResult = $(htmlResult);
            setupPanel($htmlResult, function () {
                $.loading.hideOverlay();
                $.modal.close();
                //TODO CMS 3.7.1 we probably don't always want to reload the tree here
                insite.contentAdmin.tree.update();
            }, function() {
                $("#simplemodal-container").css("width", "auto"); //To reset the container.
                $(window).trigger("resize.simplemodal");           //To refresh the modal dialog.
            });
            $htmlResult.modal({
                focus: false //if we auto focus on something with a datepicker, then the datepicker opens up immediately and that is weird
            });

            var $previewLink = $(".btn-preview");
            if ($previewLink.length > 0) {
                $htmlResult.find($previewLink.attr("href", $previewLink.attr("href") + "&access_token=" + insite.adminBridge.getAccessToken()));
            }

            $.loading.hide();
            if ($('.simplemodal-wrap').height() > $(window).height()) {
                $('.cms-reorderModal .cms-rootReorderList').css('max-height', ($(window).height() * 0.6 ) + 'px');
            }
            $(window).trigger("resize.simplemodal");
        });
    };

    var setupShellEvents = function () {
        $("#cms-shell").on("click", ".cms-shellHeader .btn-edit, .btn-review", function(e) {
            e.preventDefault();
            $.loading.show();
            var $this = $(this);
            var url = $this.attr("href");
            if ($this.hasClass("selected")) {
                url = url.toLowerCase().replace("reviewing", "viewing").replace("editing", "viewing");
            }
            reloadShell(url);
        }).on("click", ".iframeNav", function(e) {
            e.preventDefault();
            that.loadFrameUrl($(this).attr("href"));
        }).on("click", ".cms-loadSlidePanel", function(e) {
            e.preventDefault();
            that.loadSlidePanel($(this).attr("href"));
        }).on("click", ".cms-loadShellModal", function(e) {
            e.preventDefault();
            that.loadShellModal($(this).attr("href"));
        }).on("click", ".btn-rearrangeItems", function(e) {
            e.preventDefault();
            $.loading.show();
            $.get($(this).attr("href"), function (result) {
                if (typeof (result) === "string") {
                    //TODO CMS 3.7.1 we should overload the loadShellModal function for this
                    var $htmlResult = $(result);
                    setupPanel($htmlResult, function () {
                        $.loading.hideOverlay();
                        $.modal.close();
                        //TODO CMS 3.7.1 we probably don't always want to reload the tree here
                        insite.contentAdmin.tree.update();
                    });
                    $htmlResult.modal();
                    $.loading.hide();
                } else {
                    $.loading.hide();
                    that.shellViewModel.RearrangingPage(true);
                    windowProxy.post({ action: internal.rearrangeItems });
                }
            });
        }).on("click", ".btn-cancelRearrange", function(e) {
            e.preventDefault();
            that.shellViewModel.RearrangingPage(false);
            that.reloadSiteFrame();
        }).on("click", ".btn-saveRearrange", function(e) {
            e.preventDefault();
            that.shellViewModel.RearrangingPage(false);
            windowProxy.post({ action: internal.saveRearrange, url: $(this).attr("href") });
        }).on("click", ".cms-user", function (e) {
            e.stopPropagation();
            $(".cms-user").toggleClass("expanded");
        }).on("click", ".cms-user a", function (e) {
            e.stopPropagation();
        }).on("change.fs", ".view-context select", function (e) {
            var $this = $(this);
            var value = $this.val();
            //TODO CMS 3.7.1 ugly, but fancyselect doesn't appear to play nice with KO
            if ($this.parent().hasClass("sel-lang")) {
                if (value !== that.shellViewModel.CurrentLanguageId()) {
                    that.shellViewModel.CurrentLanguageId(value);
                    that.shellViewModel.UpdateContext();
                }
            }
            else if ($this.parent().hasClass("sel-persona")) {
                if (value !== that.shellViewModel.CurrentPersonaId()) {
                    that.shellViewModel.CurrentPersonaId(value);
                    that.shellViewModel.UpdateContext();
                }
            }
            else if ($this.parent().hasClass("sel-device")) {
                if (value !== null && value !== that.shellViewModel.CurrentDeviceType()) { //this needed a little hacky to not sure it didn't loop forever trying to switch it to a null value
                    that.shellViewModel.CurrentDeviceType(value);
                    that.shellViewModel.UpdateContext();
                }
            }
        }).on("click", ".btn-variants", function (e) {
            e.stopPropagation();
            $(".variant-panel").toggleClass("active");
        }).on("click", ".variant-panel", function(e) {
            e.stopPropagation();
        }).on("click", ".sign-out", function(e) {
            e.preventDefault();
            insite.adminBridge.signOut();
        });

        $(document).click(function () {
            $(".variant-panel").removeClass("active");
            $(".cms-user").removeClass("expanded");
        });
    };

    that.redirectToSignIn = function () {
        if (insite.adminBridge.getAccessToken()) {
            // for prevent infinite redirect loop if user signed in admin console and has no permissions to edit content
            window.location = "/admin/";
        } else {
            window.location = "/admin/signin?returnUrl=" + window.location.pathname + encodeURIComponent(window.location.search);
        }
    }

    that.setup = function (options) {
        setupShellEvents();

        $.ajaxSetup({
            cache: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + insite.adminBridge.getAccessToken());
                insite.adminBridge.checkAccessToken();
            }
        });

        $shell = $("#cms-shell");
        $siteFrame = $shell.find(".siteFrame iframe");

        that.setupFrameLoading();
        that.setupIFrameCommunication();
        insite.core.setupAjaxError(function () {
            $.modal.close();
            $.loading.hide();
        }, function () {
            // TODO SB what about refresh tokens?
            // TODO SB after getting next refresh token then do that.shellViewModel.BearerToken(insite.adminBridge.getAccessToken());
            that.redirectToSignIn();
        });
        insite.core.displayModal = function (html, onClose) {
            $(html).modal({overlayClose: true, onClose: function() {
                if (typeof (onClose) === "function") {
                    onClose();
                } else {
                    $.modal.close();
                }
            }});
        };

        $(".makeFancy").fancySelect();

        internal.getUserProfile(function (userProfile) {
            if (userProfile === null || typeof(userProfile) === "undefined") {
                that.redirectToSignIn();
                return;
            }

            that.shellViewModel.UserProfile.userName(userProfile.userName);
            that.shellViewModel.UserProfile.id(userProfile.id);
            that.shellViewModel.BearerToken(insite.adminBridge.getAccessToken());

            options.nodeMenuParameters.AllowAddLink = options.nodeMenuParameters.AllowAddLink && userProfile.isUserContentEditor;
            options.nodeMenuParameters.AllowModification = userProfile.isUserContentEditor;
            options.nodeMenuParameters.AllowDelete = userProfile.isUserContentApprover;

            insite.contentAdmin.tree.setup({ shell: $shell, nodeMenuParameters: options.nodeMenuParameters });
        });
    };

    return that;
}(jQuery);