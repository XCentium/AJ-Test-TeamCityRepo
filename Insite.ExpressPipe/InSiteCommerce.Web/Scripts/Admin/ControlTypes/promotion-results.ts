module insite_admin {
    "use strict";

    export interface IPromotionResult {
        type: any;
        parameters: any;
        id: System.Guid;
    }

    export class PromotionResultsController {
        readOnly: boolean;
        model: any;
        promotionResultTypes: any[];
        results: IPromotionResult[];
        initResults: IPromotionResult[];
        propertyServiceUri: any;
        defaultResult: any;
        loadComplete: boolean;
        loadedData: any[];
        form: any;

        static $inject = ["$scope", "$http", "spinnerService", "FoundationApi", "fingerTabsService", "$location", "entityDefinitionService"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected fingerTabsService: FingerTabsService,
            protected $location: ng.ILocationService,
            protected entityDefinitionService: EntityDefinitionService)
        {
            this.init();
        }

        init()
        {
            this.$http.get("/api/v1/admin/promotionresulttypes").then((result: any) => {
                this.promotionResultTypes = result.data.value;
                this.propertyServiceUri.promotionResults = {
                    url: `/api/v1/admin/promotions(${this.model.id})/results`,
                    tab: this.fingerTabsService.getSelectedTab(this.$location.path())
                };
                this.loadData();
            });

            this.$http.get(`/api/v1/admin/promotionresults/default`).success(defaultResult => {
                this.defaultResult = defaultResult;
                this.defaultResult.promotionId = this.model.id;
            });

            this.$scope.$on("EditEntityAfterSaved", () => {
                this.loadData();
            });

            this.$scope.$watch("vm.results", (newValue) => {
                if (this.loadComplete) {
                    var changed = !angular.equals(this.initResults, newValue);
                    if (changed) {
                        this.model.promotionResults = this.serializeData();
                    }
                    else {
                        delete this.model.promotionResults;
                    }
                }
            }, true);
        }

        loadData(): void {
            this.$http.get(`/api/v1/admin/promotionresults?$filter=promotionId eq ${this.model.id}`).then((result: any) => {
                this.loadedData = result.data.value;
                this.parseData();
            });
        }

        parseData()
        {
            this.results = [];
            for (var i = 0; i < this.loadedData.length; i++) {
                for (var j = 0; j < this.promotionResultTypes.length; j++) {
                    if (this.loadedData[i].promotionResultType === this.promotionResultTypes[j].name) {
                        var promotionItem = this.createResult(this.promotionResultTypes[j], this.loadedData[i].id);
                        var params = this.promotionResultTypes[j].parameterDescriptions;
                        for (var p = 0; p < params.length; p++) {
                            var lowerName = params[p].name.charAt(0).toLowerCase() + params[p].name.slice(1);
                            promotionItem.parameters[params[p].name] = this.loadedData[i][lowerName];
                        }
                        this.results.push(promotionItem);
                        break;
                    }
                }
            }

            if (this.results.length === 0) {
                this.results.push(this.createResult());
            }

            this.initResults = angular.copy(this.results);
            this.loadComplete = true;
        }

        private serializeData(): any {
            var items = [];

            for (var i = 0; i < this.results.length; i++) {
                var item = this.getResultTemplate(this.results[i]);
                if (item) {
                    item.promotionResultType = this.results[i].type.name;
                    for (var j = 0; j < this.results[i].type.parameterDescriptions.length; j++) {
                        var name = this.results[i].type.parameterDescriptions[j].name;
                        var lowerName = name.charAt(0).toLowerCase() + name.slice(1);
                        if (this.results[i].type.parameterDescriptions[j].valueType === "number") {
                            item[lowerName] = parseFloat(this.results[i].parameters[name]);
                        } else {
                            item[lowerName] = this.results[i].parameters[name];
                        }
                    }
                    items.push(item);
                }
            }

            return items;
        }

        hasResults(): void {
            return this.results && (this.results.length > 1 || this.results.length === 1 && this.results[0].type);
        }

        showDeletePopup(): void {
            this.$foundationApi.publish("deletePromotionResults", "open");
        }

        deleteAllResults(): void {
            this.results = [this.createResult()];
            this.$foundationApi.publish("deletePromotionResults", "close");
        }

        deleteResult(index: number): void
        {
            if (this.results.length > 1) {
                this.results.splice(index, 1);
            } else {
                this.results = [this.createResult()];
            }
        }

        expandResult(): void {
            this.results.push(this.createResult());
        }

        showFieldError(key: string): boolean {
            return this.form[key] && this.form[key].$dirty && this.form[key].$invalid && this.form[key].$error.required;
        }

        private getResultTemplate(result: IPromotionResult): any {
            if (!result.type) {
                return null;
            }
            var item = null;
            if (result.id) {
                for (var i = 0; i < this.loadedData.length; i++) {
                    if (this.loadedData[i].id === result.id) {
                        item = angular.copy(this.loadedData[i]);
                        break;
                    }
                }
            }
            else {
                item = angular.copy(this.defaultResult);
            }

            return item;
        }

        private createResult(type?: any, id?: System.Guid): IPromotionResult {
            return <IPromotionResult>{
                type: type,
                parameters: {},
                id: id
            };
        }
    }

    angular
        .module("insite-admin")
        .controller("PromotionResultsController", PromotionResultsController)
        .directive("isaPromotionResults", () => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "PromotionResults",
                controller: "PromotionResultsController",
                controllerAs: "vm",
                bindToController: true,
                scope: {
                    readOnly: "@",
                    propertyServiceUri: "=",
                    model: "=",
                    form: "="
                }
            }
        });
}