module insite_admin {
    import Core = insite.core;
    "use strict";

    export interface IEditEntityAttributes {
        entityId: string;
        pluralizedEntityName: string;
        entityName: string;
        formName: string;
        potentialPropertiesForParentEntityId: string;
        pluralizedNamesForParents: string;
    }

    export class EntityDetailsController {
        model: any;
        initialModel: any;
        serviceUri: string;
        propertyServiceUri: any = {};
        customPropertiesServiceUri: string;

        entityId: string;
        pluralizedEntityName: string;
        entityName: string;
        displayName: string;
        formName: string;

        potentialPropertiesForParentEntityId: string[];
        pluralizedNamesForParents: string[];
        parentUrl: string;

        isNew: boolean;

        multiEditIds: string[];
        multiEditIndex: number;
        nextIndex: number;
        isMultiEditMode: boolean;

        isReady: boolean;
        entityDefinition: any;
        newTabId: string;
        newTabLabel: string;
        fieldValue: string;
        propertyName: string;
        propertyLabel: string;

        form: any;

        dirtyProperties: { [id: string]: boolean; } = {};
        isModelDirty: boolean;

        additionalDirtyChecks: { dirtyCheckName: string, checker(model: any, initialModel: any): boolean; }[] = [];
        modelChanged: boolean = false;

        expandProperties = ["customProperties"];
        instructionalText: string = "";

        navigatingToUri: string;
        checkIndexUrls: string[] = [];
        modal: any;

        now: string;

        archiveFilter: ArchiveFilter;

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
            "ModalFactory"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $window: ng.IWindowService,
            protected $parse: ng.IParseService,
            protected $attrs: IEditEntityAttributes,
            protected $timeout: ng.ITimeoutService,
            protected displayNameService: IDisplayNameService,
            protected $sessionStorage: Core.IWindowStorage,
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
            protected modalFactory: any
        ) {
            this.init();
        }

        init() {
            this.now = new Date().toISOString();
            this.returnToList = this.returnToList.bind(this);
            this.continueNavigation = this.continueNavigation.bind(this);

            this.pluralizedEntityName = this.$attrs.pluralizedEntityName;
            this.entityName = this.$attrs.entityName;
            this.formName = this.$attrs.formName;
            this.potentialPropertiesForParentEntityId = this.$attrs.potentialPropertiesForParentEntityId.split(",");
            this.pluralizedNamesForParents = this.$attrs.pluralizedNamesForParents.split(",");
            this.entityId = this.$attrs.entityId;

            if (this.entityId === "") {
                this.isNew = true;
                this.$sessionStorage.remove(`/data/${this.pluralizedEntityName}_activeTab`);
            }

            this.multiEditIds = this.$sessionStorage.getObject(this.pluralizedEntityName + "_SelectedRecords", []);

            if (this.multiEditIds.length > 1) {
                this.multiEditIndex = this.multiEditIds.indexOf(this.entityId) + 1;
                this.isMultiEditMode = true;
            }

            this.serviceUri = `/api/v1/admin/${this.pluralizedEntityName}`;
            this.customPropertiesServiceUri = "/api/v1/admin/CustomProperties";

            this.model = {};
            this.model.customProperties = [];
            this.initialModel = angular.copy(this.model);

            this.setupIsModelDirtyChecking();

            this.loadModel();
            this.loadEntityDefinition();
            this.$scope.$on("$locationChangeStart", (event, uri) => {
                if (this.checkIfUnsaved()) {
                    event.preventDefault();
                    this.spinnerService.hide();
                    this.navigatingToUri = uri;
                }
            });
            this.$scope.$on(`deleteOrArchiveFinished-${this.pluralizedEntityName}`, () => {
                this.deleteOrArchiveFinished();
            });

            this.$http.get("/admin/GetCheckIndexUrls?pluralizedEntityName=" + this.pluralizedEntityName).success((result: Array<string>) => {
                this.checkIndexUrls = result;
            });
        }

        loadModel(): ng.IPromise<any> {
            var loadModelPromise = this.entityId === "" ?
                this.$http.get(`${this.serviceUri}/default?q=${new Date().getTime()}`) :
                this.$http.get(this.serviceUri + "(" + this.entityId + `)?$expand=${this.expandProperties.join(",")}`);

            return loadModelPromise.success(model => {
                this.setInitialModel(model);
                this.setParentData();
            });
        }

        private loadEntityDefinition() {
            this.entityDefinitionService.getDefinition(this.pluralizedEntityName).then((entityDefinition) => {
                this.entityDefinition = entityDefinition;
            });
        }

        private setParentData(): void {
            var parentData = this.$routeParams.parent;
            if (typeof (parentData) !== "undefined" && parentData !== "") {
                var parentDataKeyValues = parentData.split(",");
                for (var key in parentDataKeyValues) {
                    var parentDataSection = parentDataKeyValues[key];
                    var parentDataValues = parentDataSection.split(" eq ");
                    var parentProperty = parentDataValues[0];
                    var parentValue = parentDataValues[1];
                    this.model[parentProperty] = parentValue;
                }

                this.isModelDirty = false;
                this.initialModel = angular.copy(this.model);
            }

            var parentsData = <string>this.$routeParams.parents;
            var parentidsData = <string>this.$routeParams.parentids;
            if (parentsData && parentidsData) {
                var parents = parentsData.split(",");
                var parentEntityName = parents.pop();
                var parentIds = parentidsData.split(",");
                var parentEntityId = parentIds.pop();
                this.parentUrl = `/data/${parentEntityName.toLowerCase()}/${parentEntityId}`;
                if (parents.length > 0 && parentIds.length > 0) {
                    this.parentUrl = this.parentUrl + `?parents=${parents.join(",")}&parentids=${parentIds.join(",")}`;
                }
            }
        }

        setInitialModel(model: any) {
            this.model = model;
            this.initialModel = angular.copy(this.model);
            this.isReady = true;
            this.setDisplayName();
            this.archiveFilter = model.deactivateOn && new Date(model.deactivateOn).getTime() < Date.now() ? ArchiveFilter.Archived : ArchiveFilter.Active;
        }

        setDisplayName() {
            this.displayNameService.getDisplayNameAsyncFor(this.pluralizedEntityName, this.model).then((result: string) => {
                this.displayName = result;
            });
        }

        previousEntity() {
            if (!isNaN(this.multiEditIndex) && this.multiEditIndex > 0 && this.multiEditIndex <= this.multiEditIds.length) {
                this.nextIndex = this.multiEditIndex - 1;
                this.changeEntity(this.multiEditIds[this.nextIndex - 1]);
            }
        }

        nextEntity() {
            if (!isNaN(this.multiEditIndex) && this.multiEditIndex >= 0 && this.multiEditIndex <= this.multiEditIds.length) {
                this.nextIndex = this.multiEditIndex === this.multiEditIds.length ? 1 : this.multiEditIndex + 1;
                this.changeEntity(this.multiEditIds[this.nextIndex - 1]);
            }
        }

        navigateToEntity() {
            if (isNaN(this.multiEditIndex) || this.multiEditIndex < 1) {
                this.multiEditIndex = 1;
            }

            if (!isNaN(this.multiEditIndex) && this.multiEditIndex > this.multiEditIds.length) {
                this.multiEditIndex = this.multiEditIds.length;
            }

            this.changeEntity(this.multiEditIds[this.multiEditIndex - 1]);
        }

        changeEntity(entityId: string) {
            if (this.checkIfUnsaved()) {
                return;
            }

            this.$location.path(`/data/${this.formName}/${entityId}`);
        }

        saveAndChangeTab(): void {
            this.save(() => {
                this.$foundationApi.publish("switchTabsConfirmation", "close");
                this.moveToNewTabId();
            });
        }

        saveAndAddAnother(): void {
            this.save(() => {
                this.$route.reload();
            });
        }

        saveAndNext(): void {
            this.save(() => {
                this.nextEntity();
            });
        }

        save(afterSave: any): void {
            if (!afterSave && this.isNew) {
                afterSave = (model) => {
                    this.$location.path(`/data/${this.formName}/${model.id}`);
                };
            }

            if (!this.isModelDirty) {
                return;
            }

            if (this.form) {
                // we need to flag fields as touched to make sure the validation error shows up next to them
                this.form.$setSubmitted();
                angular.forEach(this.form.$error.required, field => {
                    field.$setTouched();
                });

                if (!this.form.$valid) {
                    this.notificationService.show(NotificationType.Error, "Please correct all errors below before saving your changes.");
                    return;
                }
            }

            this.checkUniqueConstraints().then(() => {
                var save = () => {
                    var data = this.model;
                    var customPropertiesData = this.model.customProperties;
                    if (!this.isNew) {
                        data = {};
                        customPropertiesData = [];

                        for (var prop in this.dirtyProperties) {
                            if (prop.indexOf("CustomProperty.") === 0) {
                                var customProperty = this.getCustomProperty(prop.substring("CustomProperty.".length));
                                customPropertiesData.push({
                                    id: customProperty.id,
                                    name: customProperty.name,
                                    value: customProperty.value ? customProperty.value.toString() : ""
                                });
                            } else if (this.model.hasOwnProperty(prop)) {
                                data[prop] = this.model[prop];
                            }
                        }
                    }

                    this.spinnerService.show();

                    var saveDetailsFormPromise = this.$q.when(null);
                    if (Object.keys(data).length) {
                        saveDetailsFormPromise = this.saveDetailsForm(data, afterSave);
                    }

                    var saveCustomPropertiesPromise = this.$q.when(null);
                    if (customPropertiesData != null && customPropertiesData.length) {
                        saveCustomPropertiesPromise = this.saveCustomProperties(customPropertiesData);
                    }

                    this.$q.all([saveDetailsFormPromise, saveCustomPropertiesPromise]).then((results: any[]) => {
                        if (angular.isFunction(afterSave)) {
                            afterSave(results[0] || this.model);
                        }
                        this.updateInitialModel();
                        this.spinnerService.hide();
                        this.$rootScope.$broadcast("EntitySaved");
                        this.notificationService.show(NotificationType.Success, `Successfully ${this.isNew ? "created new" : "saved"} ${this.entityDefinition.label.toLowerCase()}!`);
                        if (this.isMultiEditMode) {
                            this.nextEntity();
                        }
                    }, () => {
                        this.spinnerService.hide();
                    });
                };

                if (this.entityDefinition.enforceSingleDefault && this.model.isDefault) {
                    var parentFilter = "";
                    if (this.entityDefinition.enforceSingleDefaultForProperty && this.model.hasOwnProperty(this.entityDefinition.enforceSingleDefaultForProperty)) {
                        parentFilter = `${this.entityDefinition.enforceSingleDefaultForProperty} eq ${this.model[this.entityDefinition.enforceSingleDefaultForProperty]} and `;
                    }

                    this.$http.get(`${this.serviceUri}?$filter=${parentFilter}isDefault eq true and id ne ${this.model.id}&$select=id`).then((result: any) => {
                        var entities = result.data.value;
                        if (entities && entities.length > 0) {
                            this.creategModal(() => {
                                for (var key in entities) {
                                    if (entities.hasOwnProperty(key)) {
                                        this.$http({ method: "PATCH", url: `${this.serviceUri}(${entities[key].id})`, data: { isDefault: false } });
                                    }
                                }

                                save();

                                this.modal.deactivate();
                                this.modal.destroy();
                            });
                        } else {
                            save();
                        }
                    });
                } else {
                    save();
                }
            }, error => {
                var collection = [];
                angular.forEach(error, (value, key) => {
                    var elementName = `${this.entityName}_${key}`;
                    if (this.form[elementName]) {
                        this.form[elementName].$setValidity("duplicateRecordField", false);
                        this.form[elementName].$setTouched();
                    }
                    collection.push(`entityDetailsCtrl.model.${key}`);
                });

                var unWatch = this.$scope.$watchGroup(collection, (newValue, oldValue) => {
                    if (newValue === oldValue) {
                        return;
                    }
                    angular.forEach(error, (value, key) => {
                        var elementName = `${this.entityName}_${key}`;
                        if (this.form[elementName]) {
                            this.form[elementName].$setValidity("duplicateRecordField", true);
                        }
                    });
                    unWatch();
                });
            });
        }

        private creategModal(submitAction: any): void {
            if (!this.modal) {
                var config = {
                    id: "defaultFlagDetailsConfirmation",
                    "class": "modal--medium",
                    templateUrl: "simpleModalDialog",
                    contentScope: {
                        modalDialogText: `There is already a default ${this.entityDefinition.label} set. If you save your changes, you will modify that ${this.entityDefinition.label} to not be the default.`,
                        modalDialogTitle: "Confirm New Default",
                        submitButtonName: "Continue",
                        cancelButtonName: "Cancel",
                        modalSubmitAction: submitAction
                    }
                }

                this.modal = new this.modalFactory(config);
            }

            this.modal.activate();
        }

        private saveDetailsForm(data: any, afterSave: any): ng.IPromise<any> {
            var deferred = this.$q.defer();
            var method = "POST";
            var uri = this.serviceUri;
            if (this.entityId !== "") {
                method = "PATCH";
                uri += `(${this.entityId})`;
            }

            if (!this.isNew) {
                var activeTab = this.fingerTabsService.getSelectedTab(this.$location.path());
                for (var key in data) {
                    if (data.hasOwnProperty(key) && this.propertyServiceUri[key] && this.propertyServiceUri[key].tab === activeTab) {
                        if (data[key] instanceof Array) {
                            method = "POST";
                            uri = this.propertyServiceUri[key].url;
                        } else if (typeof data[key] === "object" && this.propertyServiceUri[key].url === "") {
                            // allow override save without inheritance
                            this.$rootScope.$broadcast("EditEntityAfterSaved");
                            return deferred.promise;
                        }
                    }
                }
            }

            this.$http({
                method: method,
                url: uri,
                data: data
            }).success(model => {
                this.cleanUpModel();
                this.$rootScope.$broadcast("EditEntityAfterSaved");
                deferred.resolve(model);
            });

            return deferred.promise;
        }

        private moveToNewTabId() {
            if (this.newTabId === "editTranslations") {
                this.$rootScope.$broadcast("editTranslations", { "translationMessage": this.fieldValue, "propertyName": this.propertyName.replace(" ", ""), "parentObject": this.model, "parentObjectName": this.entityDefinition.name, "propertyLabel": this.propertyLabel });
            } else {
                this.fingerTabsService.tabs.selectTab(this.newTabId, this.newTabLabel);
            }
        }

        private saveCustomProperties(customPropertiesData: any[]): ng.IPromise<any> {
            var deferred = this.$q.defer();

            for (var index = 0; index < customPropertiesData.length; index++) {
                var customProperty = customPropertiesData[index];
                customProperty.parentId = this.entityId;
                customProperty.parentTable = this.entityDefinition.name.charAt(0).toUpperCase() + this.entityDefinition.name.slice(1);
            }

            var currentIndex = 0;
            var nextProperty = () => {
                if (currentIndex === customPropertiesData.length) {
                    deferred.resolve();
                } else {
                    var currentCustomProperty = customPropertiesData[currentIndex++];

                    var customPropertiesMethod = "POST";
                    var customPropertiesUri = this.customPropertiesServiceUri;
                    if (currentCustomProperty.hasOwnProperty("id") && currentCustomProperty.id !== undefined) {
                        customPropertiesMethod = "PATCH";
                        customPropertiesUri += `(${currentCustomProperty.id})`;
                    }

                    this.$http({
                        method: customPropertiesMethod,
                        url: customPropertiesUri,
                        data: currentCustomProperty
                    }).success(model => {
                        if (model.hasOwnProperty("id")) {
                            var newProperty = <any>model;
                            this.getCustomProperty(newProperty.name).id = newProperty.id;
                        }

                        nextProperty();
                    }).error(() => {
                        nextProperty();
                    });
                }
            };

            nextProperty();

            return deferred.promise;
        }

        callAction(name: string): void {
            this.adminActionService.executeEntityAction(this.formName, name, this.entityId);
        }

        callCustomAction(name: string): void {
            this.adminActionService.executeEntityCustomAction(this.formName, name, this.entityId, this.model, this.$scope);
        }

        cancel(): void {
            if (this.isModelDirty) {
                this.showCancelConfirmation();
                return;
            }

            this.returnToList();
        }

        clear(): void {
            this.model = angular.copy(this.initialModel);
            this.cleanUpModel();
        }

        updateInitialModel(): void {
            this.initialModel = angular.copy(this.model);
            this.cleanUpModel();
        }

        showDeleteConfirmation(): void {
            this.$scope.$broadcast("showDeleteConfirmation", this.entityDefinition.isArchivable, this.pluralizedEntityName,
                this.entityDefinition.pluralizedLabel, this.model.id, this.archiveFilter);
        }

        showCancelConfirmation(): void {
            this.$foundationApi.publish("cancelConfirmation", "open");
        }

        getCustomProperty(name: string): any {
            for (var x = 0; x < this.model.customProperties.length; x++) {
                var property = this.model.customProperties[x];
                if (property.name.toLowerCase() === name.toLowerCase()) {
                    return property;
                }
            }

            var newProperty = <any>{};
            newProperty.name = name;
            newProperty.value = "";
            this.model.customProperties.push(newProperty);

            return newProperty;
        }

        getInitialCustomProperty(name: string): any {
            for (var x = 0; x < this.initialModel.customProperties.length; x++) {
                var property = this.initialModel.customProperties[x];
                if (property.name.toLowerCase() === name.toLowerCase()) {
                    return property;
                }
            }
        }

        changeActiveTab(event: any, tabId: string, tabLabel: string) {
            if ((this.isModelDirty) && !$(event.target).hasClass("disabled")) {
                this.$foundationApi.publish("switchTabsConfirmation", "open");
                event.preventDefault();
                this.newTabId = tabId;
                this.newTabLabel = tabLabel;
            }
        }

        showRawModel() {
            var x = this.$window.open();
            x.document.open();
            x.document.write(`<html><title>Raw json</title><body><pre>${JSON.stringify(this.model, null, 2)}</pre></body></html>`);
            x.document.close();
        }

        discard(): void {
            this.model = angular.copy(this.initialModel);
            this.cleanUpModel();
            this.$foundationApi.publish("switchTabsConfirmation", "close");
            this.moveToNewTabId();
        }

        returnToList(): void {
            this.cleanUpModel();
            this.$location.url(this.parentUrl || `/data/${this.formName}`);
        }

        continueNavigation(): void {
            this.cleanUpModel();

            if (typeof (this.navigatingToUri) === "undefined") {
                this.changeEntity(this.multiEditIds[this.nextIndex - 1]);
                return;
            }

            var protocolAndHost = this.$location.protocol().toLowerCase() + "://" + this.$location.host().toLowerCase() + "/admin";
            if (this.navigatingToUri.toLowerCase().indexOf(protocolAndHost) === 0) {
                this.$location.url(this.navigatingToUri.substr(protocolAndHost.length));
            } else {
                window.location.href = this.navigatingToUri;
            }
        }

        private deleteOrArchiveFinished(): void {
            if (this.isMultiEditMode) {
                this.multiEditIds.splice(this.multiEditIndex - 1, 1);
                this.multiEditIndex = this.multiEditIndex - 1;
                this.$sessionStorage.setObject(this.pluralizedEntityName + "_SelectedRecords", this.multiEditIds);
            }

            if (this.multiEditIds.length > 0) {
                this.nextEntity();
            } else {
                this.returnToList();
            }
        }

        private setupIsModelDirtyChecking(): void {
            this.$scope.$watch("entityDetailsCtrl.model", (newValue) => {
                this.doDirtyChecking(newValue);
            }, true);

            this.$scope.$watch("entityDetailsCtrl.modelChanged", () => {
                this.modelChanged = false;
                this.doDirtyChecking(this.model);
            }, true);
        }

        private doDirtyChecking(newValue: any): void {
            this.isModelDirty = false;
            for (var prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (this.initialModel.hasOwnProperty(prop)) {
                        if (Array.isArray(newValue[prop])) {
                            if (newValue[prop].length !== 0 && prop === "customProperties") {
                                this.doCustomPropertiesDirtyChecking(newValue[prop]);
                            } else {
                                this.doSimpleArrayDirtyChecking(newValue, prop);
                            }
                        }
                        else if (this.initialModel[prop] !== newValue[prop]) {
                            this.dirtyProperties[prop] = this.isModelDirty = true;
                        }
                        else if (this.dirtyProperties.hasOwnProperty(prop)) {
                            delete this.dirtyProperties[prop];
                        }
                    }
                    else if (!this.initialModel.hasOwnProperty(prop)) {
                        this.dirtyProperties[prop] = this.isModelDirty = true;
                    }
                }
            }
            this.additionalDirtyChecks.forEach(additionalCheck => {
                this.isModelDirty = this.isModelDirty || additionalCheck.checker(this.model, this.initialModel);
            });
        }

        private doSimpleArrayDirtyChecking(newValue: any, prop: string) {
            if (JSON.stringify(newValue[prop]) !== JSON.stringify(this.initialModel[prop])) {
                this.dirtyProperties[prop] = this.isModelDirty = true;
            } else {
                delete this.dirtyProperties[prop];
            }
        }

        private doCustomPropertiesDirtyChecking(array: any): void {
            for (var index in array) {
                var customProperty = array[index];
                if (customProperty.hasOwnProperty("value")) {
                    var initialCustomProperty = this.getInitialCustomProperty(customProperty.name);

                    if (initialCustomProperty && initialCustomProperty.hasOwnProperty("value")) {
                        if (initialCustomProperty["value"] !== (customProperty["value"] ? customProperty["value"].toString() : customProperty["value"])) {
                            this.dirtyProperties[`CustomProperty.${customProperty.name}`] = this.isModelDirty = true;
                        }
                        else if (this.dirtyProperties.hasOwnProperty(`CustomProperty.${customProperty.name}`)) {
                            delete this.dirtyProperties[`CustomProperty.${customProperty.name}`];
                        }
                    }
                    else if (!initialCustomProperty && customProperty.value !== "") {
                        this.dirtyProperties[`CustomProperty.${customProperty.name}`] = this.isModelDirty = true;
                    }
                }
            }
        }

        private checkIfUnsaved(): boolean {
            if (this.isModelDirty) {
                this.$foundationApi.publish("navigateAwayConfirmation", "open");
            }

            return this.isModelDirty;
        }

        private cleanUpModel(): void {
            this.isModelDirty = false;
            this.dirtyProperties = {};
        }

        editTranslation = (fieldValue: string, propertyName: string, propertyLabel: string) => {
            if (this.isModelDirty) {
                this.$foundationApi.publish("switchTabsConfirmation", "open");
                event.preventDefault();
                this.newTabId = "editTranslations";
                this.fieldValue = fieldValue;
                this.propertyName = propertyName;
                this.propertyLabel = propertyLabel;
            } else {
                this.$rootScope.$broadcast("editTranslations", { "translationMessage": fieldValue, "propertyName": propertyName.replace(" ", ""), "parentObject": this.model, "parentObjectName": this.entityDefinition.name, "propertyLabel": propertyLabel });
            }
        };

        protected checkUniqueConstraints(): ng.IPromise<any> {
            var promiseArray = [];
            var defer = this.$q.defer();
            this.checkIndexUrls.forEach(url => {
                var select = "&$select=";
                var parsedUrl = url.replace(/{(\w+)}/g, (match, property) => {
                    if (property !== "id") {
                        select += property + ",";
                    }
                    return encodeURIComponent(typeof this.model[property] === "string" ? this.model[property].replace(/'/g, "''") : this.model[property]);
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
                defer.resolve();
            });

            return defer.promise;
        }
    }

    angular
        .module("insite-admin")
        .controller("EntityDetailsController", EntityDetailsController);
}