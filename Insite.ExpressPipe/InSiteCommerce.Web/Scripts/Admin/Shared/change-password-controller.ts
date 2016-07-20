module insite_admin {
    "use strict";

    export class ChangePasswordController extends ChangeUserCredentialsController {
        newPassword = "";
        isNewPasswordValid: boolean;
        retypePassword = "";
        isRetypePasswordMatch: boolean;

        minLength: number;
        isMinLengthPassed = false;
        minDigits: number;
        isMinDigitsPassed = false;
        minSpecials: number;
        isMinSpecialsPassed = false;

        static $inject = ["$rootScope", "$http", "spinnerService", "FoundationApi"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any) {
            super($rootScope, $http, spinnerService, $foundationApi);
        }

        init() {
            this.$rootScope.$on("resetPasswordForm", (event, settings : any) => {
                this.resetForm();
                this.username = settings.userName;
                this.accessToken = settings.accessToken;
            });

            this.$http.post("/admin/account/getpasswordsettings", {}).success((result: any) => {
                this.minLength = result.minLength;
                this.minDigits = result.minDigits;
                this.minSpecials = result.minSpecials;
            });
        }

        validateNewPassword() {
            this.isMinLengthPassed = this.newPassword.length >= this.minLength;

            if (this.minDigits > 0) {
                var digitRegexp = new RegExp(`[0-9]{${this.minDigits},}`);
                this.isMinDigitsPassed = digitRegexp.test(this.newPassword);
            }

            if (this.minSpecials > 0) {
                var specialRegexp = new RegExp(`[^A-Za-z0-9]{${this.minSpecials},}`);
                this.isMinSpecialsPassed = specialRegexp.test(this.newPassword);
            }

            return this.isMinLengthPassed && (this.minDigits <= 0 || this.isMinDigitsPassed) && (this.minSpecials <= 0 || this.isMinSpecialsPassed);
        }

        validateRetypePassword() {
            return this.retypePassword === this.newPassword;
        }

        validateForm(): boolean {
            this.isNewPasswordValid = this.validateNewPassword();
            this.isRetypePasswordMatch = this.validateRetypePassword();
            return this.isNewPasswordValid && this.isRetypePasswordMatch;
        }

        getData(): any {
            var changeData = {
                username: this.username,
                currentPassword: this.currentPassword,
                newPassword: this.newPassword
            };
            return changeData;
        }

        getUpdateUrl(): string {
            return "/admin/account/changepassword";
        }

        successCallback() {
            this.$foundationApi.publish("changePasswordModal", "close");
            this.$rootScope.$broadcast("passwordChanged");
        }

        resetForm() {
            super.resetForm();
            this.newPassword = "";
            this.isNewPasswordValid = null;
            this.retypePassword = "";
            this.isRetypePasswordMatch = null;
            this.isMinLengthPassed = false;
            this.isMinDigitsPassed = false;
            this.isMinSpecialsPassed = false;
        }
    }

    angular
        .module("insite-admin")
        .controller("ChangePasswordController", ChangePasswordController);
}