module insite_admin {
    "use strict";

    export class MessageDetailsController extends EntityDetailsController {

        customerTypes = {};
        websiteMessageTargetId: string;
        messageWebsites: any[];
        messagetargetsUrl = "/api/v1/admin/messagetargets";

        init() {
            super.init();
            this.loadWebSites();
            this.loadMessageTargets();
        }

        save(afterSave: any): void {
            if (this.entityId) {
                this.$q.all([this.saveRoles(), this.saveWebsite(), this.saveCustomerDistribution()]).then(() => {
                    super.save(afterSave);
                });
            } else {
                var hasWebsiteIdToSave = this.dirtyProperties.hasOwnProperty("websiteId");
                if (hasWebsiteIdToSave) {
                    var websiteId = this.model.websiteId;
                    delete this.dirtyProperties["websiteId"];
                    delete this.model.websiteId;
                    if (!afterSave) {
                        afterSave = (model) => {
                            this.$location.path(`/data/${this.formName}/${model.id}`);
                        };
                    }
                    super.save((model: any) => {
                        this.model.websiteId = websiteId;
                        this.saveWebsite(model.id).then(() => {
                            if (angular.isFunction(afterSave)) {
                                afterSave(model);
                            }
                        });
                    });
                } else {
                    super.save(afterSave);
                }
            }
        }

        saveRoles(): ng.IPromise<any> {
            var deferred = this.$q.defer();

            var needSaveRoles = this.dirtyProperties.hasOwnProperty("assignedRoles");
            if (needSaveRoles) {
                delete this.dirtyProperties["assignedRoles"];
                delete this.dirtyProperties["assignedRoleIds"];

                this.spinnerService.show();

                var newRoles = this.model.assignedRoles.filter((role: string) => {
                    return this.initialModel.assignedRoles.indexOf(role) === -1;
                });
                var deletedRoles = this.initialModel.assignedRoles.filter((role: string) => {
                    return this.model.assignedRoles.indexOf(role) === -1;
                });

                var requests = new Array<ng.IHttpPromise<any>>();
                for (var j = 0; j < newRoles.length; j++) {
                    requests.push(this.$http.post(this.messagetargetsUrl, { messageId: this.model.id, targetType: "Role", targetKey: newRoles[j] }));
                }

                // using array for assignedRoleIds, as we don't track child collection changes
                for (var i = 0; i < deletedRoles.length; i++) {
                    requests.push(this.$http.delete(this.messagetargetsUrl + "(" + this.model.assignedRoleIds[0][deletedRoles[i]] + ")"));
                }

                this.$q.all(requests).then((result: any) => {
                    for (var j = 0; j < newRoles.length; j++) {
                        this.model.assignedRoleIds[0][result[j].data.targetKey] = result[j].data.id;
                    }
                    this.initialModel.assignedRoles = angular.copy(this.model.assignedRoles);
                    this.initialModel.assignedRoleIds = angular.copy(this.model.assignedRoleIds);
                    deferred.resolve();
                }, () => {
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }

            return <ng.IHttpPromise<any>>deferred.promise;
        }

        saveWebsite(id?:System.Guid): ng.IPromise<any> {
            var deferred = this.$q.defer();

            if (this.initialModel.websiteId !== this.model.websiteId) {
                delete this.dirtyProperties["websiteId"];

                if (!this.model.websiteId) {
                    this.$http.delete(this.messagetargetsUrl + "(" + this.websiteMessageTargetId + ")").then(() => {
                        this.initialModel.websiteId = "";
                        deferred.resolve();
                    });
                } else {
                    this.$http.post(this.messagetargetsUrl, {
                         messageId: (id ? id : this.model.id), targetType: "WebSite", targetKey: this.model.websiteId
                    }).then((result: any) => {
                        this.initialModel.websiteId = result.data.targetKey;
                        this.websiteMessageTargetId = result.data.id;
                        deferred.resolve();
                    });
                }
            } else {
                deferred.resolve();
            }

            return <ng.IHttpPromise<any>>deferred.promise;
        }

        private saveCustomerDistribution(): ng.IPromise<any> {
            var deferred = this.$q.defer();

            if (this.initialModel.customerFilter !== this.model.customerFilter || this.initialModel.customerTypes !== this.model.customerTypes) {
                delete this.dirtyProperties["customerFilter"];
                delete this.dirtyProperties["customerTypes"];

                var requests = [];
                if (this.model.customerFilter === "selected") {
                    this.deleteCustomerInfo(false, true);
                } else if (this.model.customerFilter === "types") {
                    this.deleteCustomerInfo(true, false);
                    requests = this.getTypeRequests();
                } else if (this.model.customerFilter === "all") {
                    this.deleteCustomerInfo(true, true);
                }

                this.$q.all(requests).then((result: any) => {
                    for (var i = 0; i < requests.length; i++) {
                        if (this.model.customerFilter === "types" && result[i].config.method === "POST") {
                            this.customerTypes[result[i].data.targetKey] = result[i].data.id;
                        }
                    }

                    this.initialModel.customerFilter = this.model.customerFilter;
                    this.initialModel.customerTypes = this.model.customerTypes;
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }

            return <ng.IHttpPromise<any>>deferred.promise;
        }

        private getTypeRequests(): Array<any> {
            var requests = [];
            
            //adding new types
            var types = [];
            if (this.model.customerTypes) {
                var preventDublicates = {};
                types = this.model.customerTypes.split(",");
                for (var i = 0; i < types.length; i++) {
                    if (types[i] && !this.customerTypes[types[i]] && !preventDublicates[types[i]]) {
                        preventDublicates[types[i]] = true;
                        requests.push(this.$http.post(this.messagetargetsUrl, { messageId: this.model.id, targetType: "CustomerType", targetKey: types[i] }));
                    }
                }
            }

            //removing old ones
            if (this.initialModel.customerTypes) {
                var initTypes = this.initialModel.customerTypes.split(",");
                var ids = [];
                for (var j = 0; j < initTypes.length; j++) {
                    if (types.indexOf(initTypes[j]) === -1 && this.customerTypes[initTypes[j]]) {
                        ids.push(this.customerTypes[initTypes[j]]);
                    }
                }
                if (ids.length > 0) {
                    requests.push(this.$http({ method: "DELETE", url: this.messagetargetsUrl + "/delete", params: { ids: ids }}));
                }
            }

            return requests;
        }

        private deleteCustomerInfo(deleteCustomers: boolean, deleteCustomerTypes: boolean): void {
            var targetTypes = [];
            if (deleteCustomers) {
                targetTypes.push("(targettype eq 'Customer')");
            }
            if (deleteCustomerTypes) {
                targetTypes.push("(targettype eq 'CustomerType')");
            }
            var targetTypeFilter = targetTypes.join(" or ");
            if (targetTypes.length > 0) {
                this.$http.get(`/api/v1/admin/messages(${this.entityId})/messagetargets?$filter=(${targetTypeFilter})&$select=id`).then((result: any) => {
                    var ids = [];
                    for (var i = 0; i < result.data.value.length; i++) {
                        ids.push(result.data.value[i].id);
                    }

                    if (ids.length > 0) {
                        this.$http({ method: "DELETE", url: this.messagetargetsUrl + "/delete", params: { ids: ids } });
                    }
                });
            }

            if (deleteCustomerTypes) {
                this.customerTypes = {};
            }
        }

        private loadWebSites(): void {
            this.$http.get("/api/v1/admin/websites/?$orderby=name&$select=name,id").then((result: any) => {
                this.messageWebsites = [{ id: "", name: "All Websites" }];
                for (var i = 0; i < result.data.value.length; i++) {
                    this.messageWebsites.push(result.data.value[i]);
                }
            });
        }

        private loadMessageTargets(): void {
            if (!this.entityId) {
                return;
            }

            var targetTypeFilter = "(targettype eq 'WebSite') or (targettype eq 'Customer') or (targettype eq 'CustomerType')";
            this.$http.get(`/api/v1/admin/messages(${this.entityId})/messagetargets?$filter=(${targetTypeFilter})&$select=targettype,targetkey,id`).then((result: any) => {
                var typesArray = [];
                var filter = "all";
                for (var i = 0; i < result.data.value.length; i++) {
                    if (result.data.value[i].targetType === "WebSite") {
                        this.initialModel.websiteId = this.model.websiteId = result.data.value[i].targetKey;
                        this.websiteMessageTargetId = result.data.value[i].id;
                    } else if (result.data.value[i].targetType === "CustomerType") {
                        this.customerTypes[result.data.value[i].targetKey] = result.data.value[i].id;
                        typesArray.push(result.data.value[i].targetKey);
                        filter = "types";
                    } else if (result.data.value[i].targetType === "Customer") {
                        filter = "selected";
                        break;
                    }
                }

                this.model.customerFilter = filter;
                this.initialModel.customerFilter = filter;

                if (filter === "types") {
                    this.model.customerTypes = typesArray.join(",");
                    this.initialModel.customerTypes = typesArray.join(",");
                }
            });
        }
    }

    angular
        .module("insite-admin")
        .controller("MessageDetailsController", MessageDetailsController)
        .directive("isaMessageDistributionWebsite", () => {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "/admin/directives/MessageDistributionWebsite"
            }
        });
}