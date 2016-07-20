var insite = insite || {};

window.monetateQ = window.monetateQ || [];

insite.personalization = function ($) {
    "use strict";
    var that = {};

    that.setPageType = function (pageType) {
        if (!that.beforeSetPageTypeHook(pageType)) {
            return;
        }
        that.addBreadcrumbs();
        switch (pageType.toLowerCase()) {
            case "home":
                window.monetateQ.push(["setPageType", "main"]);
                break;
            case "categorydetail":
                window.monetateQ.push(["setPageType", "category"]);
                that.addCategories();
                break;
            case "productlist":
                window.monetateQ.push(["setPageType", "index"]);
                that.addProducts();
                break;
            case "searchresults":
                window.monetateQ.push(["setPageType", "search"]);
                that.addProducts();
                break;
            case "productdetail":
                window.monetateQ.push(["setPageType", "product"]);
                that.addProductDetails();
                break;
            case "cart":
                window.monetateQ.push(["setPageType", "cart"]);
                that.addCartRows();
                break;
            case "signin":
                window.monetateQ.push(["setPageType", "login"]);
                break;
            case "createaccount":
                window.monetateQ.push(["setPageType", "signup"]);
                break;
            case "accountsettings":
                window.monetateQ.push(["setPageType", "account"]);
                break;
            case "reviewandpay":
                window.monetateQ.push(["setPageType", "billing"]);
                that.trackData();
                window.monetateQ.push(["setPageType", "shipping"]);
                break;
            case "orderconfirmation":
                window.monetateQ.push(["setPageType", "purchase"]);
                that.addPurchaseRows();
                break;
        }
        if (!that.afterSetPageTypeHook(pageType)) {
            return;
        }
        that.trackData();
    };

    that.beforeSetPageTypeHook = function (pageType) {
        return true;
    };

    that.afterSetPageTypeHook = function(pageType) {
        return true;
    };

    that.addBreadcrumbs = function () {
        if (insite.personalization.breadcrumbs) {
            window.monetateQ.push(["addBreadcrumbs", insite.personalization.breadcrumbs]);
        }
    };

    that.addCategories = function () {
        window.monetateQ.push(["addCategories", [insite.personalization.category]]);
    };

    that.addProducts = function () {
        if (insite.personalization.category) {
            window.monetateQ.push(["addCategories", [insite.personalization.category]]);
        }
        window.monetateQ.push(["addProducts", insite.personalization.products]);
    };

    that.addProductDetails = function () {
        if (insite.personalization.category) {
            window.monetateQ.push(["addCategories", [insite.personalization.category]]);
        }
        window.monetateQ.push(["addProductDetails", insite.personalization.products]);
    };

    that.addCartRows = function () {
        var cartRows = [];
        $.each(insite.personalization.orderLines, function () {
            var cartRow = {
                "productId": this.erpNumber,
                "quantity": this.qtyOrdered,
                // TODO 3.7.1 Only thing currently available in the viewmodel is price string with currency symbol
                "unitPrice": this.unitPrice.substring(1),
                "currency": insite.personalization.currencyCode
            }
            cartRows.push(cartRow);
        });
        window.monetateQ.push(["addCartRows", cartRows]);
    };

    that.addPurchaseRows = function () {
        var purchaseRows = [];
        $.each(insite.personalization.orderLines, function () {
            var purchaseRow = {
                "purchaseId": insite.personalization.orderNumber,
                "productId": this.erpNumber,
                "quantity": this.qtyOrdered,
                // TODO 3.7.1 Only thing currently available in the viewmodel is price string with currency symbol
                "unitPrice": this.unitPrice.substring(1),
                "currency": insite.personalization.currencyCode
            }
            purchaseRows.push(purchaseRow);
        });
        window.monetateQ.push(["addPurchaseRows", purchaseRows]);
    };

    that.trackData = function() {
        window.monetateQ.push(["trackData"]);
    };

    return that;
}(jQuery);