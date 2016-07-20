import SessionModel = Insite.Account.WebApi.V1.ApiModels.SessionModel;
import CurrentContextModel = insite.core.CurrentContextModel;

module insite.account {
    "use strict";

    export interface ISessionService {
        getSession(): ng.IPromise<SessionModel>;
        getAccessToken(userName: string, password: string): ng.IHttpPromise<any>;
        refreshAccessToken(refreshToken: string): ng.IHttpPromise<any>;
        setAccessToken(accessToken: string);
        retrieveAccessToken(): string;
        removeAccessToken();
        getContext(): CurrentContextModel;
        setContext(context: CurrentContextModel);
        setContextFromSession(session: SessionModel);
        isAuthenticated(): boolean;
        getIsAuthenticated(): ng.IPromise<boolean>;
        signIn(accessToken: string, userName: string, password: string): ng.IPromise<SessionModel>;
        signOut(): ng.IPromise<string>;
        setLanguage(languageId: System.Guid): ng.IPromise<SessionModel>;
        setCurrency(currencyId: System.Guid): ng.IPromise<SessionModel>;
        setCustomer(billToId: System.Guid, shipToId: System.Guid): ng.IPromise<SessionModel>;
        updateSession(session: SessionModel): ng.IHttpPromise<SessionModel>;
        changePassword(session: SessionModel, accessToken?: string): ng.IPromise<SessionModel>;
        resetPassword(session: SessionModel): ng.IHttpPromise<SessionModel>;
        redirectAfterSelectCustomer(sessionModel: SessionModel, byPassAddressPage: boolean, dashboardUrl: string,
            returnUrl: string, checkoutAddressUrl: string, reviewAndPayUrl: string, addressesUrl: string);
        clearLocalInformation();
    }

    export class SessionService implements ISessionService {

        isAuthenticatedOnServerUri = this.coreService.getApiUri("/account/isauthenticated");
        serviceUri = this.coreService.getApiUri("/api/v1/sessions");
        tokenUri = this.coreService.getApiUri("/identity/connect/token");

        authRetryCount = 0;

        static $inject = [
            "$http",
            "$rootScope",
            "$q",
            "$localStorage",
            "$window",
            "ipCookie",
            "coreService",
            "base64"
        ];

        constructor(protected $http: ng.IHttpService,
            protected $rootScope: ng.IRootScopeService,
            protected $q: ng.IQService,
            protected $localStorage: core.IWindowStorage,
            protected $window: ng.IWindowService,
            protected ipCookie: any,
            protected coreService: core.ICoreService,
            protected base64: any) {
            if (this.ipCookie("InitiateImpersonate")) {
                this.clearLocalInformation();
                document.cookie = "InitiateImpersonatePhaseTwo=true;";
            } else if (this.ipCookie("InitiateImpersonatePhaseTwo")) {
                document.cookie = "InitiateImpersonatePhaseTwo=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        }

        getSession(): ng.IPromise<SessionModel> {
            var deferred = this.$q.defer();
            var isAuthenticatedOnServer;
            this.$http.get(this.isAuthenticatedOnServerUri + "?timestamp=" + Date.now()).success((authenticatedResult: any) => {

                isAuthenticatedOnServer = authenticatedResult.isAuthenticatedOnServer;

                // if the user IS NOT authenticated on the server, but they DO have an access token, remove the access token
                if ((!isAuthenticatedOnServer && this.isAuthenticated()) || this.ipCookie("InitiateImpersonatePhaseTwo")) {

                    this.removeAuthentication();

                    // invalidate etags
                    this.$http({
                        method: "PATCH",
                        url: this.serviceUri + "/current",
                    }).then((response) => {
                        this.getSessionFromServer().then((session: SessionModel) => {
                            // force -reload- redirect the browser window to invalidate all the etags and not get any stale data
                            this.$window.location.assign(this.$window.location.href); //not reload, because it has strange behavior in IE (it's retrive back localStorage, cookies etc which already deleted)
                            return deferred.resolve(session);
                        }, (error: any) => {
                            return deferred.reject(error);
                        });
                    });

                    return deferred.reject(null);
                }
                // if the user IS authenticated on the server, but DOES NOT have an access token, get an access token
                else if (isAuthenticatedOnServer && !this.isAuthenticated()) {
                    this.$http.post(this.coreService.getApiUri("/account/accesstoken"), null).success((result: any) => {
                        this.setAccessToken(result.access_token);

                        // invalidate etags
                        this.$http({
                            method: "PATCH",
                            url: this.serviceUri + "/current",
                        }).then((response) => {
                            this.getSessionFromServer().then((session: SessionModel) => {
                                // force -reload- redirect the browser window to invalidate all the etags and not get any stale data
                                this.$window.location.assign(this.$window.location.href); //not reload, because it has strange behavior in IE (it's retrive back localStorage, cookies etc which already deleted)
                                return deferred.resolve(session);
                            }, (error: any) => {
                                return deferred.reject(error);
                            });
                        });

                        return deferred.reject(null);
                    });
                } else {
                    this.getSessionFromServer().then((session: SessionModel) => {
                        return deferred.resolve(session);
                    }, (error: any) => {
                        return deferred.reject(error);
                    });
                }
            });

            return deferred.promise;
        }

        getSessionFromServer(): ng.IPromise<SessionModel> {
            var deferred = this.$q.defer();
            this.$http.get(this.serviceUri + "/current").success((session: SessionModel) => {
                this.setContextFromSession(session);
                this.$rootScope.$broadcast("sessionLoaded", session);
                deferred.resolve(session);
            }).error(error => {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        getAccessToken(userName: string, password: string): ng.IHttpPromise<any> {
            var loginData = "grant_type=password&username=" + encodeURIComponent(userName) + "&password=" + encodeURIComponent(password) + "&scope=" + insiteScope + " offline_access";
            var config = {
                headers: {
                    "Authorization": "Basic " + this.base64.encode(insiteBasicAuthHeader),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                bypassErrorInterceptor: true
            };

            return this.$http.post(this.tokenUri, loginData, config);
        }

        refreshAccessToken(refreshToken: string): ng.IHttpPromise<any> {
            var insiteBasicAuth = insiteBasicAuthHeader.split(":");
            var loginData = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(refreshToken) + "&client_id=" + insiteBasicAuth[0] + "&client_secret=" + insiteBasicAuth[1];

            var config = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                bypassErrorInterceptor: true,
                skipAddAccessToken: true
            };

            return this.$http.post(this.tokenUri, loginData, config);
        }

        setAccessToken(accessToken: string) {
            this.$localStorage.set("accessToken", accessToken);
        }

        retrieveAccessToken(): string {
            return this.$localStorage.get("accessToken");
        }

        removeAccessToken() {
            if (this.$localStorage.get("accessToken"))
                this.$localStorage.remove("accessToken");
        }

        getContext(): CurrentContextModel {
            var context: CurrentContextModel = {
                pageUrl: "",
                billToId: this.ipCookie("CurrentBillToId"),
                shipToId: this.ipCookie("CurrentShipToId"),
                currencyId: this.ipCookie("CurrentCurrencyId"),
                languageId: this.ipCookie("CurrentLanguageId")
            };
            return context;
        }

        setContext(context: CurrentContextModel) {
            if (context.billToId) {
                this.ipCookie("CurrentBillToId", context.billToId, { path: "/" });
            } else {
                this.ipCookie.remove("CurrentBillToId", { path: "/" });
            }
            if (context.shipToId) {
                this.ipCookie("CurrentShipToId", context.shipToId, { path: "/" });
            } else {
                this.ipCookie.remove("CurrentShipToId", { path: "/" });
            }
            if (context.currencyId) {
                this.ipCookie("CurrentCurrencyId", context.currencyId, { path: "/" });
            } else {
                this.ipCookie.remove("CurrentCurrencyId", { path: "/" });
            }
            if (context.languageId) {
                this.ipCookie("CurrentLanguageId", context.languageId, { path: "/" });
            } else {
                this.ipCookie.remove("CurrentLanguageId", { path: "/" });
            }
        }

        setContextFromSession(session: SessionModel) {
            var context: CurrentContextModel = {
                pageUrl: "",
                languageId: session.language.id,
                currencyId: session.currency.id,
                billToId: session.billTo ? session.billTo.id : null,
                shipToId: session.shipTo ? session.shipTo.id : null
            };
            this.setContext(context);
        }

        isAuthenticated(): boolean {
            return this.$localStorage.get("accessToken", null) !== null;
        }

        getIsAuthenticated(): ng.IPromise<boolean> {
            var deferred = this.$q.defer();
            var isAuthenticatedOnServer;
            this.$http.get(this.isAuthenticatedOnServerUri + "?timestamp=" + Date.now()).success((authenticatedResult: any) => {
                isAuthenticatedOnServer = authenticatedResult.isAuthenticatedOnServer;

                // if the user IS NOT authenticated on the server, but they DO have an access token, remove the access token
                if (!isAuthenticatedOnServer && this.isAuthenticated()) {

                    this.removeAuthentication();

                    // invalidate etags
                    this.$http({
                        method: "PATCH",
                        url: this.serviceUri + "/current"
                    });
                }

                return deferred.resolve(isAuthenticatedOnServer);
            });

            return deferred.promise;
        }

        removeAuthentication() {
            this.removeAccessToken();
            var currentContext = this.getContext();
            currentContext.billToId = null;
            currentContext.shipToId = null;
            this.setContext(currentContext);
        }

        signIn(accessToken: string, userName: string, password: string): ng.IPromise<SessionModel> {
            this.setAccessToken(accessToken);
            var deferred = this.$q.defer();
            this.$http.post(this.serviceUri, { "userName": userName, "password": password }, { bypassErrorInterceptor: true }).success(result => {
                deferred.resolve(result);
            }).error((data, status) => {
                this.removeAccessToken();
                var error = { data: data, status: status };
                deferred.reject(error);
            });
            return deferred.promise;
        }

        signOut(): ng.IPromise<string> {
            var deferred = this.$q.defer();
            this.$http.delete(this.serviceUri + "/current").success(result => {
                this.removeAuthentication();
                deferred.resolve(result);
            }).error(error => {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        setLanguage(languageId: System.Guid): ng.IPromise<SessionModel> {
            var deferred = this.$q.defer();
            this.$http({
                method: "PATCH",
                url: this.serviceUri + "/current",
                data: { "language": { "id": languageId } }
            }).success(result => {
                var currentContext = this.getContext();
                currentContext.languageId = languageId;
                this.setContext(currentContext);
                deferred.resolve(result);
            }).error(error => {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        setCurrency(currencyId: System.Guid): ng.IPromise<SessionModel> {
            var deferred = this.$q.defer();
            this.$http({
                method: "PATCH",
                url: this.serviceUri + "/current",
                data: { "currency": { "id": currencyId } }
            }).success(result => {
                var currentContext = this.getContext();
                currentContext.currencyId = currencyId;
                this.setContext(currentContext);
                deferred.resolve(result);
            }).error(error => {
                deferred.reject(error);
            });;
            return deferred.promise;
        }

        setCustomer(billToId: System.Guid, shipToId: System.Guid): ng.IPromise<SessionModel> {
            var deferred = this.$q.defer();
            this.$http({
                method: "PATCH",
                url: this.serviceUri + "/current",
                data: { "billTo": { "Id": billToId }, "shipTo": { "Id": shipToId } },
                bypassErrorInterceptor: true
            }).success(result => {
                var currentContext = this.getContext();
                currentContext.billToId = billToId;
                currentContext.shipToId = shipToId;
                this.setContext(currentContext);
                deferred.resolve(result);
            }).error(error => {
                deferred.reject(error);
            });;
            return deferred.promise;;
        }

        updateSession(session: SessionModel): ng.IHttpPromise<SessionModel> {
            return this.$http({
                method: "PATCH",
                url: this.serviceUri + "/current",
                data: session
            });
        }

        changePassword(session: SessionModel, accessToken?: string): ng.IPromise<SessionModel> {
            var deferred = this.$q.defer();
            if (accessToken) {
                this.setAccessToken(accessToken);
            }
            this.$http({ method: "PATCH", url: this.serviceUri + "/current", data: session, bypassErrorInterceptor: true }).success(result => {
                deferred.resolve(result);
            }).error(error => {
                if (accessToken) {
                    this.removeAccessToken();
                }
                deferred.reject(error);
            });
            return deferred.promise;
        }

        resetPassword(session: SessionModel): ng.IHttpPromise<SessionModel> {
            return this.$http({ method: "PATCH", url: this.serviceUri + "/current", data: session, bypassErrorInterceptor: true });
        }

        redirectAfterSelectCustomer(sessionModel: SessionModel, byPassAddressPage: boolean,
            dashboardUrl: string, returnUrl: string, checkoutAddressUrl: string, reviewAndPayUrl: string, addressesUrl: string) {
            if (sessionModel.customLandingPage) {
                returnUrl = sessionModel.customLandingPage;
            } else if (sessionModel.dashboardIsHomepage) {
                returnUrl = dashboardUrl;
            } else if (sessionModel.shipTo.isNew) {
                returnUrl = addressesUrl;
            }
            if (returnUrl.toLowerCase() == checkoutAddressUrl.toLowerCase() && byPassAddressPage) {
                returnUrl = reviewAndPayUrl;
            }
            this.$window.location.href = returnUrl;
        }

        clearLocalInformation() {
            sessionStorage.clear();
            this.removeAccessToken();
        }
    }

    angular
        .module("insite")
        .service("sessionService", SessionService);
}