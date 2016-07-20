///<reference path="insite.product.service.ts"/>
///<reference path="../../typings/jquery.validation/jquery.validation.d.ts"/>

module insite.catalog {
    "use strict";

    export class TellAFriendController {
        shareModel: any;
        product: ProductDto;
        isSuccess: boolean;
        isError: boolean;

        public static $inject = ["$scope", "EmailService"];

        constructor(
            protected $scope: ng.IScope,
            protected emailService: email.IEmailService) {
            this.init();
        }

        init(): void {
            (<any>angular.element("#TellAFriendDialogContainer")).foundation("reveal", {
                "close": () => {
                    this.shareModel = this.shareModel || {};
                    this.shareModel.friendsName = "";
                    this.shareModel.friendsEmail = "";
                    this.shareModel.yourName = "";
                    this.shareModel.yourEmail = "";
                    this.shareModel.yourMessage = "";
                    this.isSuccess = false;
                    this.isError = false;
                    this.$scope.$apply();
                }
            });
        }

        shareWithFriend() {
            var valid = angular.element("#tellAFriendForm").validate().form();
            if (!valid) {
                return;
            }
            var tellAFriendInfo = {
                friendsName: this.shareModel.friendsName,
                friendsEmailAddress: this.shareModel.friendsEmail,
                yourName: this.shareModel.yourName,
                yourEmailAddress: this.shareModel.yourEmail,
                yourMessage: this.shareModel.yourMessage,
                productId: this.product.id,
                productImage: this.product.mediumImagePath,
                productShortDescription: this.product.shortDescription,
                altText: this.product.altText,
                productUrl: this.product.productDetailUrl
            };

            var tellAFriendInfoJs = angular.toJson(tellAFriendInfo);
            this.emailService.tellAFriend(tellAFriendInfoJs).then(
                (result: string) => {
                    this.isSuccess = true;
                    this.isError = false;
                },
                (error: string) => {
                    this.isSuccess = false;
                    this.isError = true;
                });
        }
    }

    angular
        .module("insite")
        .controller("TellAFriendController", TellAFriendController);
} 