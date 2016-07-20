import CostCodeModel = Insite.Customers.WebApi.V1.ApiModels.CostCodeModel;
import BudgetModel = Insite.Budget.WebApi.V1.ApiModels.BudgetModel;

module insite.budget {
    "use strict";

    export interface IBudgetService {
        getReviews(userProfileId: string, shipToId: string, fiscalYear: number, fullGrid: boolean): ng.IPromise<BudgetModel>;
        updateBudget(budget: BudgetModel): ng.IPromise<BudgetModel>;
    }

    export class BudgetService implements IBudgetService {
        budgetServiceUri = this.coreService.getApiUri("/api/v1/budgets/");

        static $inject = ["$http", "$q", "coreService"];
        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getReviews(userProfileId: string, shipToId: string, fiscalYear: number, fullGrid: boolean): ng.IPromise<BudgetModel> {
            var deferred = this.$q.defer();
            this.$http({
                url: this.budgetServiceUri + fiscalYear,
                method: "GET",
                params: {
                    userProfileId: userProfileId,
                    shipToId: shipToId,
                    fiscalYear: fiscalYear,
                    fullGrid: fullGrid
                }
            })
                .success((result: any) => { return deferred.resolve(result); })
                .error(deferred.reject);
            return deferred.promise;
        }

        updateBudget(budget: BudgetModel): ng.IPromise<BudgetModel> {
            var deferred = this.$q.defer();
                this.$http({
                    method: "PATCH",
                    url: this.budgetServiceUri + budget.fiscalYear,
                    data: budget
                })
                .success((result: any) => { deferred.resolve(result); })
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("budgetService", BudgetService);
} 