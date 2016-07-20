module insite_admin {
    "use strict";

    export interface IImagePickerPreviewAttributes extends ng.IAttributes {
        path: string;
    }

    export class ImagePickerPreviewController {
        path: string = "";

        static $inject = ["$scope", "$attrs", "FoundationApi"];
        constructor(
            protected $scope: ng.IScope,
            protected $attrs: IDeleteConfirmationAttributes,
            protected $foundationApi: any
        ) {
            this.init();
        }

        init() {
            this.$scope.$on("showImagePickerPreview", (event: ng.IAngularEvent, data: IImagePickerPreviewAttributes) => {
                this.path = data.path;
                this.$foundationApi.publish("imagePickerPreview", "open");
            });
        }

        getFileName(): string {
            return this.path.substr(this.path.lastIndexOf("/") + 1);;
        }
    }

    angular
        .module("insite-admin")
        .controller("ImagePickerPreviewController", ImagePickerPreviewController);
}