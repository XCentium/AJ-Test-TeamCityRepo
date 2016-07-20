module insite_admin {
    "use strict";

    export class CopyWebsiteController {
        nameInUse: boolean;
        copyInProgress: boolean;
        form: any;

        websiteId: string;
        websiteName: string;

        model: any;

        setWebsiteAsParent = false;
        copyCategories = false;
        copyConfigurationOptions = false;
        copyPromotions = false;
        copyCrossSells = false;
        copyCarriers = false;
        copyCountries = false;
        copyStates = false;
        copyDealers = false;
        copyCurrencies = false;
        copyLanguages = false;
        copyApplicationMessages = false;
        copyCmsContent = false;
        linkCmsContent = false;

        checkIndexUrls: string[] = [];

        static $inject = ["$http", "$scope", "spinnerService", "FoundationApi", "notificationService", "$q", "websiteService"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected notificationService: INotificationService,
            protected $q: ng.IQService,
            protected websiteService: IWebsiteService
        ) {
            this.clearData();

            this.$scope.$on("AdminAction-Detail:CopyWebsite", (event, arg) => {
                this.websiteId = arg.entityId;
                this.clearData();

                this.getWebsiteName();
                this.openModal();
            });

            this.$scope.$watch(() => this.copyCmsContent, () => {
                if (this.copyCmsContent) {
                    this.linkCmsContent = false;
                }
            });

            this.$scope.$watch(() => this.linkCmsContent, () => {
                if (this.linkCmsContent) {
                    this.copyCmsContent = false;
                }
            });

            this.$scope.$watch(() => this.setWebsiteAsParent, () => {
                if (this.setWebsiteAsParent === false) {
                    this.linkCmsContent = false;
                }
            });

            this.$scope.$watch(() => this.model.microSiteIdentifiers, (newValue, oldValue) => {
                if (!oldValue) {
                    var elementName = "website_domainName";
                    if (this.form && this.form[elementName]) {
                        this.form[elementName].$setValidity("duplicateRecordField", true);
                    }
                }
            });

            this.$http.get("/admin/GetCheckIndexUrls?pluralizedEntityName=websites").success((result: Array<string>) => {
                this.checkIndexUrls = result;
            });
        }

        clearData(): void {
            this.model = {};
            this.model.name = "";
            this.model.domainName = "";
            this.model.microSiteIdentifiers = "";
        }

        getWebsiteName(): void {
            this.$http.get(`/api/v1/admin/websites(${this.websiteId})`).success((result: any) => {
                this.websiteName = result.name;
                this.model.name = "Copy of " + result.name;
            });
        }

        openModal() {
            this.$foundationApi.publish("copyWebsiteModal", "open");
        }

        copyWebsite() {
            if (this.form) {
                angular.forEach(this.form.$error.required, field => {
                    field.$setTouched();
                });
            }

            if (this.form && !this.form.$valid) {
                return;
            }

            this.checkUniqueConstraints().then(success => {
                var params = {
                    websiteId: this.websiteId,
                    newWebsiteName: this.model.name,
                    domainName: this.model.domainName,
                    microSiteIdentifiers: this.model.microSiteIdentifiers,
                    newWebsiteParentId: this.setWebsiteAsParent ? this.websiteId : null,
                    copyCategories: this.copyCategories,
                    copyConfigurationOptions: this.copyConfigurationOptions,
                    copyPromotions: this.copyPromotions,
                    copyCrossSells: this.copyCrossSells,
                    copyCarriers: this.copyCarriers,
                    copyCountries: this.copyCountries,
                    copyStates: this.copyStates,
                    copyDealers: this.copyDealers,
                    copyCurrencies: this.copyCurrencies,
                    copyLanguages: this.copyLanguages,
                    copyApplicationMessages: this.copyApplicationMessages,
                    copyCmsContent: this.copyCmsContent,
                    linkCmsContent: this.linkCmsContent
                };

                this.spinnerService.show();
                this.copyInProgress = true;
                this.$http({ method: "POST", url: "/admin/websites/copy", params: params }).success((result: any) => {
                    this.$foundationApi.publish("copyWebsiteModal", "close");
                    this.notificationService.show(NotificationType.Success, "Website successfully copied");
                }).error(() => {
                    this.notificationService.show(NotificationType.Error, "Unknown error occurred");
                }).finally(() => {
                    this.copyInProgress = false;
                    this.spinnerService.hide();
                });
            }, error => {
                var collection = [];
                angular.forEach(error, (value, key) => {
                    var elementName = `website_${key}`;
                    if (this.form[elementName]) {
                        this.form[elementName].$setValidity("duplicateRecordField", false);
                        this.form[elementName].$setTouched();
                    }
                    collection.push(`vm.model.${key}`);
                });

                var unWatch = this.$scope.$watchGroup(collection, (newValue, oldValue) => {
                    if (newValue === oldValue) {
                        return;
                    }
                    angular.forEach(error, (value, key) => {
                        var elementName = `website_${key}`;
                        if (this.form[elementName]) {
                            this.form[elementName].$setValidity("duplicateRecordField", true);
                        }
                    });
                    unWatch();
                });
            });
        }

        private checkUniqueConstraints(): ng.IPromise<any> {
            var promiseArray = [];
            var defer = this.$q.defer();
            this.checkIndexUrls.forEach(url => {
                var select = "&$select=";
                var parsedUrl = url.replace(/{(\w+)}/g, (match, property) => {
                    if (property !== "id") {
                        select += property + ",";
                        return this.model[property];    
                    }

                    return "00000000-0000-0000-0000-000000000000";
                });
                parsedUrl += select.slice(0, -1);
                promiseArray.push(this.$http.get(parsedUrl));
            });

            this.$q.all(promiseArray).then(results => {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].data.value.length > 0) {
                        defer.reject(results[i].data.value[0]);
                        return;
                    }
                }

                this.websiteService.checkDomainNameForDuplicates("00000000-0000-0000-0000-000000000000", this.model.domainName, this.model.microSiteIdentifiers).then(() => {
                    defer.resolve();
                }, error => {
                    defer.reject(error);
                });
            });

            return defer.promise;
        }
    }

    angular
        .module("insite-admin")
        .controller("CopyWebsiteController", CopyWebsiteController)
        .directive("isaCopyWebsiteAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                transclude: true,
                controller: "CopyWebsiteController",
                templateUrl: "/admin/directives/CopyWebsiteAction",
                controllerAs: "vm",
                scope: { }
            }
        });
}