module insite_admin {
    "use strict";

    export interface IContentManagerScope extends ng.IScope {
        entityDetailsCtrl: any;
    }

    export class ContentManagerController {
        entityDetailsCtrl: any;

        entityDefinition: any;
        parent: any;
        parentName: string;
        pluralizedParentName: string;
        contentManagerId: string;
        contentId: string;
        content: any;
        contents: { [id: string]: any; } = {};
        initialContents: { [id: string]: any; } = {};
        serviceUri: string;
        allowCheckUpdates: boolean;
        filter: any;
        isEmpty: boolean = true;
        latestRevisionNumber: number = 1;
        latestRevisionNumberLoaded: boolean = true;
        currentUserId: string;

        static $inject = [
            "$rootScope",
            "$http",
            "$scope",
            "FoundationApi"];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $scope: IContentManagerScope,
            protected $foundationApi: any
        ) {
        }

        init(contentManagerId: string, entityDetailsCtrl: any, parentName: string, pluralizedParentName: any): void {
            this.entityDetailsCtrl = entityDetailsCtrl;
            
            this.contentManagerId = contentManagerId;
            this.parent = this.entityDetailsCtrl.model;
            this.parentName = this.entityDetailsCtrl.entityName;
            this.pluralizedParentName = this.entityDetailsCtrl.pluralizedEntityName;

            this.serviceUri = `/api/v1/admin/contents`;

            this.getCurrentUserId();

            this.entityDetailsCtrl.additionalDirtyChecks.push({
                dirtyCheckName: "ContentManagerDirtyChecker",
                checker: () => {
                    return this.doDirtyCheck(this.initialContents, this.contents);
                }
            });

            this.$scope.$watch(() => this.contents, () => {
                this.entityDetailsCtrl.modelChanged = true;
            }, true);

            this.$scope.$on("ContentEnities-ActiveChanged", (event: ng.IAngularEvent, id: string) => {
                if (this.contentId === id) {
                    return;
                }
                
                this.allowCheckUpdates = false;
                this.contentId = id;
                this.isEmpty = false;
                this.fillContent();
            });

            this.$scope.$on("ContentEnities-EntitiesLoaded", (event: ng.IAngularEvent, data: any) => {
                if (data.filter) {
                    this.filter = data.filter;
                }

                this.isEmpty = data.count === 0;

                if (this.isEmpty) {
                    this.content = null;
                    this.contentId = null;
                }
            });

            this.$scope.$watchCollection("contentMngrController.content.html", () => {
                if (!this.contentId) {
                    return;
                }
                
                if (this.allowCheckUpdates && this.contentId) {
                    // This will cause the dirty property to appear to be the id (which all entities have) and it will PATCH with the existing value.
                    // TODO 4.2 We may want to hook this up to actually save with the extensions we have in place already.
                    this.$rootScope.$broadcast("ContentManager_ContentChanged", "id");
                }
            });
            
            this.$scope.$on("EntitySaved", () => {
                this.save();
            });

            this.$scope.$on("PublishFinished", (event: ng.IAngularEvent, id: string) => {
                this.$http.get(`${this.serviceUri}(${id})`)
                    .success((entity: any) => {
                        if (this.contents.hasOwnProperty(id)) {
                            this.contents[id] = entity;
                        }

                        if (this.contentId === id) {
                            this.content = entity;
                        }
                    });
            });

            this.$scope.$on("PublishClicked", (event: ng.IAngularEvent, data: any) => {
                this.doPublish(data);
            });
        }

        getCurrentUserId(): void {
            this.$http.get("/api/v1/admin/userprofiles/current?$select=id", {}).then(model => {
                this.currentUserId = (<any>model.data).id;
            });
        }

        fillContent(): void {
            if (!this.contentId) {
                return;
            }

            if (!this.contents.hasOwnProperty(this.contentId)) {
                this.$http.get(`${this.serviceUri}(${this.contentId})`)
                    .success((entity: any) => {
                        this.afterLoadEntities(entity);
                        (<any>CKEDITOR.instances).ckeditcontent.setReadOnly(this.content.approvedOn !== null);
                    });
            } else {
                this.content = this.contents[this.contentId];
                (<any>CKEDITOR.instances).ckeditcontent.setReadOnly(this.content.approvedOn !== null);
                this.allowCheckUpdates = true;
            }
        }

        afterLoadEntities(entity: any): void {
            this.content = entity;
            this.initLastestRevision();
            if (!this.contents.hasOwnProperty(entity.id)) {
                this.contents[entity.id] = entity;
                this.initialContents[entity.id] = angular.copy(entity);
            }
            this.allowCheckUpdates = true;
        }

        private initLastestRevision() {
            var filter = `LanguageId eq ${this.content.languageId} and PersonaId eq ${this.content.personaId} and DeviceType eq '${this.content.deviceType}'`;
            this.$http.get(`/api/v1/admin/contentManagers(${this.contentManagerId})/contents?$filter=${filter}&$select=Revision&$orderby=Revision desc&$top=1`)
                .success((data: any) => {
                    this.latestRevisionNumber = data.value[0].revision;
                });
        }

        save(): void {
            for (var key in this.contents) {
                var content = this.contents[key];
                this.$http({
                    method: "PATCH",
                    url: `${this.serviceUri}(${content.id})`,
                    data: { html: content.html }
                }).success(() => {
                    this.initialContents[key] = angular.copy(this.contents[key]);
                });
            }
        }

        doPublish(data: any): void {
            var method = "PATCH";
            var uri = this.serviceUri;

            for (var key in data.ids) {
                var current = this.contents[data.ids[key]];
                uri += `(${current.id})`;

                this.$http({
                    method: method,
                    url: uri,
                    data: { approvedOn: new Date(), approvedByUserProfileId: this.currentUserId, publishToProductionOn: new Date(data.dateTime) }
                }).success(() => {
                    this.$rootScope.$broadcast("PublishFinished", current.id);
                    this.$rootScope.$broadcast("OnUpdateEntities");
                });
            }
        }

        allowDelete(): boolean {
            return this.content && this.content.id;
        }

        allowCreateRevision(): boolean {
            return (this.content && this.content.approvedOn) || this.isEmpty;
        }

        allowPublish(): boolean {
            return this.content && this.content.id && !this.content.approvedOn;
        }

        showDeleteRevisionConfirmation(): void {
            if (!this.allowDelete()) {
                return;
            }

            this.$foundationApi.publish("deleteRevisionConfirmation", "open");
        }

        doDirtyCheck(initialValue: any, newValue: any): boolean {
            var isDirty = false;

            if (!newValue || Object.keys(newValue).length === 0) {
                return false;
            }

            for (var key in newValue) {
                if (this.contents.hasOwnProperty(key)) {
                    if (this.contents[key].html !== initialValue[key].html) {
                        isDirty = true;
                        break;
                    }
                }
            }

            return isDirty;
        }

        deleteRevision(): void {
            this.$http.delete(this.serviceUri + `(${this.contentId})`)
                .success(() => {
                    this.content = null;
                    this.contentId = null;
                    this.$foundationApi.publish("deleteRevisionConfirmation", "close");
                    this.$rootScope.$broadcast("OnUpdateEntities");
                });
        }

        createRevision(): void {
            if (!this.allowCreateRevision()) {
                return;
            }

            if (this.contentManagerId == null) {
                this.$http.post("/api/v1/admin/contentmanagers", { name: this.parentName.charAt(0).toUpperCase() + this.parentName.slice(1) })
                    .success((contentManager: any) => {
                        this.contentManagerId = contentManager.id;
                        this.parent.contentManagerId = contentManager.id;
                        this.$rootScope.$broadcast("ContentManagerCreated", contentManager.id);
                        this.createContent();

                        this.$http({
                            method: "PATCH",
                            url: `/api/v1/admin/${this.pluralizedParentName}(${this.parent.id})`,
                            data: { contentManagerId: this.contentManagerId }
                        });
                    });
            } else {
                this.createContent();
            }
        }

        private getParentUsingEntityDetailsCtrl(): any {
            var parent = this.$scope;

            do {
                if (parent.entityDetailsCtrl) {
                    break;
                }
            } while ((parent = <IContentManagerScope>parent.$parent))

            return parent;
        }

        private createContent(): void {
            var data: any = {};

            if (this.contentId) {
                data.contentManagerId = this.contentManagerId;
                data.createdByUserProfileId = this.currentUserId;
                data.name = this.content.name;
                data.type = this.content.type;
                data.html = this.content.html;
                data.revision = this.latestRevisionNumber + 1;
                data.deviceType = this.content.deviceType;
                data.personaId = this.content.personaId;
                data.languageId = this.content.languageId;
            } else {
                data.contentManagerId = this.contentManagerId;
                data.createdByUserProfileId = this.currentUserId;
                data.html = "";
                data.revision = 1;
                data.name = "New Revision";

                if (this.filter) {
                    if (this.filter.languageId) {
                        data.languageId = this.filter.languageId;
                    }

                    if (this.filter.personaId) {
                        data.personaId = this.filter.personaId;
                    }

                    if (this.filter.deviceType) {
                        data.deviceType = this.filter.deviceType;
                    }
                }
            }

            this.$rootScope.$broadcast("showCreateRevisionDialog", data);
        }

        publish(): void {
            if (!this.allowPublish()) {
                return;
            }

            this.$rootScope.$broadcast("showPublishDialog", { ids: [this.contentId] });
        }
    }

    angular
        .module("insite-admin")
        .controller("ContentManagerController", ContentManagerController)
        .directive("isaContentManager", [
            () => {
                return {
                    restrict: "E",
                    controller: "ContentManagerController",
                    controllerAs: "contentMngrController",
                    transclude: true,
                    template: "<div ng-transclude></div>"
                };
            }]);
}