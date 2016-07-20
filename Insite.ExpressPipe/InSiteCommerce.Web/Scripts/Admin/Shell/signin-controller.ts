module insite_admin {
    "use strict";

    export class SignInController {
        userName: string;
        password: string;
        rememberMe: boolean;
        signInError: string;
        disableSignIn: boolean;
        tokenResult: any;
        returnUrl: string;
        licenseResult: ILicensingResult;
        supportName = "Insite";
        supportEmail = "iscsupport@insitesoft.com";
        supportWebsite = "support.insitesoft.com";

        static $inject = [
            "adminSessionService",
            "$window",
            "$location",
            "$localStorage",
            "$rootScope",
            "licensingService",
            "FoundationApi",
            "ipCookie",
            "$http"
        ];

        constructor(
            protected adminSessionService: IAdminSessionService,
            protected $window: ng.IWindowService,
            protected $location: ng.ILocationService,
            protected $localStorage: insite.core.IWindowStorage,
            protected $rootScope: ng.IRootScopeService,
            protected licensingService: ILicensingService,
            protected $foundationApi: any,
            protected ipCookie: any,
            protected $http: ng.IHttpService
        ) {
            this.rememberMe = this.$localStorage.get("admin-rememberMe") === "true";
            if (this.rememberMe) {
                this.userName = this.$localStorage.get("admin-lastLoggedUser");    
            }

            this.returnUrl = "/admin";

            var queryString = this.$location.search();
            for (var property in queryString) {
                if (queryString.hasOwnProperty(property)) {
                    if (property.toLowerCase() === "returnurl") {
                        this.returnUrl = decodeURIComponent(queryString[property]);
                    }
                }
            }

            if (this.adminSessionService.isAuthenticated()) {
                this.redirectToReturnUrl();
            } else {
                this.ipCookie.remove("CKFinder_Check", { path: "/" });
            }
        }

        redirectToReturnUrl(): void {
            if (window.hasOwnProperty("dataLayer")) {
                this.$http.get("/api/v1/admin/userprofiles/current?$select=id", { bypassErrorInterceptor: true }).then((result: any) => {
                    var data = {
                        "userId": result.data.id,
                        "ISCVer": window["currentVersion"],
                        "event": "logIn"
                    };

                    window["dataLayer"].push(data);
                });
            }
            var returnUrl = this.returnUrl.toLowerCase();
            if (returnUrl.indexOf("/admin") === 0) {
                this.$location.url(returnUrl.replace("/admin", "")).search("returnUrl", null);
            } else {
                this.$window.location.href = this.returnUrl;
            }
        }

        initiateSignIn(form) {
            if (!form.$valid) {
                return;
            }

            angular.element(document.activeElement).blur();
            this.disableSignIn = true;
            this.signInError = "";

            this.adminSessionService.generateAccessToken(this.userName, this.password).success(result => {
                this.tokenResult = result;
                this.licensingService.validateLicense(this.userName, this.password).then((data: ILicensingResult) => {
                    if (data.status !== "Permanent") {
                        // show modal message for licenses that are not permanent; completeSignin will be called when finished
                        this.licenseResult = data;
                        this.$foundationApi.publish("licenseModal", "open");
                    } else {
                        this.completeSignin(this.tokenResult);
                    }
                }, () => {
                    // license is expired
                    this.adminSessionService.clearSessionState();
                    this.disableSignIn = false;
                    this.signInError = `Your license has expired. Please contact ${this.supportName} Commerce support at ${this.supportEmail} or ${this.supportWebsite} for further information.`;
                });
            }).error((error, status) => {
                this.disableSignIn = false;
                if (status === 400) {
                    this.signInError = error.error_description;
                } else {
                    this.signInError = "Error occurred during authentication";
                }
            });
        }

        completeSignin(result) {
            this.adminSessionService.signIn(result.access_token, result.expires_in, this.userName, this.password, result.refresh_token).then(() => {
                this.$localStorage.set("admin-rememberMe", this.rememberMe.toString());

                if (this.rememberMe) {
                    this.$localStorage.set("admin-lastLoggedUser", this.userName);
                } else {
                    this.$localStorage.remove("admin-lastLoggedUser");
                }

                this.redirectToReturnUrl();
            }, error => {
                this.disableSignIn = false;
                if (error.code !== 403 && error.passwordShouldChange) {
                    this.$foundationApi.publish("changePasswordModal", "open");
                    this.$rootScope.$broadcast("resetPasswordForm", {
                        userName: this.userName,
                        accessToken: result.access_token
                    });
                }

                if (error.code === 403) {
                    this.signInError = "You don't have permissions";
                } else if (error.data.message) {
                    this.signInError = error.data.message;
                } else {
                    this.signInError = error.data;
                }
            });
        }

        closeLicenseWarning() {
            this.completeSignin(this.tokenResult);
        }
    }

    angular
        .module("insite-admin")
        .controller("SignInController", SignInController);
}