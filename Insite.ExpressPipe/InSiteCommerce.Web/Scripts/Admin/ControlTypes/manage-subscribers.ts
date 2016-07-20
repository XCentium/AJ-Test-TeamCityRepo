module insite_admin {
    "use strict";

    export class ManageSubscribersController {
        readOnly: boolean;
        model: any;
        propertyServiceUri: any;
        formName: string;
        subscribers: any[];
        availableSubscribers: any[];
        sortStorage: any = {};
        initResults: any;
        form: any;

        static $inject = ["$scope", "$http", "spinnerService", "fingerTabsService", "$location", "notificationService", "adminActionService"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected fingerTabsService: FingerTabsService,
            protected $location: ng.ILocationService,
            protected notificationService: INotificationService,
            protected adminActionService: IAdminActionService) {
            this.init();
        }

        init() {
            this.loadData();
            this.$scope.$on("EditEntityAfterSaved", () => {
                this.saveData();
            });

            this.$scope.$watch("vm.subscribers", (newValue) => {
                if (this.subscribers && this.availableSubscribers) {
                    var changed = !angular.equals(this.initResults, newValue);
                    if (changed) {
                        this.model.emailSubscribers = {};
                    } else {
                        delete this.model.emailSubscribers;
                    }
                }
            }, true);
        }

        loadData(): void {
            this.$http.get(`/api/v1/admin/emaillists(${this.model.id})/emailsubscribers?t=` + Date.now()).then((result: any) => {
                this.subscribers = result.data.value;
                this.initResults = angular.copy(this.subscribers);
                this.propertyServiceUri.emailSubscribers = {
                    url: "",
                    tab: this.fingerTabsService.getSelectedTab(this.$location.path())
                };
            });
            this.$http.get(`/api/v1/admin/emailsubscribers?$filter=emaillists/any(emaillist: emaillist/id ne ${this.model.id})&t=` + Date.now()).then((result: any) => {
                this.availableSubscribers = result.data.value;
            });
        }

        saveData(): void {
            var i: number;

            var addIds = [];
            for (i = 0; i < this.subscribers.length; i++) {
                if (!this.checkIfContainsId(this.initResults, this.subscribers[i].id)) {
                    addIds.push(this.subscribers[i].id);
                }
            }

            var deleteIds = [];
            for (i = 0; i < this.initResults.length; i++) {
                if (!this.checkIfContainsId(this.subscribers, this.initResults[i].id)) {
                    deleteIds.push(this.initResults[i].id);
                }
            }

            var requestsLeft = 0;
            if (addIds.length > 0) {
                requestsLeft++;
                this.$http.post(`/api/v1/admin/emaillists(${this.model.id})/emailsubscribers/$ref`, { value: addIds })
                    .then(() => { this.saveCompleted(--requestsLeft); });
            }

            if (deleteIds.length > 0) {
                requestsLeft++;
                this.$http.delete(`/api/v1/admin/emaillists(${this.model.id})/emailsubscribers/$ref`, {
                    data: { value: deleteIds },
                    headers: { "Content-Type": "application/json;charset=utf-8" }
                }).then(() => { this.saveCompleted(--requestsLeft); });
            }
        }

        saveCompleted(requestsLeft: number): void {
            if (requestsLeft === 0) {
                this.spinnerService.hide();
                this.initResults = angular.copy(this.subscribers);
                delete this.model.emailSubscribers;
            }
        }

        moveAll(direction: string): void {
            if (direction === "left") {
                this.subscribers = this.subscribers.concat(this.availableSubscribers);
                this.availableSubscribers = [];
            } else if (direction === "right") {
                this.availableSubscribers = this.availableSubscribers.concat(this.subscribers);
                this.subscribers = [];
            }
        }

        moveTo(subscriber: any, direction: string): void {
            var index;
            if (direction === "left") {
                index = this.availableSubscribers.indexOf(subscriber);
                this.subscribers.push(subscriber);
                this.availableSubscribers.splice(index, 1);
            } else if (direction === "right") {
                index = this.subscribers.indexOf(subscriber);
                this.availableSubscribers.push(subscriber);
                this.subscribers.splice(index, 1);
            }
        }

        changeSort(field: string, column: string): void {
            if (!this.sortStorage[column]) {
                this.sortStorage[column] = {
                    sortField: "",
                    sortConfig: {}
                };
            }
            this.sortStorage[column].sortField = field;
            this.sortStorage[column].sortConfig[field] = !!!this.sortStorage[column].sortConfig[field];
        }

        sortAsc(field: string, column: string): boolean {
            return this.sortStorage[column] && this.sortStorage[column].sortField === field && this.sortStorage[column].sortConfig[field] === true;
        }

        sortDesc(field: string, column: string): boolean {
            return this.sortStorage[column] && this.sortStorage[column].sortField === field && this.sortStorage[column].sortConfig[field] === false;
        }

        orderField(column: string, defaultValue: string): string {
            if (this.sortStorage[column]) {
                return this.sortStorage[column].sortField;
            }
            return defaultValue;
        }

        reverse(column: string): boolean {
            if (this.sortStorage[column] && typeof this.sortStorage[column].sortConfig[this.sortStorage[column].sortField] !== "undefined") {
                return this.sortStorage[column].sortConfig[this.sortStorage[column].sortField];
            }
            return false;
        }

        sendEmails(): void {
            this.adminActionService.executeEntityAction(this.formName, "SendEmails", this.model.id, <IAdminActionCallbacks>{
                success(returnModel: any) {
                    this.notificationService.show(NotificationType.Success, + returnModel.message + " emails sended.");
                }
            });
        }

        exportSubscribed(): void {
            this.$http.get("/api/v1/admin/jobdefinitions?$filter=name eq 'Data Exporter'").then((result: any) => {
                if (result.data.value.length > 0) {
                    this.createIntegrationJob(result.data.value[0]);
                } else {
                    this.notificationService.show(NotificationType.Error, "JobDefinition with name 'Data Exporter' was not found");
                }
            });
        }

        private createIntegrationJob(exporter: any): void {
            this.$http.get(`/api/v1/admin/integrationjobs/default`).then((job: any) => {
                var newJob = job.data;

                newJob.jobDefinitionId = exporter.id;
                newJob.siteUrl = this.$location.protocol() + "://" + this.$location.host();
                newJob.status = "Queued",
                newJob.exportObject = "emailSubscriber";
                newJob.exportQuery = `emailLists/any(emailList: emailList/id eq ${this.model.id})`;
                newJob.exportColumnList = "email";
                newJob.scheduleDateTime = new Date();

                this.$http.post(`/api/v1/admin/integrationjobs`, newJob).then(() => {
                    this.notificationService.show(NotificationType.Success, "Export job successfully created.");
                });
            });
        }

        private checkIfContainsId(subscribers: any[], id: System.Guid): boolean {
            for (var i = 0; i < subscribers.length; i++) {
                if (subscribers[i].id === id) {
                    return true;
                }
            }
            return false;
        }
    }

    angular
        .module("insite-admin")
        .controller("ManageSubscribersController", ManageSubscribersController)
        .directive("isaManageSubscribers", () => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "ManageSubscribers",
                controller: "ManageSubscribersController",
                controllerAs: "vm",
                bindToController: true,
                scope: {
                    readOnly: "@",
                    propertyServiceUri: "=",
                    formName: "=",
                    model: "=",
                    form: "="
                }
            }
        });
}