///<reference path="../../typings/angularjs/angular-plus.d.ts"/>

import BudgetCalendarModel = Insite.Budget.WebApi.V1.ApiModels.BudgetCalendarModel;

module insite.budget {
    "use strict";

    export interface IBudgetCalendarService {
        getBudgetCalendar(fiscalYear: number): ng.IPromise<BudgetCalendarModel>;
        updateBudgetCalendar(budget: BudgetCalendarModel): ng.IPromise<BudgetCalendarModel>;
    }

    export class BudgetCalendarService implements IBudgetCalendarService {
        budgetCalendarServiceUri = this.coreService.getApiUri("/api/v1/budgetcalendars/");

        static $inject = ["$http", "$q", "coreService"];
        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getBudgetCalendar(fiscalYear: number): ng.IPromise<BudgetCalendarModel> {
            var deferred = this.$q.defer();
            this.$http({
                url: this.budgetCalendarServiceUri + fiscalYear,
                method: "GET"
            })
                .success((result: BudgetCalendarModel) => { return deferred.resolve(result); })
                .error(deferred.reject);
            return deferred.promise;
        }

        updateBudgetCalendar(budget: BudgetCalendarModel): ng.IPromise<BudgetCalendarModel> {
            var deferred = this.$q.defer();
            this.$http({
                method: "PATCH",
                url: this.budgetCalendarServiceUri + budget.fiscalYear,
                data: budget
            })
                .success((result: BudgetCalendarModel) => { deferred.resolve(result); })
                .error(deferred.reject);
            return deferred.promise;
        }
    }

    angular
        .module("insite")
        .service("budgetCalendarService", BudgetCalendarService);
} 