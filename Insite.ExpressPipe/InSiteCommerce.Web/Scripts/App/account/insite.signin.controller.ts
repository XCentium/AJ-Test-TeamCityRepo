module insite.account {
    "use strict";

    export class SignInController {

        accessToken = "";
        changePasswordError: string;
        email: string;
        homePageUrl: string;
        changeCustomerPageUrl: string;
        dashboardUrl: string;
        newPassword: string;
        password: string;
        resetPasswordError: string;
        resetPasswordSuccess: boolean;
        returnUrl: string;
        checkoutAddressUrl: string;
        reviewAndPayUrl: string;
        addressesUrl: string;
        settings: AccountSettingsModel;
        signInError = "";
        disableSignIn = false;
        userName: string;
        cart: CartModel;
        signInForm: any;
        isFromReviewAndPay: boolean;
        
        static $inject = ["$scope", "$window", "accountService", "sessionService", "customerService", "coreService", "spinnerService"];

        constructor(protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: IAccountService,
            protected sessionService: ISessionService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService) {

            this.init();
        }

        init() {
            this.returnUrl = this.coreService.getQueryStringParameter("returnUrl", true);
            if (!this.returnUrl) {
                this.returnUrl = this.homePageUrl;
            }

            this.$scope.$on("sessionLoaded", (event, data) => {
                if (data.isAuthenticated) {
                    this.$window.location.href = this.dashboardUrl;
                }
            });

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.settings = data.accountSettings;
            });
            this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel) => {
                this.cart = cart;
            });

            if (this.returnUrl.toLowerCase().indexOf("reviewandpay") > -1) {
                this.isFromReviewAndPay = true;
            }
        }

        signIn(errorMessage: string) {
            this.signInError = "";

            if (this.signInForm.$invalid) {
                return;
            }

            this.disableSignIn = true;
            this.spinnerService.show("mainLayout", true);
            this.sessionService.getAccessToken(this.userName, this.password).success(result => {
                this.accessToken = result.access_token;
                this.signUserIn();
            }).error(error => {
                this.signInError = error.error_description;
                this.disableSignIn = false;
                this.spinnerService.hide("mainLayout");
            });
        }

        selectCustomer(session: SessionModel) {
            if (session.redirectToChangeCustomerPageOnSignIn) {
                var shouldAddReturnUrl = this.returnUrl && this.returnUrl !== this.homePageUrl;
                this.$window.location.href = this.changeCustomerPageUrl + (shouldAddReturnUrl ? `?returnUrl=${this.returnUrl}` : "");
            } else {
                this.sessionService.redirectAfterSelectCustomer(session, this.cart.canBypassCheckoutAddress,
                    this.dashboardUrl, this.returnUrl, this.checkoutAddressUrl, this.reviewAndPayUrl, this.addressesUrl);
            }
        }

        guestCheckout() {
            var account = <AccountModel><any>{ isGuest: true };

            this.accountService.createAccount(account).success(result => {
                this.sessionService.getAccessToken(result.userName, result.password).success(token => {
                    this.sessionService.setAccessToken(token.access_token);
                    this.$window.location.href = this.returnUrl;
                }).error(error => {
                    this.signInError = error.message;
                });
            }).error(error => {
                this.signInError = error.message;
            });
        }

        openForgotPasswordPopup(): void {
            this.email = "";
            this.resetPasswordSuccess = false;
            (<any>angular.element("#forgotPasswordPopup")).foundation("reveal", "open");
        }

        changePassword() {
            this.changePasswordError = "";

            var valid = $("#changePasswordForm").validate().form();
            if (!valid) {
                return;
            }

            var session = <SessionModel>{
                userName: this.userName,
                password: this.password,
                newPassword: this.newPassword
            };

            this.sessionService.changePassword(session, this.accessToken).then(() => {
                this.password = this.newPassword;
                this.signUserIn();
            }, error => {
                this.changePasswordError = error.message;
            });
        }

        resetPassword() {
            this.resetPasswordError = "";

            var valid = $("#resetPasswordForm").validate().form();
            if (!valid) {
                return;
            }

            var session = <SessionModel>{
                email: this.email,
                resetPassword: true
            };

            this.sessionService.resetPassword(session).success(() => {
                this.resetPasswordSuccess = true;
            }).error(error => {
                this.resetPasswordError = error.message;
            });
        }

        signUserIn() {
            this.sessionService.signIn(this.accessToken, this.userName, this.password).then((result: SessionModel) => {
                this.sessionService.setContextFromSession(result);
                this.selectCustomer(result);
            }, error => {
                this.disableSignIn = false;
                if (error.status === 422) {
                    this.coreService.displayModal(angular.element("#changePasswordPopup"));
                } else {
                    if (error.data.message) {
                        this.signInError = error.data.message;
                    } else {
                        this.signInError = error.data;
                    }
                }
            });
        }
    }

    angular
        .module("insite")
        .controller("SignInController", SignInController);
}