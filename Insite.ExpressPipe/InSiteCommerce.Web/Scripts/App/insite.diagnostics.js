var insite = insite || {};

insite.diagnostics = function ($) {
    "use strict";
    var that = {};

    that.loadTestResultsGrid = function (pricingParameters) {
        $.ajax({
            url: insiteMicrositeUriPrefix + "/Diagnostics/PricingResultsGrid/",
            type: "POST",
            data: pricingParameters,
            async: true,
            cache: false,
            success: function (data) {
                $("#pricingResults").html(data);
                $(".spinner").hide();
            }
        });
    };

    return that;
}(jQuery);

$(function () {

    var $autocomplete = $("#pricingTestsProductSearch");
    $autocomplete.autocomplete({
        serviceUrl: $autocomplete.attr("data-autocompleteUrl"),
        minLength: 2,
        paramName: "query",
        params: { autocomplete: true },
        onSelect: function (suggestion) {
            $("#ProductId").val(suggestion.data.productId);
        },
        transformResult: function (response) {
            return {
                suggestions: $.map($.parseJSON(response), function (item) {
                    return { value: item.shortDescription + " " + item.name, data: item };
                })
            };
        }
    });

    $("#pricingTestsCustomerSearch").autocomplete({
        serviceUrl: insiteMicrositeUriPrefix + "/diagnostics/autocompletecustomers",
        minLength: 2,
        paramName: "term",        
        onSelect: function (item) {
            $("#pricingTestsCustomerSearch").val(item.value);
            $("#CustomerId").val(item.data);
        },
        transformResult: function (response) {
            return {
                suggestions: $.map($.parseJSON(response), function (item) {
                    return { value: item.label, data: item.value };
                })
            };
        }
    });

    $("#warehouse").autocomplete({
        serviceUrl: insiteMicrositeUriPrefix + "/diagnostics/autocompletewarehouses",
        minLength: 0,
        paramName: "term",
        onSelect: function (item) {
            $("#warehouse").val(item.value);
            $("#warehouseId").val(item.data);
        },
        transformResult: function (response) {
            return {
                suggestions: $.map($.parseJSON(response), function (item) {
                    return { value: item.label, data: item.value };
                })
            };
        }
    });

    $(document).on("click", "#submitPricing", function () {
        $(".spinner").show();
        var formdata = $("#pricingTestForm").serialize();
        insite.diagnostics.loadTestResultsGrid(formdata);
    });

    insite.core.datepicker(".datepicker");
});