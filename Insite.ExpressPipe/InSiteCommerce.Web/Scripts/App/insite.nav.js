var insite = insite || {};

insite.nav = function ($) {
    "use strict";
    var that = {};

    that.uncheckBoxes = function(nav) {
        var navarray = document.getElementsByName(nav);
        for (var i = 0; i < navarray.length; i++) {
            navarray[i].checked = false;
        }
        $("body").removeClass("sidebar-main");
        $(".isc-primary-nav-back").addClass("isc-hidden");
    }

    that.activatePanel = function activatePanel() {
        if (!$("body").hasClass("sidebar-main")) {
            $("body").addClass("sidebar-main");
            $(".isc-primary-nav ul:first").addClass("active-nav");
        }
    }

    that.goToSubnav = function (navArrow) {
        var $activeNav = $(".isc-primary-nav ul.active-nav");
        $activeNav.scrollTop(0);

        $(".isc-primary-nav ul").removeClass("active-nav");

        var self = $(navArrow);
        self.closest("li").find("ul.subnav:first").addClass("active-nav");

        $(".isc-primary-nav-back").removeClass("isc-hidden");
    }

    that.goToMobileSubnav = function (navLink) {
        if ($(".isc-nav-bar label").css("display") != "none") {
            $(navLink).next().click();
            return false;
        }
    }

    that.goBack = function () {
        var $activeNav = $(".isc-primary-nav ul.active-nav");

        $activeNav.closest("li").find(".subnav-check:first").click();

        $activeNav.removeClass("active-nav");
        $activeNav.closest("li").closest("ul").addClass("active-nav");

        !$(".isc-primary-nav ul.active-nav").hasClass("subnav") && $(".isc-primary-nav-back").addClass("isc-hidden");
    }

    that.setup = function () {
        var events = "click.fndtn";
        var $body = $("body");

        // Watch for clicks to close panels
        $(".ex, .ui-lock").on(events, function (e) {
            e.preventDefault();
            $body.removePrefixedClasses("topbar-");
            $("[role='top-panel']").removeAttr("style");
        });

        var mobileDims = false,
            resizeTimer,
            $windowWidth;
        // Watch the grid and indicate small or large grid
        $(window).resize(function () {
            $windowWidth = $(window).width();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {

                if ($("nav ul:not(.side-nav) li a span").css("display") == "none") {
                    mobileDims = true;
                }
                else {
                    mobileDims = false;
                }

                if ($body.hasClass("topbar-search")) {
                    $("[role='top-panel']").attr("style", "max-height:" + $("#searchPanel").outerHeight() + "px");

                    // hide topbar search area and remove max-height for top-panel on desktop
                    if ($windowWidth > 767) {
                        $body.removeClass('topbar-search');
                        $("[role='top-panel']").removeAttr('style');
                    }
                }
                else if ($body.hasClass("topbar-user")) {
                    $("[role='top-panel']").attr("style", "max-height:" + $("#userPanel").outerHeight() + "px");
                }
                else if ($body.hasClass("topbar-isettings")) {
                    $("[role='top-panel']").attr("style", "max-height:" + $("#isettingsPanel").outerHeight() + "px");

                    // hide topbar search area and remove max-height for top-panel on desktop
                    if ($windowWidth > 767) {
                        $body.removeClass('topbar-isettings');
                        $("[role='top-panel']").removeAttr('style');
                    }
                }
                delayOnHover();

                $('.isc-primary-nav ul li ul li ul').removeAttr('style');
            }, 250);

        });

        var attachShowTopbarEvent = function ($button, topbarClass, onclick) {
            $button.on(events, function (e) {
                e.preventDefault();
                $body.removePrefixedClasses("topbar-");
                $body.addClass("topbar-" + topbarClass);
                var panelHeight = $("#" + topbarClass + "Panel").outerHeight();
                $("[role='top-panel']").attr("style", "max-height:" + panelHeight + "px");
                if (typeof (onclick) === "function") {
                    onclick();
                }
            });
        };

        attachShowTopbarEvent($("#searchButton"), "search");
        attachShowTopbarEvent($(".isettings"), "isettings");
        attachShowTopbarEvent($(".user-button"), "user");

        // Switch panels for the paneled nav on mobile
        $("#switchPanels dd").on(events, function (e) {
            e.preventDefault();
            var $this = $(this),
                $switchToPanel = $($this.children("a").attr("href"));
            $this.toggleClass("active").siblings().removeClass("active");
            $switchToPanel.parent().css("left", ($switchToPanel.index() * (-100) + "%"));
        });

        $("#nav li a").on(events, function (e) {
            e.preventDefault();
            var $target = $($(this).attr("href"));
            $("html, body").animate({ scrollTop: $target.offset().top }, 300);
        });

        var ua = navigator.userAgent.toLowerCase();
        var isAndroid = ua.indexOf("android") > -1;
        if (isAndroid) {
            $("*").removeClass("use-fastclick");
        }

        $("#slider").attr("style", "visibility:visible");
        $(".ui-lock").addClass("use-fastclick");

        $(".nav-slide-outer li a").click(function () {
            $(".nav-slide-outer").scrollTop(0);
            if ($(window).scrollTop() > $("[role='primary-nav']").offset().top) {
                $("body,html").scrollTop($("[role='primary-nav']").offset().top);
            }
        });

        var wideNav = function () {
            if ($("body").hasClass("sidebar-main")) {
                $("body").removeClass("sidebar-main");
            }
        }



        // if subnav item goes below window, position it 10px above the bottom of the window
        var navTimeoutDelay = 250;
        $(window).load(function () {
            $('.isc-primary-nav.prevent-li-below-window ul li ul li').on('mouseover touchstart', function () {
                var $this = $(this),
                    $childUl = $this.children('ul');

                // this makes it only fire once on hover, so you can scroll if needed
                if (!$this.hasClass('currently-hovered')) {
                    // Preserve the tree so you can scroll and it wont reposition, but if you come back to the element it will reposition
                    $('.currently-hovered').not($this.parents()).removeClass('currently-hovered');
                    $this.addClass('currently-hovered');
                    // if not mobile, delay for hover delay
                    if (!Modernizr.touch) {
                        setTimeout($.proxy(function () {
                            positionChildUl($this, $childUl)
                        }, this), (navTimeoutDelay + 2))
                    } else {
                        positionChildUl($this, $childUl)
                    }
                }
            });
        });

        // function used to reposition menu items.
        var positionChildUl = function ($thisEl, $childUlEl) {
            // if has children and is not mobile
            if ($childUlEl.length > 0 && $(window).width() > 767) {
                var childUlHeight = $childUlEl.height(),
                    windowHeight = $(window).height(),
                    childUlOffset,
                    belowWindow;

                $childUlEl.removeAttr('style');

                // calculate distance from top of window to the child ul
                childUlOffset = $childUlEl.offset().top - $(document).scrollTop();

                // calculate how much of the nav is below the window (height of menu plus its offset from top of the window, minus the height of the window)
                belowWindow = (childUlHeight + childUlOffset) - windowHeight;

                // if its less than 10 px  from the bottom of the page, place it 10 px from the bottom
                if (belowWindow > -10) {
                    $childUlEl.css({
                        'position': 'absolute',
                        'top': -(belowWindow + 10) + 'px'
                    });
                }
            }
        }

        var delayOnHover = function () {
            // Delay show on hover 
            if (!Modernizr.touch && $(window).width() > 767) {
                // only if the browser doesn't support touch events, so hover will perform normally
                var tOut;
                $('.isc-primary-nav ul li').hover(
                    function () {
                        $(this).children('ul').addClass('hide-item')
                        tOut = setTimeout($.proxy(function () {
                            $(this).children('ul').removeClass('hide-item');
                        }, this), navTimeoutDelay);
                    },
                    function () {
                        clearTimeout(tOut);
                        $(this).children('ul').addClass('hide-item');
                    }
                );
            }
        }
        delayOnHover();

        // move header nav links to main nav, only to display them on mobile. 
        // Doing this action once so it doesn't need to fire and manipulate dom on resize
        var $list = $('.header-zone.rt .widget-linklist.list-horizontal');
        if ($list.length > 0) {
            $('.isc-primary-nav > ul').append('<li class="header-secondary-menu">' + $list.html() + '</li>');
        }
   
        //TODO combine these two? why are there two rules
        enquire.register("screen and (max-width:768px)", {
            unmatch: function () {
                wideNav();
            },
            //TODO probably not needed, we don't even have a setup function
            deferSetup: true 
        });

        enquire.register("screen and (min-width:768px)", {
            match: function () {
                wideNav();
            },
            //TODO probably not needed, we don't even have a setup function
            deferSetup: true
        });
    };

    return that;
}(jQuery);