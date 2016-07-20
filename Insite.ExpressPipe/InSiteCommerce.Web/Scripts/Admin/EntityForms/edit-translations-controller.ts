module insite_admin {
    "use strict";
    export class EditTranslationsController {
        public translationMessage: string;
        public propertyName: string;
        public propertyLabel: string;
        public parentObject: any;
        public parentObjectName: string;
        public translations: Array<any>;
        public languages: Array<any>;
        public languagesInitialState: Array<any>;

        serviceUri: string;

        static $inject = ["$scope", "FoundationApi", "$http", "spinnerService"];
        constructor(
            protected $scope: ng.IScope,
            protected $foundationApi: any,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService
        ) {
            this.init();
        }

        init() {
            this.serviceUri = `/api/v1/admin/`;
            this.$scope.$on("editTranslations", (event: ng.IAngularEvent, data: any) => {
                this.translationMessage = data.translationMessage;
                this.propertyName = data.propertyName;
                this.propertyLabel = data.propertyLabel;
                this.parentObject = data.parentObject;
                this.parentObjectName = data.parentObjectName;
                this.loadTranslations();
                this.$foundationApi.publish("editTranslations", "open");
            });
        }

        loadLanguages() {
            var toSelect = "id,languageCode,description,isDefault,hasDeviceSpecificContent,hasPersonaSpecificContent,cultureCode,imageFilePath";
            this.$http.get(`${this.serviceUri}languages?&archiveFilter=${ArchiveFilter.Active}&$select=${toSelect}`)
                .success((entities: any) => {
                    this.languages = entities.value;
                    this.languages.forEach(l => {
                        if (this.translations.every(t => t.languageId !== l.id)) {
                            this.translations.push({
                                "id": "", "languageId": l.id, "parentTable": this.parentObjectName, "parentId": this.parentObject.id, "name": this.propertyName, "translatedValue": ""
                            });
                        }
                        l.translatedValue = jQuery.grep(this.translations, t => t.languageId === l.id)[0].translatedValue;
                    });
                    this.languagesInitialState = this.languages.map(l => jQuery.extend({}, l));
                });
        }

        loadTranslations() {
            var toSelect = "id,languageId,parentTable,parentId,name,translatedValue";
            this.$http.get(`${this.serviceUri}translationProperties?&$filter=(startsWith(parentTable, %27${this.parentObjectName}%27) eq true) and (startsWith(name, %27${this.propertyName}%27) eq true) and (parentId eq ${this.parentObject.id})&archiveFilter=${ArchiveFilter.Active}&$orderby=languageId&$select=${toSelect}`)
                .success((entities: any) => {
                    this.translations = entities.value;
                    this.loadLanguages();
                });
        }

        reset() {
            this.languages = this.languagesInitialState.map(l => jQuery.extend({}, l));
        }

        cancel() {
            this.reset();
            this.$foundationApi.publish("editTranslations", "close");
            this.$foundationApi.publish("translationsUnsavedModal", "close");
        }

        save() {
            this.translations.forEach(t => {
                t.translatedValue = jQuery.grep(this.languages, l => t.languageId === l.id)[0].translatedValue;
            });
            this.translations
                .filter(t => t.translatedValue !== jQuery.grep(this.languagesInitialState, l => t.languageId === l.id)[0].translatedValue)
                .forEach(t => {
                    var method = "POST";
                    var data = {};
                    var uri = this.serviceUri + "translationProperties";
                    if (t.id !== "") {
                        method = "PATCH";
                        uri += `(${t.id})`;
                        data = { "translatedValue": t.translatedValue };
                    } else {
                        data = t;
                        data["id"] = "00000000-0000-0000-0000-000000000000";
                    }

                    return this.$http({
                        method: method,
                        url: uri + "?$expand=customProperties",
                        data: data
                    }).success(model => {
                        this.languagesInitialState = this.languages.map(l => jQuery.extend({}, l));
                        }).error(model => {
                        alert('Some error during saving changes.');
                    });
                });
            
            this.$foundationApi.publish("editTranslations", "close");
            this.$foundationApi.publish("translationsUnsavedModal", "close");
        }

        close() {
            if (this.isModelDirty()) {
                this.$foundationApi.publish("translationsUnsavedModal", "open");
            } else {
                this.$foundationApi.publish("editTranslations", "close");
            }
        }

        translate() {
            this.spinnerService.show();
            this.$http.post("/admin/translation/translate", { "ParentId": this.parentObject.id, "ParentTable": this.parentObjectName, "Name": this.propertyName, "BaseValue": this.translationMessage })
                .success(result => {
                    this.loadTranslations();
                    this.spinnerService.hide();
                })
                .error(result => {
                    this.spinnerService.hide();
                });
        }

        protected isModelDirty() {
            var result = false;
            this.languages.forEach(l =>
                result = result || jQuery.grep(this.languagesInitialState, lis => l.id === lis.id)[0].translatedValue !== l.translatedValue);
            return result;
        }
    }

    angular
        .module("insite-admin")
        .controller("EditTranslationsController", EditTranslationsController);
}