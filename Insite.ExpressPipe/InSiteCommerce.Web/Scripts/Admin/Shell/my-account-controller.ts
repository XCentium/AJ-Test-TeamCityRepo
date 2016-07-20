module insite_admin {
    "use strict";

    export class MyAccountViewModel {
        userName: string;
        roles: string;
        email: string;
        firstName: string;
        lastName: string;
        position: string;
        company: string;
        phone: string;
        extension: string;
        fax: string;
        languageId: string;
        passwordChangedOn: string;
    }

    export class MyAccountController {
        initUser = new MyAccountViewModel();
        user = new MyAccountViewModel();

        userProfileForm: any;
        awayUrl: string;

        static $inject = ["notificationService", "$rootScope", "$http", "$scope", "FoundationApi", "$location", "spinnerService", "$templateCache", "entityDefinitionService", "deleteEntityService"];

        constructor(
            protected notificationService: INotificationService,
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected $location: ng.ILocationService,
            protected spinnerService: ISpinnerService,
            protected $templateCache: ng.ITemplateCacheService,
            protected entityDefinitionService: EntityDefinitionService,
            protected deleteEntityService: IDeleteEntityService) {
            this.init();
        }

        init() {
            this.loadData();

            this.$scope.$on("$locationChangeStart", (event, uri) => {
                if (this.isUserProfileChanged()) {
                    event.preventDefault();
                    this.spinnerService.hide();
                    this.awayUrl = uri;
                    this.$foundationApi.publish("userProfileUnsavedModal", "open");
                }
            });

            this.$rootScope.$on("passwordChanged", () => {
                this.$http.get("/admin/account/getuserdata").success((result: MyAccountViewModel) => {
                    this.initUser.passwordChangedOn = this.user.passwordChangedOn = result.passwordChangedOn;
                });
            });
        }

        loadData() {
            this.$http.get("/admin/account/getuserdata").success((result: MyAccountViewModel) => {
                this.initUser = result;
                this.user = JSON.parse(JSON.stringify(this.initUser));
            });
        }

        isUserProfileChanged(): boolean {
            return JSON.stringify(this.initUser) !== JSON.stringify(this.user);
        }

        save() {
            this.$http.post("/admin/account", this.user).success(() => {
                this.initUser = this.user;
                this.resetForm();
                this.$rootScope.$broadcast("userProfileChanged");
            });
        }

        saveAndGoAway() {
            this.save();
            this.goAway();
        }

        goAway() {
            this.$foundationApi.publish("userProfileUnsavedModal", "close");
            this.resetForm();
            this.$location.url(this.awayUrl.replace(this.$location.protocol() + "://" + this.$location.host() + "/admin", ""));
        }

        resetForm() {
            this.user = JSON.parse(JSON.stringify(this.initUser));
            if (this.userProfileForm) {
                this.userProfileForm.$setPristine();
                this.userProfileForm.$setUntouched();
            }
        }

        resetChangePasswordForm() {
            this.$rootScope.$broadcast("resetPasswordForm", this.user);
        }

        clearCache(): void {
            this.spinnerService.show();
            this.clearTemplates();
            this.$http.get(`/api/v1/admin/userprofiles?$filter=username eq '${this.user.userName}'&$expand=userProfilePreferences($select=id)&$select=userProfilePreferences`)
                .then((result: any) => {
                    if (result.data.value.length > 0 && result.data.value[0].userProfilePreferences) {
                        var ids = [];
                        for (var i = 0; i < result.data.value[0].userProfilePreferences.length; i++) {
                            ids.push(result.data.value[0].userProfilePreferences[i].id);
                        }

                        if (ids.length === 0) {
                            this.showClearCacheSuccess();
                            return;
                        }
                        this.deleteEntityService.delete("userprofilepreferences", ids).then(() => {
                            this.showClearCacheSuccess();
                        }, () => {
                            this.showClearCacheError();
                        });

                    } else {
                        this.showClearCacheError();
                    }
                }, () => {
                    this.showClearCacheError();
                });
        }

        private clearTemplates(): void {
            this.entityDefinitionService.getAllDefinitions("pluralizedName").then((result) => {
                for (var i = 0; i < result.data.value.length; i++) {
                    var key = `/admin/data/${result.data.value[i].pluralizedName}`;
                    if (this.$templateCache.get(key)) {
                        this.$templateCache.remove(key);
                    }
                }
            });
        }

        private showClearCacheSuccess(): void {
            this.spinnerService.hide();
            this.notificationService.show(NotificationType.Success, "Cache has been cleared.");
        }

        private showClearCacheError(): void {
            this.spinnerService.hide();
            this.notificationService.show(NotificationType.Error, "The cache was not cleared, please try again.");
        }
    }

    angular
        .module("insite-admin")
        .controller("MyAccountController", MyAccountController)
        .directive("isaValidEmail", () => {
            return {
                require: "ngModel",
                restrict: "",
                link(scope, elm, attrs, ctrl) {
                    if (ctrl && ctrl.$validators.email) {
                        ctrl.$validators.email = modelValue => (ctrl.$isEmpty(modelValue) || /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(modelValue));
                    }
                }
            }
        });
}