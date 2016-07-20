module insite_admin {
    "use strict";

    export class WebsiteDetailsController extends EntityDetailsController {

        static $inject = [
            "$rootScope",
            "$scope",
            "$http",
            "$window",
            "$parse",
            "$attrs",
            "$timeout",
            "displayNameService",
            "$sessionStorage",
            "$location",
            "breadcrumbService",
            "deleteEntityService",
            "spinnerService",
            "fingerTabsService",
            "$routeParams",
            "FoundationApi",
            "$q",
            "entityDefinitionService",
            "adminActionService",
            "$route",
            "notificationService",
            "ModalFactory",
            "websiteService"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $window: ng.IWindowService,
            protected $parse: ng.IParseService,
            protected $attrs: IEditEntityAttributes,
            protected $timeout: ng.ITimeoutService,
            protected displayNameService: IDisplayNameService,
            protected $sessionStorage: insite.core.IWindowStorage,
            protected $location: ng.ILocationService,
            protected breadcrumbService: IBreadcrumbService,
            protected deleteEntityService: IDeleteEntityService,
            protected spinnerService: ISpinnerService,
            protected fingerTabsService: FingerTabsService,
            protected $routeParams: any,
            protected $foundationApi: any,
            protected $q: ng.IQService,
            protected entityDefinitionService: EntityDefinitionService,
            protected adminActionService: IAdminActionService,
            protected $route: ng.route.IRouteService,
            protected notificationService: INotificationService,
            protected modalFactory: any,
            protected websiteService: IWebsiteService
        ) {
            super($rootScope, $scope, $http, $window, $parse, $attrs, $timeout, displayNameService, $sessionStorage,
                $location, breadcrumbService, deleteEntityService, spinnerService, fingerTabsService, $routeParams,
                $foundationApi, $q, entityDefinitionService, adminActionService, $route, notificationService, modalFactory);

            // set domainName as valid, if user tried to save without microSiteIdentifiers
            this.$scope.$watch(() => this.model.microSiteIdentifiers, (newValue, oldValue) => {
                if (!oldValue) {
                    var elementName = `${this.entityName}_domainName`;
                    if (this.form && this.form[elementName]) {
                        this.form[elementName].$setValidity("duplicateRecordField", true);
                    }
                }
            });
        }

        init() {
            this.expandProperties = ["customProperties", "categories($select=id)"];
            super.init();
        }

        protected checkUniqueConstraints(): ng.IPromise<any> {
            var defer = this.$q.defer();
            super.checkUniqueConstraints().then(() => {
                this.websiteService.checkDomainNameForDuplicates(this.model.id, this.model.domainName, this.model.microSiteIdentifiers).then(() => {
                    defer.resolve();
                }, error => {
                    defer.reject(error);
                });
            }, error => {
                defer.reject(error);
            });

            return defer.promise;
        }
    }

    angular
        .module("insite-admin")
        .controller("WebsiteDetailsController", WebsiteDetailsController);
}