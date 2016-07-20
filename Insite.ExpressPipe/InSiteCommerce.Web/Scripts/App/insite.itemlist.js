var insite = insite || {};

insite.itemlist = function ($) {
    "use strict";
    var that = {};

    that.changePage = function (page, elementId) {
        var $form = $(elementId ? "#" + elementId : "#paramForm");
        $form.find("input.page").val(page);
        $form.submit();
    };

    that.changePageSize = function(obj, elementId) {
        var $form = $(elementId ? "#" + elementId : "#paramForm");
        $form.find("input.page").val(1);
        $form.find("input.pageSize").val(obj.options[obj.selectedIndex].value);
        $form.submit();
    };

    return that;
}(jQuery);