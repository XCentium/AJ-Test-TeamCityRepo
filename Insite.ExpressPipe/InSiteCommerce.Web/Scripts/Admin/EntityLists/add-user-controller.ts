module insite_admin {
    "use strict";

    export class AddUserController {
        password = "";
        retypePassword = "";
        isEmailValid: boolean;
        userName: string;
        email: string;
        minLength: number;
        isMinLengthPassed = false;
        minDigits: number;
        isMinDigitsPassed = false;
        minSpecials: number;
        isMinSpecialsPassed = false;
        addUserForm: any;
        emailRegex: RegExp;
        usernameUseByAnotherPerson: boolean;
        retypePasswordWasCorrect: boolean;
        passwordWasCorrect: boolean;
        usernameWasCorrect: boolean;
        emailWasCorrect: boolean;
        static $inject = ["$location", "$scope", "$http", "spinnerService", "FoundationApi"];

        constructor(
            protected $location: ng.ILocationService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any) {
            this.init();
        }

        init() {
            this.emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            this.$scope.$on("addNewUser", () => {
                this.$http.post("/admin/account/getpasswordsettings", {}).then((result: any) => {
                    this.resetForm();
                    this.minLength = result.data.minLength;
                    this.minDigits = result.data.minDigits;
                    this.minSpecials = result.data.minSpecials;
                    this.$foundationApi.publish("addUserModal", "open");
                });
            });
        }

        validatePassword() {

            this.isMinLengthPassed = this.password.length >= this.minLength;

            if (this.minDigits > 0) {
                var digitRegexp = new RegExp(`[0-9]{${this.minDigits},}`);
                this.isMinDigitsPassed = digitRegexp.test(this.password);
            }

            if (this.minSpecials > 0) {
                var specialRegexp = new RegExp(`[^A-Za-z0-9]{${this.minSpecials},}`);
                this.isMinSpecialsPassed = specialRegexp.test(this.password);
            }

            return this.isMinLengthPassed && (this.minDigits <= 0 || this.isMinDigitsPassed) && (this.minSpecials <= 0 || this.isMinSpecialsPassed);
        }

        validateRetypePassword() {
            return this.retypePassword === this.password;
        }

        validateForm(): boolean {
            return this.validatePassword() && this.validateRetypePassword();
        }

        getData(): any {
            var changeData = {
                username: this.userName,
                email: this.email,
                password: this.password
            };
            return changeData;
        }

        getAddUserUrl(): string {
            return "/admin/account/addnewuser";
        }

        successCallback(result: any) {
            if (result.usernameUseByAnotherPerson) {
                this.usernameUseByAnotherPerson = result.usernameUseByAnotherPerson;
                return;
            }

            if (result.id) {
                this.$location.url(`data/userprofiles/${result.id}`);
                this.$foundationApi.publish("addUserModal", "close");
            }
        }

        resetForm() {
            if (this.addUserForm) {
                this.addUserForm.$setPristine();
                this.addUserForm.$setUntouched();
            }
            this.userName = "";
            this.email = "";
            this.password = "";
            this.retypePassword = "";
            this.isMinLengthPassed = false;
            this.isMinDigitsPassed = false;
            this.isMinSpecialsPassed = false;
            this.usernameUseByAnotherPerson = false;
            this.retypePasswordWasCorrect = false;
            this.passwordWasCorrect = false;
            this.usernameWasCorrect = false;
            this.emailWasCorrect = false;
        }

        emailValidation(field: any): boolean {
            return field.$valid;
        }

        usernameValidation(field: any): boolean {
            return field.$valid && !this.usernameUseByAnotherPerson;
        }

        disableValidationForNeverValidField(result: boolean, propertyName: string): boolean {
            if (this[propertyName]) {
                return result;
            }

            if (result) {
                this[propertyName] = true;
                return true;
            }

            return null;
        }

        validateField(field): string {
            if (field.$dirty) {
                var isFieldValid: boolean;
                switch (field.$name) {
                case "userName":
                    isFieldValid = this.disableValidationForNeverValidField(this.usernameValidation(field), "usernameWasCorrect");
                    break;
                case "email":
                        isFieldValid = this.disableValidationForNeverValidField(this.emailValidation(field), "emailWasCorrect");
                    break;
                case "password":
                        isFieldValid = this.disableValidationForNeverValidField(this.validatePassword(), "passwordWasCorrect");
                    break;
                case "retypePassword":
                        isFieldValid = this.disableValidationForNeverValidField(this.validateRetypePassword(), "retypePasswordWasCorrect");
                    break;
                default:
                    isFieldValid = null;
                }

                if (isFieldValid !== null) {
                    if (isFieldValid) {
                        return "fi-valid";
                    }
                    return "fi-invalid";
                }
            }
            return "";
        }

        createNewUser() {
            if (!this.validateForm()) {
                return;
            }

            this.spinnerService.show();
            this.usernameUseByAnotherPerson = false;
            var addUserData = this.getData();

            this.$http.post(this.getAddUserUrl(), addUserData)
                .then((result) => {
                    this.spinnerService.hide();
                    this.successCallback(result.data);
                }, () => {
                    this.spinnerService.hide();
                });
        }
    }

    angular
        .module("insite-admin")
        .controller("AddUserController", AddUserController);
}