module insite_admin {
    import Core = insite.core;
    "use strict";

    export class ConfigurationPageDetailsController extends EntityDetailsController {
        generatedCssOutput: string;
        generatedHtmlOutput: string;
        generatedJavaScriptOutput: string;

        init() {
            super.init();
            this.$scope.$watch("entityDetailsCtrl.model.id", () => {
                this.getGeneratedOutputs();
            });

            this.$scope.$watch("entityDetailsCtrl.model.overrideCssOutput", (newValue, oldValue) => {
                if (newValue !== oldValue && typeof oldValue !== "undefined") {
                    this.overrideCssOutputChanged(newValue);
                }
            });

            this.$scope.$watch("entityDetailsCtrl.model.overrideHtmlOutput", (newValue, oldValue) => {
                if (newValue !== oldValue && typeof oldValue !== "undefined") {
                    this.overrideHtmlOutputChanged(newValue);
                }
            });

            this.$scope.$watch("entityDetailsCtrl.model.overrideJavaScriptOutput", (newValue, oldValue) => {
                if (newValue !== oldValue && typeof oldValue !== "undefined") {
                    this.overrideJavaScriptChanged(newValue);
                }
            });
        }

        getGeneratedOutputs() {
            if (!this.model || !this.model.id) {
                return;
            }

            this.$q.all([
                this.$http.get(`/admin/ConfigurationPage/GenerateCss?configurationPageId=${this.model.id}`),
                this.$http.get(`/admin/ConfigurationPage/GenerateHtml?configurationPageId=${this.model.id}`),
                this.$http.get(`/admin/ConfigurationPage/GenerateJavaScript?configurationPageId=${this.model.id}`)
            ]).then(o => {
                this.generatedCssOutput = o[0].data;
                this.generatedHtmlOutput = o[1].data;
                this.generatedJavaScriptOutput = o[2].data;
            });
        }

        overrideCssOutputChanged(value: any) {
            this.model.cssOutput = value === true
                ? this.generatedCssOutput
                : "";
        }

        overrideHtmlOutputChanged(value: any) {
            this.model.htmlOutput = value === true
                ? this.generatedHtmlOutput
                : "";
        }

        overrideJavaScriptChanged(value: any) {
            this.model.javaScriptOutput = value === true
                ? this.generatedJavaScriptOutput
                : "";
        }
    }

    angular
        .module("insite-admin")
        .controller("ConfigurationPageDetailsController", ConfigurationPageDetailsController);
}