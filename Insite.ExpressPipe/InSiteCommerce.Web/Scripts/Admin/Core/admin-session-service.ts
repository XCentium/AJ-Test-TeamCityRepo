module insite_admin {
    import Core = insite.core;
    "use strict";

    export interface IAdminSessionService {
        isAuthenticated(): boolean;
        generateAccessToken(userName: string, password: string): ng.IHttpPromise<any>;
        hasRole(roleName: string): boolean;
        removeAccessToken();
        getAccessToken(): string;
        checkAccessToken(): void;
        signIn(accessToken: string, expiresIn: number, userName: string, password: string, refreshToken: string): ng.IPromise<any>;
        signOut(): ng.IHttpPromise<any>;
        clearSessionState();
        refreshAccessToken(): ng.IPromise<any>;
        resetInactivityTimer();
    }

    export class AdminSessionService implements IAdminSessionService {
        private accessTokenName = "admin-accessToken";
        private accessTokenExpiresOn = "admin-accessToken-expires";
        refreshTokenName = "admin-refreshToken";
        lastActiveTimeName = "admin-lastActiveTime";
        private activityEvents = "keypress mousedown ontouchstart";
        logOutTimer: ng.IPromise<any>;
        private activityTimer: ng.IPromise<any>;
        unsubscribeLocationWatch: Function;
        roles: string[];
        loadedRoles: boolean;
        loadingRoles: boolean;
        static $inject = [
            "$localStorage",
            "sessionService",
            "$http",
            "$q",
            "$location",
            "$window",
            "$document",
            "$timeout",
            "$interval",
            "$rootScope",
            "entityListStateService"
        ];

        constructor(
            protected $localStorage: Core.IWindowStorage,
            protected sessionService: ISessionService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected $location: ng.ILocationService,
            protected $window: ng.IWindowService,
            protected $document: ng.IDocumentService,
            protected $timeout: ng.ITimeoutService,
            protected $interval: ng.IIntervalService,
            protected $rootScope: ng.IRootScopeService,
            protected entityListStateService: IEntityListStateService) {

            if (this.isAuthenticated() && (this.$window.location.pathname.toLowerCase().indexOf("/admin") === 0 || this.$window.location.pathname.toLowerCase().indexOf("/contentadmin") === 0)) {
				this.checkAccessToken();
                this.resetInactivityTimer();
                this.createActivityWatcher();
                this.startInactivityTimer();
            }
            this.roles = null;
        }

        isAuthenticated(): boolean {
            return this.getAccessToken() !== null;
        }

        getAccessToken(): string {
            return this.$localStorage.get(this.accessTokenName, null);
        }

        generateAccessToken(userName: string, password: string): ng.IHttpPromise<any> {
            var getAccessTokenPromise = this.sessionService.getAccessToken(userName, password);

            return getAccessTokenPromise;
        }

        checkAccessToken(): void {
            var expiresOn = this.$localStorage.get(this.accessTokenExpiresOn);
            if (typeof(expiresOn) === "undefined") {
                return;
            }

            var expiresOnDate = new Date(parseInt(expiresOn));
            var now = new Date();
            if (now > expiresOnDate) {
                this.removeAccessToken();
                this.$window.location.reload(true);
                return;
            }

            var fiveMinutesFromNow = new Date(now.getTime() + (5 * 60 * 1000));
            if (fiveMinutesFromNow > expiresOnDate) {
                this.$localStorage.remove(this.accessTokenExpiresOn);
                this.refreshAccessToken();
            }
        }

        refreshAccessToken(): ng.IPromise<any> {
            var deferred = this.$q.defer();
            var refreshToken = this.getRefreshToken();
            if (refreshToken) {
                this.sessionService.refreshAccessToken(refreshToken).then((result : any) => {
                this.setRefreshToken(result.data.refresh_token);
                this.setAccessToken(result.data.access_token, result.data.expires_in);
                deferred.resolve(result);
                }, (error) => {
                    deferred.reject(error);
                });
            } else {
                this.$window.location.reload(true);
            }
           

            return <ng.IPromise<any>>deferred.promise;
        }

        removeAccessToken() {
            if (this.$localStorage.get(this.accessTokenName)) {
                this.$localStorage.remove(this.accessTokenName);
            }
            if (this.$localStorage.get(this.accessTokenExpiresOn)) {
                this.$localStorage.remove(this.accessTokenExpiresOn);
            }
            this.removeRefreshToken();
            this.roles = [];
        }

        private setAccessToken(accessToken: string, expiresIn: number) {
            this.$localStorage.set(this.accessTokenName, accessToken);
            var expiresOn = new Date(new Date().getTime() + (expiresIn * 1000));
            this.$localStorage.set(this.accessTokenExpiresOn, expiresOn.getTime().toString());
            this.loadedRoles = false;
        }

        removeRefreshToken() {
            if (this.getRefreshToken()) {
                this.$localStorage.remove(this.refreshTokenName);
            }
        }

        setRefreshToken(refreshToken: string) {
            this.$localStorage.set(this.refreshTokenName, refreshToken);
        }

        getRefreshToken(): string {
            return this.$localStorage.get(this.refreshTokenName, null);
        }

        hasRole(roleName: string) {
            if (!this.loadedRoles) {
                this.loadRoles();
                return false;
            } else {
                return this.roles.some(o => o.toLowerCase() === roleName.toLowerCase());
            }
        }

        signIn(accessToken: string, expiresIn: number, userName: string, password: string, refreshToken: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.$http.post("/admin/signin", { "userName": userName, "password": password }, { bypassErrorInterceptor: true }).success((result: any) => {
                if (result) {
                    if (result.PasswordShouldChange) {
                        deferred.reject({
                            data: 'Password must be changed.',
                            passwordShouldChange: result.PasswordShouldChange
                        });
                        return;
                    }
                }
                this.resetInactivityTimer();
                this.setAccessToken(accessToken, expiresIn);
                this.setRefreshToken(refreshToken);
                this.startInactivityTimer();
                this.createActivityWatcher();

                this.$rootScope.$broadcast("signed-in");

                deferred.resolve(result);
            }).error((result: any, code: number) => {
                deferred.reject({ data: result, code });
            });
            return <ng.IPromise<any>>deferred.promise;
        }

        signOut(): ng.IHttpPromise<any> {
            var deferred = this.$q.defer();
            var accessToken = this.getAccessToken();
            if (accessToken) {
                this.$http.post("/admin/signout", {}).then(result => {
                    this.clearSessionState();
                    deferred.resolve(result);
                }, error => {
                    deferred.reject(error);
                });
            } else {
                this.clearSessionState();
                deferred.reject();
            }

            
            return <ng.IHttpPromise<any>>deferred.promise;
        }

        clearSessionState() {
            this.removeAccessToken();
            this.stopInactivityTimer();
            this.stopActivityWatcher();
            this.entityListStateService.clearAllStates();
        }

        resetInactivityTimer() {
            this.$localStorage.setObject(this.lastActiveTimeName, new Date());
        }

        private getInactiveTime(): number {
            var lastActiveTimeText = this.$localStorage.getObject(this.lastActiveTimeName);
            if (!lastActiveTimeText) {
                return null;
            }

            var timeDelta = new Date().getTime() - new Date(lastActiveTimeText).getTime();
            return timeDelta;
        }

        private startInactivityTimer() {
            var fifteenMinutes = 900000;
            var twelveMinutes = 720000;
            var thirtySeconds = 30000;
            this.logOutTimer = this.$interval(() => {

                var timeDelta = this.getInactiveTime();
                if (!timeDelta) {
                    this.resetInactivityTimer();
                    return;
                }

                if (timeDelta >= fifteenMinutes) {
                    this.signOut().then(() => {
                        this.$window.location.reload(true);
                    }, () => {
                        this.$window.location.reload(true);
                    });
                    return;
                }

                if (timeDelta >= twelveMinutes) {
                    this.$rootScope.$broadcast("userLogoutWarning");
                    return;
                }

                this.checkAccessToken();
            }, thirtySeconds);
        }

        private stopInactivityTimer() {
            this.$interval.cancel(this.logOutTimer);
        }

        private loadRoles() {
            if (this.getAccessToken() !== null) {
                if (!this.loadingRoles) {
                    this.loadingRoles = true;
                    this.$http.get("/api/v1/admin/userprofiles/current?$select=id").success((model) => {
                        this.$http.get("/api/v1/admin/userprofiles(" + (<any>model).id + ")/roles").success((roles) => {
                            this.roles = (<any>roles).value;
                            this.loadingRoles = false;
                            this.loadedRoles = true;
                        });
                    });
                }

            } else {
                this.roles = [];
            }
        }

        createActivityWatcher() {
            this.$document.bind(this.activityEvents, () => {
                if (!this.activityTimer) {
                    this.resetInactivityTimer();
                    this.activityTimer = this.$timeout(() => {
                        this.activityTimer = null;
                    }, 10000);
                }
            });
        }

        stopActivityWatcher() {
            this.$document.unbind(this.activityEvents);
        }
    }

    angular
        .module("insite-admin")
        .service("adminSessionService", AdminSessionService);
}