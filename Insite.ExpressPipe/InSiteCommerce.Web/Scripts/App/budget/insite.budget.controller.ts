module insite.budget {
    "use strict";

    export class BudgetController {

        billTo: BillToModel;
        enforcementLevel: string;
        budgetsFromOnlineOnly = false;

        calendar: BudgetCalendarModel;
        budgetEndPeriods: any;
        errorPeriods: Date[];
        sortDirection = 1;

        currentYear = new Date().getFullYear();
        budgetYears: number[] = [];
        accounts: AccountModel[];
        shipTos: ShipToModel[];

        maintenanceUser = <AccountModel>{};
        maintenanceShipTo = <ShipToModel>{};
        maintenanceBudgetYear: number;
        maintenanceInfo: BudgetModel;

        reviewUser = <AccountModel>{};
        reviewShipTo = <ShipToModel>{};
        reviewBudgetYear: number;
        reviewInfo: BudgetModel;

        selectedBudgetYear: number;

        protected periodCount = 13;

        static $inject = ["$window", "$scope", "$timeout", "coreService", "budgetService", "budgetCalendarService", "accountService", "customerService"];

        constructor(protected $window: ng.IWindowService,
            protected $scope: ng.IScope,
            protected $timeout: ng.ITimeoutService,
            protected coreService: core.ICoreService,
            protected budgetService: budget.IBudgetService,
            protected budgetCalendarService: budget.IBudgetCalendarService,
            protected accountService: account.IAccountService,
            protected customerService: customers.ICustomerService) {

            this.init();
        }

        init() {
            this.getBudgetCalendar();
            this.getCostCodes();
            this.getAccounts();
            this.getShipTos();

            this.fillBudgetYears(this.currentYear, 5);
            this.maintenanceBudgetYear = this.currentYear;
            this.reviewBudgetYear = this.currentYear;

            this.$scope.$on("settingsLoaded",(event, data) => {
                this.budgetsFromOnlineOnly = data.customerSettings.budgetsFromOnlineOnly;
            });
        }

        getAccounts(): void {
            this.accountService.getAccounts().success((result) => {
                this.accounts = result.accounts;
            });
        }

        getShipTos(): void {
            this.customerService.getShipTos().success((result) => {
                this.shipTos = result.shipTos;
            });
        }

        fillBudgetYears(currentYear: number, years: number): void {
            for (var i = 0; i < years; i++) {
                this.budgetYears.push(currentYear + i);
            }
        }

        getBudgetCalendar(): void {

            this.selectedBudgetYear = this.calendar ? this.calendar.fiscalYear : this.currentYear;

            this.budgetCalendarService.getBudgetCalendar(this.selectedBudgetYear).then((result) => {
                this.calendar = result;

                $("#FiscalYearEndDate")
                    .attr("data-mindate", new Date(this.calendar.fiscalYear, 0, 1).toString())
                    .attr("data-maxdate", new Date(this.calendar.fiscalYear + 1, 11, 31).toString());
                this.calendarCalculate();
                this.addPeriod();
            });
        }

        getCostCodes() {
            this.customerService.getBillTo("costcodes").success(result => {
                this.billTo = result;
                this.enforcementLevel = result.budgetEnforcementLevel;
            });
        }

        updateBudgetCalendar(): void {
            this.calendar.budgetPeriods = jQuery.map(this.calendar.budgetPeriods, (d) => {
                if (d) {
                    return new Date(d.toString());
                }
                return undefined;
            });

            this.budgetCalendarService.updateBudgetCalendar(this.calendar).then((result: BudgetCalendarModel) => {
                this.displaySavedModel();
                this.calendarCalculate();
                this.addPeriod();
            });
        }

        displaySavedModel(): void {
            this.coreService.displayModal(angular.element("#budgets-saved-popup"));
        }

        updateBudgetEnforcementLevel(): void {
            this.customerService.updateEnforcementLevel(<BillToModel>{
                    budgetEnforcementLevel: this.billTo.budgetEnforcementLevel,
                    uri: this.billTo.uri
                })
                .then((result) => {
                    this.enforcementLevel = this.billTo.budgetEnforcementLevel;
                    this.displaySavedModel();
                });
        }

        addCostCode(): void {
            if (this.canAddCostCodeRow()) {
                this.billTo.costCodes.push(<CostCodeModel>{ costCode: "" });
            }
        }

        canAddCostCodeRow(): boolean {
            if (!this.billTo) {
                return false;
            }
            for (var i = 0; i < this.billTo.costCodes.length; i++) {
                if (this.billTo.costCodes[i].costCode.length === 0) {
                    return false;
                }
            }
            return true;
        }

        sortStatusColumn(): void {
            this.sortDirection *= -1;

            this.billTo.costCodes.sort((a, b) => {
                var row1SortValue = a.isActive,
                    row2SortValue = b.isActive;

                if (b.costCode === "" || a.costCode === "") {
                    return 0;
                }
                if (row1SortValue < row2SortValue) {
                    return -1 * this.sortDirection;
                }
                if (row1SortValue > row2SortValue) {
                    return 1 * this.sortDirection;
                }

                return 0;
            });
        }

        updateCostCodes(): void {
            this.customerService.updateBillTo(<BillToModel>{
                costCodeTitle: this.billTo.costCodeTitle,
                costCodes: this.billTo.costCodes,
                uri: this.billTo.uri,
            }).then((result) => {
                this.displaySavedModel();
            });
        }

        updatePeriods(): void {
            var tempDates: Date[] = jQuery.map($("input.txt.startdate"), (a) => { return a.value ? new Date(a.value) : undefined });
            this.calendar.budgetPeriods = jQuery.grep(tempDates, (x) => { return x != undefined });
            this.calendar.fiscalYearEndDate = $("input#FiscalYearEndDate").val();
            this.calendarCalculate();
            this.addPeriod();
            this.$scope.$apply();
        }

        canAddPeriod(): boolean {
            if (this.calendar && this.calendar.budgetPeriods) {
                for (var i = 0; i < this.calendar.budgetPeriods.length; i++) {
                    if (!this.calendar.budgetPeriods[i]) {
                        return false;
                    }
                }
                return this.calendar.budgetPeriods.length < 13;
            }
            return false;
        }

        assignCalendarMonths(): void {
            this.calendar.budgetPeriods = [];
            for (var i = 0; i < 12; i++) {
                this.calendar.budgetPeriods.push(new Date(this.calendar.fiscalYear, i, 1));
            }
            this.calendarCalculate();
            this.addDateTimePicker();
        }

        calendarCalculate(): void {
            this.budgetEndPeriods = jQuery.grep(this.calendar.budgetPeriods, (x) => { return x != undefined });
            for (var i = 0; i < this.budgetEndPeriods.length; i++) {
                if ((i === this.budgetEndPeriods.length - 1)) {
                    this.budgetEndPeriods[i] = this.getYearEnd(this.calendar.fiscalYear, this.calendar.fiscalYearEndDate);
                } else {
                    var t = new Date(this.budgetEndPeriods[i + 1].toString());
                    t.setDate(t.getDate() - 1);
                    this.budgetEndPeriods[i] = t;
                }
            }
        }

        maintenanceViewBudget(): void {
            this.budgetService.getReviews(this.maintenanceUser.id, this.maintenanceShipTo.id, this.maintenanceBudgetYear, false)
                .then((result: BudgetModel) => {
                    this.maintenanceInfo = result;
                });
        }

        updateBudgets(): void {
            this.budgetService.updateBudget(this.maintenanceInfo).then((result: BudgetModel) => {
                this.displaySavedModel();
            });
        }

        switchFilterInput(selectedValue: string, param: string, tab: string): void {
            if (selectedValue) {
                if (param === "user" && tab === "maintenance") {
                    this.maintenanceShipTo = <ShipToModel>{};
                }
                if (param === "shipTo" && tab === "maintenance") {
                    this.maintenanceUser = <AccountModel>{};
                }
                if (param === "user" && tab === "review") {
                    this.reviewShipTo = <ShipToModel>{};
                }
                if (param === "shipTo" && tab === "review") {
                    this.reviewUser = <AccountModel>{};
                }
            } else {
                if (tab === "maintenance") {
                    this.maintenanceShipTo = <ShipToModel>{};
                    this.maintenanceUser = <AccountModel>{};
                }
                if (tab === "review") {
                    this.reviewShipTo = <ShipToModel>{};
                    this.reviewUser = <AccountModel>{};
                }
            }
        }

        getEndDate(review): Date {
            if (review) {
                var date = new Date(review.startDate);
                date.setDate(date.getDate() - 1);
                return date;
            }

            return this.getYearEnd(this.maintenanceInfo.fiscalYear, this.maintenanceInfo.fiscalYearEndDate);
        }

        reviewViewBudget(): void {
            this.budgetService.getReviews(this.reviewUser.id, this.reviewShipTo.id, this.reviewBudgetYear, true)
                .then((result: BudgetModel) => {
                    this.reviewInfo = result;
                });
        }

        removePeriod(value: number): void {
            this.calendar.budgetPeriods.splice(value, 1);
            this.calendarCalculate();
            this.addPeriod();
        }

        getCalendarPeriodFromDate(index: number): Date {
            var date: Date;
            if (index === 0) {
                date = new Date(this.calendar.fiscalYear - 1, 11, 31);
            } else {
                date = new Date(this.calendar.budgetPeriods[index - 1].toString());
            }
            date.setDate(date.getDate() + 1);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }

        getCalendarPeriodToDate(index: number): Date {
            var date: Date;
            if (index === this.calendar.budgetPeriods.length - 1 || !this.calendar.budgetPeriods[index + 1]) {
                date = this.calendar.fiscalYearEndDate ?
                    new Date(this.calendar.fiscalYearEndDate.toString()) :
                    new Date(this.calendar.fiscalYear + 2, 0, 1);
            } else {
                date = new Date(this.calendar.budgetPeriods[index + 1].toString());
            }
            date.setDate(date.getDate() - 1);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }


        protected addPeriod(): void {
            if (this.canAddPeriod()) {
                this.calendar.budgetPeriods.push(undefined);
            }
            this.addDateTimePicker();
        }

        protected addDateTimePicker(): void {
            this.$timeout(() => {
                this.datepicker(".datepicker", () => { this.updatePeriods(); });
                this.datepickerReset(".startdate, #FiscalYearEndDate");
            }, 0, false);
        }

        protected getYearEnd(fiscalYear: number, fiscalYearEndDate: Date): Date {
            if (!fiscalYearEndDate) {
                var date = new Date(fiscalYear, 11, 31);
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                return date;
            }
            return fiscalYearEndDate;
        }

        /* date picker code is only used by this controller. others use the directive pick-a-date */

        pickadateMinMax(data: any): any {
            // pickadate allows min/max values of undefined, int (ie. 30 days), or a date which should be passed in according to javascript "new Date()" documentation
            if (typeof data === "undefined") return data;
            return isNaN(data) ? new Date(data) : Number(data);
        }

        datepicker(selector: any, onCloseCallback?: () => void, onSetCallback?: () => void): void {
            if (typeof (selector) === "string")
                selector = $(selector);

            var that = this;

            selector.each(function() {

                var $this = $(this);

                that.pickadateMinMax($this.attr("data-mindate"));

                (<any>$this).pickadate({
                    format: "m/d/yyyy",
                    formatSubmit: "m/d/yyyy",
                    selectYears: true,
                    onOpen: function() {
                        $this.blur();
                    },
                    onClose: function() {
                        $this.blur();
                        if (onCloseCallback != undefined)
                            onCloseCallback();
                    },
                    onSet: function() {

                        if (onSetCallback != undefined)
                            onSetCallback();
                    },
                    min: that.pickadateMinMax($this.attr("data-mindate")),
                    max: that.pickadateMinMax($this.attr("data-maxdate"))
                });
            });
        }

        datepickerReset(selector: any): void {
            if (typeof (selector) === "string")
                selector = $(selector);

            var that = this;

            selector.each(function() {

                var $this = $(this);

                var picker = (<any>$this).pickadate("picker");

                picker.set("min", that.pickadateMinMax($this.attr("data-mindate")));
                picker.set("max", that.pickadateMinMax($this.attr("data-maxdate")));

                if ($this.attr("value")) {
                    picker.set("select", that.pickadateMinMax($this.attr("value")));
                } else {
                    picker.clear();
                }
            });
        }
    }

    angular
        .module("insite")
        .controller("BudgetController", BudgetController);
}