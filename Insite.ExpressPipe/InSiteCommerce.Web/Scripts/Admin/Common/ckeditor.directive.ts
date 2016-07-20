module insite_admin {
    "use strict";

    angular
        .module("insite-admin")
        .directive("ckEditor", [
            () => {
                return {
                    require: "?ngModel",
                    restrict: "A",
                    link: (scope, elm, attr, model) => {
                        var ck = CKEDITOR.replace(elm[0], <any>{
                            autoParagraph: false,
                            allowedContent: true,
                            extraPlugins: "imagemaps",
                            toolbar: "Full",
                            fullPage: true
                        });

                        (<any>CKFinder).setupCKEditor(ck, "/scripts/libraries/ckfinder/2.4.1/", "UserFiles");

                        ck.on("change", () => {
                            model.$setViewValue(ck.getData());
                        });

                        model.$render = (value) => {
                            ck.setData(model.$modelValue);
                        };

                    }
                };
            }]);
}