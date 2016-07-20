module insite_admin {
    "use strict";

    export class FromPropertyController {
        selectedEntityId: any;
        disabled: string;
        
        // standard
        lookups: any;

        // application setting
        applicationSettingLookups: any;

        // lookup
        naturalKeys: any;
        naturalKeyEntityIds: any;

        // content
        contentEntityId: any;
        languageEntityId: any;
        personaEntityId: any;
        deviceEntityId: any;
        contentLookups: any;
        languageLookups: any;
        personaLookups: any;
        deviceLookups: any;
        languageDatasource: any;
        personaDatasource: any;
        deviceDatasource: any;

        static $inject = ["$scope", "$http", "naturalKeyService"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected naturalKeyService: INaturalKeyService
        ) {
            this.init();
        }

        init() {
            this.$scope.$watchGroup(["model.id", "model.fieldType", "model.toProperty"], () => {
                this.getAllLookups();
            });

            this.$scope.$watchCollection("vm.naturalKeyEntityIds", () => {
                this.convertNaturalKeysToFromProperty();
            });

            this.$scope.$watchGroup(["vm.contentEntityId", "vm.languageEntityId", "vm.deviceEntityId", "vm.personaEntityId"], () => {
                this.convertColumnLanguageDevicePersonaToFromProperty();
            });
        }

        getAllLookups() {
            // standard
            if (!this.lookups) {
                var uri = `/api/v1/admin/jobdefinitionsteps(${this.$scope["model"].jobDefinitionStepId})`;
                this.$http.get(uri).success(o => {
                    var currentLookups = [];
                    var selectFields = this.getSelectFieldsFromSelectClause((<any>o).selectClause);
                    for (var x = 0; x < selectFields.length; x++) {
                        currentLookups.push({ id: selectFields[x], name: selectFields[x], group: "Data Fields" });
                    }
                    this.lookups = currentLookups;
                    this.initializeValuesForContentLookup();
                });
            }

            // application setting
            if (!this.applicationSettingLookups) {
                var uri2 = `/api/v1/admin/applicationsettings`;
                this.$http.get(uri2).success(o => {
                    var currentLookups = [];
                    var appSettings = (<any>o).value || [];
                    for (var x = 0; x < appSettings.length; x++) {
                        currentLookups.push({ id: appSettings[x].name, name: appSettings[x].name });
                    }
                    this.applicationSettingLookups = currentLookups.sort((a, b) => (a.name.localeCompare(b.name)));
                });
            }

            // lookup
            if (this.$scope["model"].toProperty) {
                this.naturalKeys = this.naturalKeyService.getRootLevelNaturalKeys(this.$scope["model"].toProperty);
                if (this.naturalKeys.length === 0) {
                    this.naturalKeys.push({ name: "fromProperty", label: "From Property", naturalKeySequence: "0" });
                }
                this.initializeValuesForLookupFieldType();
            }

            // content
            if (!this.languageLookups) {
                this.$http.get(`/api/v1/admin/languages`).success(o => {
                    var languages = (<any>o).value;
                    var currentLanguageLookups = [];
                    for (var x = 0; x < languages.length; x++) {
                        currentLanguageLookups.push({ id: `"${languages[x].languageCode}"`, name: languages[x].languageCode, group: "System Languages" });
                    }
                    this.languageLookups = currentLanguageLookups.sort((a, b) => (a.name.localeCompare(b.name)));
                    currentLanguageLookups.unshift({ id: "", name: "System Default", group: "System Languages" });
                    this.initializeValuesForContentLookup();
                });
            }

            if (!this.personaLookups) {
                this.$http.get(`/api/v1/admin/personas`).success(o => {
                    var personas = (<any>o).value;
                    var currentPersonaLookups = [];
                    for (var y = 0; y < personas.length; y++) {
                        currentPersonaLookups.push({ id: `"${personas[y].name}"`, name: personas[y].name, group: "System Personas" });
                    }
                    this.personaLookups = currentPersonaLookups.sort((a, b) => (a.name.localeCompare(b.name)));
                    currentPersonaLookups.unshift({ id: "", name: "System Default", group: "System Personas" });
                    this.initializeValuesForContentLookup();
                });
            }

            if (!this.deviceLookups) {
                this.$http.get(`/admin/Enums?type=DeviceType`).success(o => {
                    var deviceTypes = <any>o || [];
                    var currentDeviceLookups = [];
                    for (var z = 0; z < deviceTypes.length; z++) {
                        currentDeviceLookups.push({ id: `"${deviceTypes[z].Value}"`, name: deviceTypes[z].Name, group: "System Devices" });
                    }
                    this.deviceLookups = currentDeviceLookups.sort((a, b) => (a.name.localeCompare(b.name)));
                    currentDeviceLookups.unshift({ id: "", name: "System Default", group: "System Devices" });
                    this.initializeValuesForContentLookup();
                });
            }
        }

        initializeValuesForLookupFieldType() {
            this.naturalKeyEntityIds = [];
            var naturalKeySelectedEntityIds = this.selectedEntityId.split(",");

            for (var i = 0; i < this.naturalKeys.length; i++) {
                this.naturalKeyEntityIds[i] = naturalKeySelectedEntityIds[i] || "";
            }
        }

        initializeValuesForContentLookup() {
            if (!this.lookups || !this.languageLookups || !this.personaLookups || !this.deviceLookups) {
                return;
            }

            var columnLanguageDevicePersona = this.selectedEntityId.split(",");

            this.contentEntityId = columnLanguageDevicePersona[0] || "";
            this.languageEntityId = columnLanguageDevicePersona[1] || "";
            this.personaEntityId = columnLanguageDevicePersona[2] || "";
            this.deviceEntityId = columnLanguageDevicePersona[3] || "";

            // content
            this.contentLookups = this.lookups.slice(0);

            // language
            this.languageDatasource = new kendo.data.DataSource({
                data: this.contentLookups.concat(this.languageLookups),
                group: { field: "group" }
            });


            // persona
            this.personaDatasource = new kendo.data.DataSource({
                data: this.contentLookups.concat(this.personaLookups),
                group: { field: "group" }
            });

            // device
            this.deviceDatasource = new kendo.data.DataSource({
                data: this.contentLookups.concat(this.deviceLookups),
                group: { field: "group" }
            });
        }

        getSelectFieldsFromSelectClause(selectClause: any): any {
            var selectFields = [];
            var commaSeparatedSelectClause = selectClause.split(",");

            for (var x = 0; x < commaSeparatedSelectClause.length; x++) {
                var selectField = commaSeparatedSelectClause[x];

                if (selectField.toLowerCase().indexOf(" as ") !== -1) {
                    selectFields.push(selectField.split(" as ").pop());
                } else {
                    selectFields.push(selectField.trim());
                }
            }

            return selectFields;
        }

        convertNaturalKeysToFromProperty() {
            if (!this.naturalKeyEntityIds || !this.lookups || (this.$scope["model"].fieldType !== "Lookup" && this.$scope["model"].fieldType !== "ChildCollection")) {
                return;
            }
            this.selectedEntityId = this.naturalKeyEntityIds.join();
        }

        convertColumnLanguageDevicePersonaToFromProperty() {
            if (!this.contentEntityId || !this.lookups || !this.languageLookups || !this.personaLookups || !this.deviceLookups || this.$scope["model"].fieldType !== "Content") {
                return;
            }
            this.selectedEntityId = [this.contentEntityId, this.languageEntityId, this.personaEntityId, this.deviceEntityId].join();
        }
    }

    angular
        .module("insite-admin")
        .controller("FromPropertyController", FromPropertyController);
}