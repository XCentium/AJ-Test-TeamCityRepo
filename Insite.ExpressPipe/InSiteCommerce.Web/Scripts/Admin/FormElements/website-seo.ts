module insite_admin.formElements {
    "use strict";

    export class WebsiteSeoController {
        model: any;
        additionalDirtyChecks: { dirtyCheckName: string, checker(model: any, initialModel: any): boolean; }[] = [];
        modelChanged: boolean;

        isLoading = true;
        settings: any = {};
        initialSettings: any;
        tree = [];
        websiteId: System.Guid;
        fancyTree: any;
        errorMessage: string;
        static hasChanges: boolean = false;
        selectingAll = false;

        public static $inject = [
            "seoSettingsService",
            "$scope"
        ];

        constructor(
            protected seoSettingsService: ISeoSettingsService,
            protected $scope: ng.IScope) {
            this.getSeoSettings(this.model.id);
        }

        public getSeoSettings(websiteId: System.Guid) {
            this.websiteId = websiteId;
            this.isLoading = true;
            this.errorMessage = null;

            this.seoSettingsService.getSeoSettings(this.websiteId).success((result) => {
                this.settings = result;
                this.initialSettings = angular.copy(this.settings);

                var pages = result["CmsPages"];
                this.tree = this.generateTree(pages, null);

                this.fancyTree = (<any>$("#cmsTree")).fancytree({
                    source: this.tree,
                    checkbox: true,
                    select: (event, data) => {
                        if (!this.selectingAll) {
                            this.$scope.$apply(() => {
                                this.fillCurrentSelectedNodes();
                                this.modelChanged = true;
                            });
                        }
                    }
                });

                this.$scope.$on("EntitySaved", () => {
                    this.saveSeoSettings();
                });

                this.additionalDirtyChecks.push({
                    dirtyCheckName: "websiteSeoDirtyChecker",
                    checker: (model, initialModel) => {
                        return this.settingsDifferent(this.initialSettings, this.settings);
                    }
                });

                this.$scope.$watchGroup(["vm.settings.HideProductsFromSearch", "vm.settings.UseProductCanonicalLinks", "vm.settings.MicrositeCanonicalProducts"], (newValue) => {
                    this.modelChanged = true;
                });
            }).error(() => {
                this.errorMessage = "An error occured when trying to retrieve seo settings for the current website";
            }).finally(() => {
                this.isLoading = false;
            });
        }

        private settingsDifferent(oldValue: any, newValue: any): boolean {
            if (oldValue.HideProductsFromSearch !== newValue.HideProductsFromSearch ||
                oldValue.UseProductCanonicalLinks !== newValue.UseProductCanonicalLinks ||
                oldValue.MicrositeCanonicalProducts !== newValue.MicrositeCanonicalProducts) {
                return true;
            }

            if (oldValue["CmsPages"].some(o => newValue["CmsPages"].find(n => n.ContentKey == o.ContentKey).ExcludeFromSearch != o.ExcludeFromSearch)) {
                return true;
            }

            if (newValue["CmsPages"].some(o => oldValue["CmsPages"].find(n => n.ContentKey == o.ContentKey).ExcludeFromSearch != o.ExcludeFromSearch)) {
                return true;
            }

            return false;
        }

        fillCurrentSelectedNodes() {
            this.settings["CmsPages"] = angular.copy(this.initialSettings["CmsPages"]);
            var selectedNodes = (<any>$("#cmsTree")).fancytree("getTree").getSelectedNodes();
            this.settings.CmsPages.forEach((p) => {
                // ReSharper disable once CoercedEqualsUsing
                p["ExcludeFromSearch"] = !selectedNodes.some(n => n.key == p["ContentKey"]);
            });
        }

        saveSeoSettings() {
            if (this.settingsDifferent(this.initialSettings, this.settings)) {
                this.fillCurrentSelectedNodes();

                this.seoSettingsService.updateSeoSettings(this.websiteId, this.settings).success(() => {
                    this.initialSettings = angular.copy(this.settings);
                }).error(() => {
                    this.errorMessage = "An error occurred when trying to update SEO settings.";
                });
            }
        }

        generateTree(pages, contentKey: number) {
            var nodeArray = [];

            var nodes = pages.filter(x => x["ParentContentKey"] === contentKey);
            nodes.forEach(n => {
                var node = {
                    title: n["Title"],
                    key: n["ContentKey"],
                    selected: !n["ExcludeFromSearch"],
                    children: this.generateTree(pages, n["ContentKey"]),
                    expanded: false
                };

                if (node.children.length === 0) {
                    delete node.children;
                } else {
                    node.expanded = true;
                }

                nodeArray.push(node);
            });

            return nodeArray;
        }

        cmsSelectAllClick(selected: boolean) {
            this.selectingAll = true;
            (<any>$("#cmsTree")).fancytree("getTree").visit(n => {
                n.setSelected(selected);
            });
            this.selectingAll = false;
            this.fillCurrentSelectedNodes();
            this.modelChanged = true;
        }
    }

    angular
        .module("insite-admin")
        .controller("WebsiteSeoController", WebsiteSeoController)
        .directive("isaWebsiteSeo", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "WebsiteSeo",
                controller: "WebsiteSeoController",
                controllerAs: "vm",
                bindToController: {
                    model: "=",
                    additionalDirtyChecks: "=",
                    modelChanged: "="
                },
                scope: {}
            }
        });

}