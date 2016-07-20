var insite = insite || {};

insite.core = function($) {
    "use strict";
    var that = {};

    that.displayModal = function (html, onClose) {
        var $html = $(html);
        if ($html.parents("body").length === 0) {
            $html.appendTo($("body"));
        }
            
        $html.foundation("reveal", "open");
        $(document).on("closed", $html, function () {
            $html.remove();
            if (typeof onClose === "function") {
                onClose();
            }
        });
    };

    that.closeModal = function ($modal) {
        $modal.find(".close-reveal-modal").click();
    };

    that.setupPunchoutKeepAlive = function() {
        setInterval(function() { $.post("/Punchout/punchoutsessionstatus.isch"); }, 900000);
    };

    that.checkForIFrame = function () { //used to bust out of iframes for pdass compliance
        try {
            if (window.parent != null && window.location != window.parent.location && window.parent.location.pathname.toLowerCase().indexOf("/contentadmin") < 0) {
                top.location = self.location.href;
            }
        } catch (e) {
            console.log("Problem trying to check for iframe busting, this is usually a problem with http vs https or cross domain origin");
            console.log(e);
        } 
    };

    that.isCustomErrorEnabled = function() {
        return $("html").attr("data-isCustomErrorEnabled").toLowerCase() === "true";
    };

    that.dateTimeFormat = "";
    that.refreshSelect = function($select) {

    };

    that.highlightMatches = function(match, search) {
        var terms = search.split(" ");
        for (var i = 0; i < terms.length; i++)
            terms[i] = "^" + terms[i] + "|" + " " + terms[i];
        var re = new RegExp("(" + terms.join("|") + ")", "gi");
        return match.replace(re, "<strong>$1<\/strong>");
    };

    that.datepicker = function(selector, onCloseCallback, onSetCallback) {
        if (typeof (selector) === "string")
            selector = $(selector);

        selector.each(function() {
            if (that.dateTimeFormat === "") {
                console.log("insite.core.dateTimeFormat has not been initialized to the format expected by the server");
                return;
            }
            var $this = $(this);
            $this.pickadate({
                format: that.dateTimeFormat.toLowerCase(),
                formatSubmit: that.dateTimeFormat.toLowerCase(),
                selectYears: true,
                onOpen: function() {
                    $this.blur();
                },
                onClose: function() {
                    $this.blur();
                    if (onCloseCallback != undefined)
                        onCloseCallback();
                },
                onSet: function() {
                    if (onSetCallback != undefined)
                        onSetCallback();
                },
                min: that.pickadateMinMax($this.attr("data-minDate")),
                max: that.pickadateMinMax($this.attr("data-maxDate"))
            });
        });
    };

    that.pickadateMinMax = function (data) {
        // pickadate allows min/max values of undefined, int (ie. 30 days), or a date which should be passed in according to javascript "new Date()" documentation
        if (typeof data === "undefined") return data;
        return isNaN(data) ? new Date(data) : Number(data);
    };

    that.timepicker = function(selector) {
        if (typeof (selector) === "string")
            selector = $(selector);

        selector.pickatime();
    };

    that.setupAjaxError = function (onClose, on401) {
        $(document).ajaxError(function (e, jqxhr, settings, exception) {
            if (settings.error) { //for ajax calls that already have an error function defined, we don't want to show the error below
                return;
            }
            if (jqxhr.status === 401) { //for ajax requests after the login has expired, this will redirect to the login page with the proper return url
                if (typeof (on401) === "function") {
                    on401();
                } else {
                    window.location = window.location;
                }
            } else {
                if (jqxhr.status >= 500  && jqxhr.responseText != "") {
                    if (!that.isCustomErrorEnabled()) {
                        var width = $(window).width() - 120;
                        if (typeof ($.modal) !== "undefined") {
                            $.modal.close();
                        }
                        that.displayModal("<div class='reveal-modal cms-modal' style='width: " + width + "px' data-reveal><button class='simplemodal-close button' style='float: right;'>X</button><div class='modal-wrap'><iframe id='errorFrame' style='width: 100%; height: 800px;'></iframe><a class='close-reveal-modal'>&#215;</a></div></div>", onClose);
                        var iframeDocument = document.getElementById("errorFrame").contentWindow.document;
                        iframeDocument.open();
                        iframeDocument.write(jqxhr.responseText);
                        iframeDocument.close();
                    } else {
                        alert(insite.core.generalErrorText);
                    }
                }
            }
        });
    };

    that.changeSortBy = function(obj) {
        var form = document.getElementById("paramForm");
        form.page.value = "1";
        form.sortby.value = obj.options[obj.selectedIndex].value;
        form.submit();
    };


    that.number = function (value, decimals) {
        if (isNaN(value)) { return 0; }
        return that.round(value, decimals);
    };

    that.round = function (value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    };
    
    that.setup = function() {
       
        $.ajaxSetup({
            type: "POST",
            cache: false
        });

        // validate that entry in all numeric text boxes is a number - put the class numerictextbox on all quantity inputs
        $(document).on("keydown", ".numerictextbox", function(event) {
            // Allow backspace, delete, enter, tab, arrows
            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 13 || event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39) {
                // let it happen, don't do anything 
            } else {
                // Ensure that it is a number or stop the keypress
                if ((event.keyCode < 48 || event.keyCode > 57) &&
                    (event.keyCode < 96 || event.keyCode > 105) &&
                    event.keyCode != 188 && event.keyCode != 190) {
                    event.preventDefault();
                }
            }
        });

        $(".paginator a").click(function() {
            $("#page").val($(this).attr("page"));
        });

        if (typeof ($.Autocomplete) !== "undefined" && typeof ($.Autocomplete.formatResult) !== "undefined") {
            // responsive autocomplete
            $.Autocomplete.formatResult = function(suggestion, currentValue) {
                return that.highlightMatches(suggestion.value, currentValue);
            };
        }

        // Select text inside text box for all Quantity
        // Add this behavior to all text fields
        $("input:text.qty").focus(function() {
            // Select field contents
            this.select();
        });

        that.setupAjaxError();

        $(":input[placeholder]").placeholder();
    };

    // remove reveal animation on mobile so popups work in IOS chrome
    if (Modernizr.touch) {
        $(document).foundation('reveal', { animation: false });
    }

    // From the Foundation 4 to 5, the section functionality was removed
    // this code emulates the functionality.

    $('body').on('click', '.section-container .title', function () {
        var $this = $(this),
            $thisParent = $this.closest('section');

        if ($thisParent.hasClass('active')) {
            $thisParent.removeClass('active');
        } else {
            $thisParent.addClass('active');
        }
    });

    $(window).load(function() {
        var flexIndex,
            flexTotal;
        $('.flexslider').each(function(i, el) {
            var animationSpeed = $(el).data('animation_speed');
            var animation = $(el).data('animation');
            var slideshowSpeed = $(el).data('timer_speed');
            var directionNav = ($(el).data('navigation_arrows') === 'True');
            var controlNav = ($(el).data('bullets') === 'True');
            var showNumbers = $(el).data('slide_number').toLowerCase() != 'false';
            $(el).flexslider({
                animationSpeed: animationSpeed,
                animation: animation,
                slideshowSpeed: slideshowSpeed,
                directionNav: directionNav,
                controlNav: controlNav,
                start: function() {
                    // images are hidden then shown to prevent a flash of unstyled content before script loads
                    $('.flexslider li img').css('display', 'block');
                    $('.slideshow-wrapper .preloader').hide();

                    flexIndex = $('li:has(.flex-active)').index('.flex-control-nav li') + 1;
                    flexTotal = $('.flex-control-nav li').length;
                    if (showNumbers)
                        $('.flexslider').append('<div class="flex-slide-number"><span>' + flexIndex + '</span> of <span>' + flexTotal + '</span></div>');
                    
                },
                after: function() {

                    // if variable for 'show slide numbers' is true - this is a placeholder for now
                    if (true === true) {
                        flexIndex = $('li:has(.flex-active)').index('.flex-control-nav li') + 1;
                        flexTotal = $('.flex-control-nav li').length;
                        if (showNumbers)
                            $('.flex-slide-number').html('<span>' + flexIndex + '</span> of <span>' + flexTotal + '</span>');
                    }
                },
            });
        });
    });
    return that;
}(jQuery);