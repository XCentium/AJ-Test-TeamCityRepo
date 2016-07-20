var configuration = function () {
    function setModel(model) {
        configurator.masterViewModel = model;
    }

    function getOptionValue(name, pageIndex) {
        var option = getOption(name, pageIndex);

        return option.Value;
    }

    function setOptionValue(value, name, pageIndex) {
        var option = getOption(name, pageIndex);
        option.Value = value;
        configurator.applyBindings(configurator.masterViewModel, false);
    }

    function getOptionPriceImpact(name, pageIndex) {
        var option = getOption(name, pageIndex);

        return option.PriceImpact;
    }

    function setOptionPriceImpact(priceImpact, name, pageIndex) {
        var option = getOption(name, pageIndex);
        option.PriceImpact = priceImpact;
    }

    function getPriceImpact() {
        return configurator.masterViewModel.PriceImpact;
    }

    function setPriceImpact(priceImpact) {
        configurator.masterViewModel.PriceImpact = priceImpact;
    }

    function setExecuteScriptOnPricingRequest(flag) {
        configurator.masterViewModel.ExecuteScriptOnPricingRequest = flag;
    }

    function getOption(name, pageIndex) {
        if (typeof (pageIndex) === "undefined") {
            pageIndex = configurator.masterViewModel.CurrentPageIndex;
        }

        var matchedObject;
        var configurationPage = configurator.masterViewModel.ConfigurationPages[pageIndex];
        $.each(configurationPage.ConfigurationOptions, function (j, curConfigurationOption) {
            if (curConfigurationOption.Name === name)
                matchedObject = curConfigurationOption;
        });

        return matchedObject;
    }

    function getConfiguredRegularPrice() {
        return configurator.masterViewModel.PriceImpact + configurator.masterViewModel.RegularPrice;
    }

    function getConfiguredActualPrice() {
        return configurator.masterViewModel.PriceImpact + configurator.masterViewModel.ActualPrice;
    }

    return {
        SetModel: setModel,
        GetOptionValue: getOptionValue,
        SetOptionValue: setOptionValue,
        GetOptionPriceImpact: getOptionPriceImpact,
        SetOptionPriceImpact: setOptionPriceImpact,
        GetPriceImpact: getPriceImpact,
        SetPriceImpact: setPriceImpact,
        SetExecuteScriptOnPricingRequest: setExecuteScriptOnPricingRequest,
        GetOption: getOption,
        GetConfiguredRegularPrice: getConfiguredRegularPrice,
        GetConfiguredActualPrice: getConfiguredActualPrice
    };
}();

var configurator = function () {
    var masterViewModel, koConfigurationPage, configurationPageOutput, applyingBindings = false, pageSkipIfNoInputs = false, pageSkipScriptsIfNoInputs = false, lastPageIndexDisplayed;

    //toggle to previous page
    function previousPage() {
        //if there is a previous page, process it
        if (masterViewModel.CurrentPageIndex > 0) {
            handlePageLeaveEvents(masterViewModel.CurrentPageIndex);
            syncMasterViewModel();

            //go back to the page before the last displayed page
            var pageFound = false;
            while (!pageFound && masterViewModel.CurrentPageIndex > 0) {
                masterViewModel.CurrentPageIndex = masterViewModel.CurrentPageIndex - 1;
                var configurationPage = masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex];
                var configStatus = getConfigurationStatus(configurationPage.ConfigurationId);
                pageFound = configStatus && configStatus.Displayed;
            }

            applyBindings(masterViewModel, true);

            if ((configurator.pageSkipIfNoInputs && pageNoInputs()) || !configurator.pagePromptWhen()) {
                configurator.previousPage();
            } else {
                handlePageEnterEvents(masterViewModel.CurrentPageIndex);
            }
        }
    }
    //toggle to next page
    function nextPage(processLeaveEvents) {
        if(processLeaveEvents)
            handlePageLeaveEvents(masterViewModel.CurrentPageIndex);

        syncMasterViewModel();

        //if there is a next page, process it, otherwise submit the configuration
        if (masterViewModel.CurrentPageIndex + 1 < masterViewModel.ConfigurationPages.length) {
            masterViewModel.CurrentPageIndex = masterViewModel.CurrentPageIndex + 1;

            applyBindings(masterViewModel, true);
            handlePageEnterEvents(masterViewModel.CurrentPageIndex);

            //check if the current page idenfifies a future sub configuration, if so determine if the sub configuration should be displayed
            if (masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].IsSubConfigurationPage) {
                var configurationPage = masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex];

                //check the sub configuration part option PromptWhen to determine if the sub config should be displayed                
                for (var i = 0; i < configurationPage.ConfigurationOptions.length; i++) {
                    var configurationOption = configurationPage.ConfigurationOptions[i];
                    if (configurationOption.Type === "SubconfigurationPart") {
                        //ensure that the identified sub configuration has at least one page
                        if (masterViewModel.CurrentPageIndex + 1 < masterViewModel.ConfigurationPages.length) {
                            var subConfigurationId = masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex + 1].ConfigurationId;
                            var showSubConfiguration = !$("#" + configurationOption.Name).is(":disabled");

                            //set display status for future reference
                            var subConfigStatus = getConfigurationStatus(subConfigurationId);
                            if (subConfigStatus)
                                subConfigStatus.Displayed = showSubConfiguration;

                            if (!showSubConfiguration) {
                                //keep skipping pages until we are at the page before returning tp the current configuration, this will skip both the current non-displayed sub config
                                //and any sub configurations that may have been defined in it.  A normal nextPage event is then called so all appropriate events are fired
                                while (masterViewModel.CurrentPageIndex + 1 < masterViewModel.ConfigurationPages.length
                                       && masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex + 1].ConfigurationId != configurationPage.ConfigurationId) {
                                    masterViewModel.CurrentPageIndex = masterViewModel.CurrentPageIndex + 1;
                                    
                                    //update the display status of any sub configs that are skipped
                                    var skippedConfigurationId = masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].ConfigurationId;
                                    if (skippedConfigurationId != subConfigurationId) {
                                        var skippedConfigStatus = getConfigurationStatus(skippedConfigurationId);
                                        if (skippedConfigStatus)
                                            skippedConfigStatus.Displayed = false;
                                    }
                                }
                            }
                            
                            //if we have not shown the sub configuration, do not fire the page leave events for the current page
                            configurator.nextPage(showSubConfiguration);
                        }                       
                    }
                }
            }
        }
        else {
            if (lastPageIndexDisplayed === masterViewModel.CurrentPageIndex) {
                applyBindings(masterViewModel, false);
            }
            postModel(function (json) {
                masterViewModel = json;
                window.location = insiteMicrositeUriPrefix + "/Configuration/Summary?orderLineId=" + masterViewModel.OrderLineId;
            });
        }
    }
    function handlePageEnterEvents(pageIndex) {
        var pageConfiguration = (pageIndex >= 0 && pageIndex <= masterViewModel.ConfigurationPages.length - 1) ? masterViewModel.ConfigurationPages[pageIndex] : null;

        if (pageConfiguration != null) {
            var pageConfigurationStatus = getConfigurationStatus(pageConfiguration.ConfigurationId);
            if (pageConfigurationStatus && pageIndex === pageConfigurationStatus.StartingPageIndex) {
                eval("currentConfiguration" + pageConfigurationStatus.ConfigurationKey + ".scriptOnInitialize();");
            }
            
            //skip the page if is is not a sub configuration page (They always get run), and has no inputs with appropriate page setting OR the prompt when fails
            //do not process the page leave events as the page was not displayed
            if (!pageConfiguration.IsSubConfigurationPage && ((configurator.pageSkipIfNoInputs && pageNoInputs()) || !configurator.pagePromptWhen())) {
                configurator.nextPage(false);
            }
            else {
                if (!pageNoInputs() || !configurator.pageSkipScriptsIfNoInputs) {
                    configurator.pageOnEntry();
                    $(document).trigger("pageEntry");
                }
            }
        }
    }
    function handlePageLeaveEvents(pageIndex) {
        var pageConfiguration = (pageIndex >= 0 && pageIndex <= masterViewModel.ConfigurationPages.length - 1) ? masterViewModel.ConfigurationPages[pageIndex] : null;

        if (pageConfiguration != null) {
            if (!pageNoInputs() || !configurator.pageSkipScriptsIfNoInputs) {
                configurator.pageOnLeave();
            }

            var pageConfigurationStatus = getConfigurationStatus(pageConfiguration.ConfigurationId);
            if (pageConfigurationStatus && pageIndex === pageConfigurationStatus.EndingPageIndex) {
                eval("currentConfiguration" + pageConfigurationStatus.ConfigurationKey + ".scriptOnFinalize();");
            }
        }
    }
    function getConfigurationStatus(configurationId) {
        var foundConfigurationStatus;

        $.each(masterViewModel.ConfigurationStatuses, function (index, configurationStatus) {
            if (configurationStatus.ConfigurationId === configurationId) {
                foundConfigurationStatus = configurationStatus;
                return;
            }
        });

        return foundConfigurationStatus;
    }
    //post the entire masterViewModel back to the server for processing                          
    function postModel(callback) {
        var activeElementId = document.activeElement.id; //get element that has focus
        $.blockUI({ message: null, overlayCSS: { backgroundColor: "#fff", opacity: 0.0, cursor: "wait" } });
        $.ajax({
            url: "/Configuration/PostModel",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(masterViewModel),
            success: function (json) {
                if (callback && typeof (callback) === "function") {
                    callback(json, activeElementId);
                }
            }
        });
    }
    //the incoming json represents the entire masterViewModel, save that and bind the current page to knockout
    function applyBindings(json, reloadHtml) {
        masterViewModel = json;
        configuration.SetModel(masterViewModel);
        toggleButtons();
        if (typeof masterViewModel.DisplayedSubConfigurations === "undefined" || masterViewModel.DisplayedSubConfigurations === null)
            masterViewModel.DisplayedSubConfigurations = [];

        $("#price-impact").text(configuration.GetConfiguredActualPrice()).formatCurrency();

        //bind current selected page of the masterViewModel to knockout        
        var configurationPage = masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex];
        if (reloadHtml) {
            $("#pageOutput").html(configurationPageOutput[masterViewModel.CurrentPageIndex]);
            applyPlugins();
            lastPageIndexDisplayed = masterViewModel.CurrentPageIndex;
            koConfigurationPage = new Object();
            for (var i = 0; i < configurationPage.ConfigurationOptions.length; i++) {
                if (configurationPage.ConfigurationOptions[i].Type === "CheckBox") {
                    eval("koConfigurationPage." + configurationPage.ConfigurationOptions[i].Name + " = " + "ko.observable(" + isTrueValue(configurationPage.ConfigurationOptions[i].Value) + ");");
                }
                else {
                    eval("koConfigurationPage." + configurationPage.ConfigurationOptions[i].Name + " = " + "ko.observable('" + configurationPage.ConfigurationOptions[i].Value + "');");
                }

                if (configurationPage.ConfigurationOptions[i].Type === "ComboBox") {
                    eval("koConfigurationPage." + configurationPage.ConfigurationOptions[i].Name + "Options = ko.observableArray(" + JSON.stringify(configurationPage.ConfigurationOptions[i].Options) + ");");
                }
            }

            //listen for change on any of the ko controls and repost back to server
            //any change to the ui can cause changes to other controls
            koConfigurationPage.onChange = function (data, event) {
                if (!applyingBindings) {
                    //trigger the on leave for the inital sender of the change event
                    setTimeout(function () {
                        syncMasterViewModel();
                        $(event.target).trigger("koChange");
                        postModel(function (newJson, activeElementId) {
                            applyBindings(newJson, false); //rebind the view model
                            applyPlugins(); //apply plugins to rebound elements
                            $.unblockUI();
                            //forcibly click the next/prev page buttons if that was the clients intent
                            if (activeElementId === "nextPage" || activeElementId === "prevPage") {
                                $("#" + activeElementId).trigger("click");
                            }
                        });
                    }, 0);
                }

            };
            applyingBindings = true;
            ko.applyBindings(koConfigurationPage);
            //the values of the ddls need to be forcibly clicked
            for (var z = 0; z <= configurationPage.ConfigurationOptions.length - 1; z++) {
                if (configurationPage.ConfigurationOptions[z].Type === "ComboBox") {
                    eval("koConfigurationPage." + configurationPage.ConfigurationOptions[z].Name + "('" + configurationPage.ConfigurationOptions[z].Value + "');");
                }
            }
            applyingBindings = false;
        }
        else {
            //if we dont reload the html, we still need to be conscious about the dropdown options that might change when we hit the server
            //just swap out all the dropdown values (dont worry with just trynna figure out whats changed)
            //this means we have to manually select the values we want after the fact though.
            applyingBindings = true;
            function getKoConfigurationOptions(name) {
                var options = [];
                eval("options = koConfigurationPage." + name);
                return options;
            }
            for (var x = 0; x <= configurationPage.ConfigurationOptions.length - 1; x++) {
                if (configurationPage.ConfigurationOptions[x].Type === "ComboBox") {
                    var koConfigurationOptions = getKoConfigurationOptions(configurationPage.ConfigurationOptions[x].Name + "Options");
                    koConfigurationOptions.removeAll();
                    for (var y = 0; y <= configurationPage.ConfigurationOptions[x].Options.length - 1; y++) {
                        var option = configurationPage.ConfigurationOptions[x].Options[y];
                        koConfigurationOptions.push(option);
                    }
                }
                if (configurationPage.ConfigurationOptions[x].Type === "CheckBox") {
                    eval("koConfigurationPage." + configurationPage.ConfigurationOptions[x].Name + "(" + isTrueValue(configurationPage.ConfigurationOptions[x].Value) + ");");
                }
                else {
                    eval("koConfigurationPage." + configurationPage.ConfigurationOptions[x].Name + "('" + configurationPage.ConfigurationOptions[x].Value + "');");
                }
            }
            applyingBindings = false;
        }
    }
    //there is a masterViewModel with all of the configuration information and a koConfigurationPage just for the specific page
    //that knockout is bound to. This method will update the masterViewModel with whats in the koConfigurationPage
    function syncMasterViewModel() {
        var isAllControlsDisabled = true;
        for (var property in koConfigurationPage) {
            for (var i = 0; i < masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].ConfigurationOptions.length; i++) {
                if (masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].ConfigurationOptions[i].Name === property) {
                    if ($("#" + property).is(":disabled")) {
                        masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].ConfigurationOptions[i].Value = "";
                    } else {
                        isAllControlsDisabled = false;
                        masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].ConfigurationOptions[i].Value = eval("koConfigurationPage." + property + "()");
                    }
                    break;
                }
            }
        }
        masterViewModel.ConfigurationPages[masterViewModel.CurrentPageIndex].IsAllControlsDisabled = isAllControlsDisabled;
    }
    //apply plugins to appropriate elements
    function applyPlugins() {
        insite.core.datepicker("[data-field-type='Date']");

        //same as what was in alphanumeric plugin, i just removed the space to allow it.
        var invalidSpecialCharacters = "!@#$%^&*()+=[]\\\';,/{}|\":<>?~`.-";

        $("[data-field-char-type='Numbers']").numeric();
        $("[data-field-char-type='Letters']").alpha({ ichars: invalidSpecialCharacters });
        $("[data-field-char-type='Letters or Numbers']").alphanumeric({ ichars: invalidSpecialCharacters });
        $("[data-field-char-type='Uppercase Letters']").alpha({ ichars: invalidSpecialCharacters, allcaps: true });
        $("[data-field-number-decimals]").each(function () {
            var numberInput = $(this);
            var decimals = parseInt(numberInput.attr("data-field-number-decimals"));
            numberInput.inputmask("decimal", { digits: decimals });
        });
    }
    //validate elements on page conform to defined data requirements
    function validatePage() {
        $.validity.setup({ outputMode: "summary" });
        $.validity.start();
        var fieldsChecked = [];

        $(".configurator-option-input").each(function () {
            //if the control is invisible dont validate
            if (!$(this).is(":visible"))
                return;

            var input = $(this);
            var validationLblName = input.attr("data-field-label");
            var requiredMessage = "You must provide a " + validationLblName + ".";

            if (input.attr("data-field-required") === "1") {
                if (input.is(":checkbox, :radio")) {
                    var fieldName = input.attr("Name");
                    if ($.inArray(fieldName, fieldsChecked) === "-1") {
                        input.assert($("input[name='" + fieldName + "']:checked").length != 0, requiredMessage);
                        fieldsChecked.push(fieldName);
                    }
                }
                else {
                    input.require(requiredMessage);
                    fieldsChecked.push(name);
                }
            }
            if (input.attr("data-field-valid-entries")) {
                var allowedValues = input.attr("data-field-valid-entries");
                var allowedValueList = allowedValues.split(",");
                input.assert($.inArray(input.val(), allowedValueList) > -1, validationLblName + " must be one of the following: " + allowedValues);
            }

            if (input.attr("data-field-min-length")) {
                input.minLength(parseInt(input.attr("data-field-min-length")), validationLblName + " cannot be shorter than " + input.attr("data-field-min-length") + " characters.");
            }

            if (input.attr("data-field-max-length")) {
                input.maxLength(parseInt(input.attr("data-field-max-length")), validationLblName + " cannot be longer than " + input.attr("data-field-max-length") + " characters.");
            }

            if (input.attr("data-field-min-value")) {
                input.greaterThanOrEqualTo(parseFloat(input.attr("data-field-min-value")), validationLblName + " must be greater than or equal to " + input.attr("data-field-min-value") + ".");
            }

            if (input.attr("data-field-max-value")) {
                input.lessThanOrEqualTo(parseFloat(input.attr("data-field-max-value")), validationLblName + " must be less than or equal to " + input.attr("data-field-max-value") + ".");
            }

            if (input.attr("data-field-type") === "Date") {
                input.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/, validationLblName + " needs to be in the format of a date (99/99/9999).");

                var datemaxdaysforward = parseInt($(this).attr("data-field-max-days-forward"));
                var datemaxdaysback = parseInt($(this).attr("data-field-max-days-back"));

                var today = new Date();
                var maxDate = new Date();
                var minDate = new Date();

                maxDate.setDate(today.getDate() + datemaxdaysforward);
                minDate.setDate(today.getDate() - datemaxdaysback);

                if (input.val() != "") {
                    var providedDate = new Date(input.val());

                    if (parseInt(datemaxdaysforward)) {
                        input.assert(providedDate < maxDate, "Date must be less than " + maxDate.toLocaleDateString());
                    }

                    if (parseInt(datemaxdaysback)) {
                        input.assert(providedDate > minDate, "Date must be greater than " + minDate.toLocaleDateString());
                    }
                }
            }
        });

        var result = $.validity.end();

        //add .validity-erroneous to element containers as needed
        $(".configurator-option-radio-button-list, .configurator-option-checkbox-wrapper").has(".validity-erroneous").addClass("validity-erroneous");

        return result.valid && configurator.pagePassFail();
    }
    //i dont want the pageOutput in the masterViewModel because that gets posted back/forth
    function setPageOutput(pageOutput, callback) {
        configurationPageOutput = pageOutput;

        if (callback && typeof (callback) === "function") {
            callback();
        }
    }
    //hide/show buttons based off config page you are on
    function toggleButtons() {
        $("#prevPage").attr("style", masterViewModel.CurrentPageIndex === 0 ? "display:none" : "display:inline-block");
    }
    function pageNoInputs() {
        return $(".configurator-option-input:visible:not(:disabled)").length <= 0;
    }
    function pagePromptWhen() {
        return true;
    }
    function pageOnEntry() {
        return true;
    }
    function pagePassFail() {
        return true;
    }
    function pageOnLeave() {
        return true;
    }
    function isTrueValue(value) {
        return (value.toString().toLowerCase() === "true" || value.toString().toLowerCase() === "yes");
    }

    return {
        setPageOutput: setPageOutput,
        previousPage: previousPage,
        nextPage: nextPage,
        applyBindings: applyBindings,
        applyPlugins: applyPlugins,
        validatePage: validatePage,
        pagePromptWhen: pagePromptWhen,
        pageOnEntry: pageOnEntry,
        pagePassFail: pagePassFail,
        pageOnLeave: pageOnLeave,
        pageSkipIfNoInputs: pageSkipIfNoInputs,
        pageSkipScriptsIfNoInputs: pageSkipScriptsIfNoInputs,
        handlePageEnterEvents: handlePageEnterEvents,
        masterViewModel: masterViewModel
    };
}();