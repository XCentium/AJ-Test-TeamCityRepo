module insite_admin {
    "use strict";

    export class CreateContentRevisionController {
        content: any = {};
        serviceUri: string;
        revisionUpdated: boolean = true;

        static $inject = ["$rootScope", "$scope", "$http", "FoundationApi"];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $foundationApi: any
        ) {
            this.init();
        }

        init() {
            this.serviceUri = `/api/v1/admin/contents`;
            this.$scope.$on("showCreateRevisionDialog", (event: ng.IAngularEvent, content: any) => {
                for (var key in content) {
                    this.content[key] = content[key];
                }
                this.updateRevision();
                this.$foundationApi.publish("createRevision", "open");
            });
        }

        updateRevision() {
            this.revisionUpdated = false;
            var filter = `LanguageId eq ${this.content.languageId} and PersonaId eq ${this.content.personaId} and DeviceType eq '${this.content.deviceType}'`;
            this.$http.get(`/api/v1/admin/contentManagers(${this.content.contentManagerId})/contents?$filter=${filter}&$select=Revision&$orderby=Revision desc&$top=1`)
                .success((data: any) => {
                    if (data.value && data.value.length > 0) {
                        this.content.revision = data.value[0].revision + 1;
                    } else {
                        this.content.revision = 1;
                    }

                    this.revisionUpdated = true;
                });
        }

        save(): void {
            if (!this.allowSave()) {
                return;
            }

            this.$http({
                method: "POST",
                url: this.serviceUri,
                data: this.content
            }).success(model => {
                this.$rootScope.$broadcast("OnUpdateEntities");
                this.$foundationApi.publish("createRevision", "close");
            }).error(model => {
            });
        }

        allowSave(): boolean {
            return this.content && this.content.languageId && this.content.personaId && this.content.deviceType && this.revisionUpdated;
        }
    }

    angular
        .module("insite-admin")
        .controller("CreateContentRevisionController", CreateContentRevisionController);
}