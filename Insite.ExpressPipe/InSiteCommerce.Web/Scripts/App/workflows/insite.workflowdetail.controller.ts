module insite.workflow {
    "use strict";

    export interface IWorkflowDetailScope extends ng.IScope {
        workflow: ModuleModel
        jsonItems: Array<any>;
        metrics: Array<any>;
        currentService: ServiceModel;
        selectedItem: any;
        getWorkflow(): any;
        getServiceResults(currentService: any, selectedItem: any): void;

    }

    export class WorkflowDetailController {

        static $inject = [
            "$scope",
            "workflowService",
            "coreService"
        ];

        constructor(
            protected $scope: IWorkflowDetailScope,
            protected workflowService: workflow.IWorkflowSevice,
            protected coreService: core.ICoreService) {

            this.init();
        } 

        init() {
            this.getWorkflow();
        }

        getWorkflow() {
            var serviceName = this.coreService.getQueryStringParameter("serviceName", true);
            this.workflowService.getWorkflow(serviceName)
                .then((result) => {
                this.$scope.workflow = result.data;
            });

            var bootstrap = this.lookupBootstrap(serviceName);

            this.$scope.metrics = [];
            this.$scope.jsonItems = [];

            bootstrap.forEach((each) => {
                var serviceUrl = "/" + each;
                this.workflowService.bootstrapService(serviceUrl)
                    .then((result) => {
                    var str = JSON.stringify(result, null, 4);
                    var button = "View " + serviceUrl.substring(serviceUrl.lastIndexOf("/") + 1) + " json";
                    this.$scope.jsonItems.push({
                        json: this.syntaxHighlight(str),
                        buttonText: button
                    });
                });
            });

            this.$scope.getServiceResults = (currentService, selectedItem) => {
                this.$scope.currentService = currentService;
                this.$scope.selectedItem = this.$scope.jsonItems[selectedItem].json;
                this.coreService.displayModal(angular.element("#showServiceResult"));
            };
        }


        lookupBootstrap(serviceName: string) {
            var name = [];
            if (serviceName === "RequisitionService") {
                name[0] = "api/v1/requisitions";
            }
            if (serviceName === "CartService") {
                name[0] = "api/v1/carts";
            }
            if (serviceName === "WishListService") {
                name[0] = "api/v1/wishlists";
            }
            if (serviceName === "WebsiteService") {
                name[0] = "api/v1/countries";
                name[1] = "api/v1/states";
            }
            if (serviceName === "OrderService") {
                name[0] = "api/v1/orders";
            }
            if (serviceName === "InvoiceService") {
                name[0] = "api/v1/invoices";
            }
            if (serviceName === "CustomerService") {
                name[0] = "api/v1/billtos";
            }
            if (serviceName === "EmailService") {
                name[0] = "api/v1/email";
            }
            if (serviceName === "AccountService") {
                name[0] = "api/v1/accounts";
            }
            if (serviceName === "SessionService") {
                name[0] = "api/v1/sessions/current";
            }
            if (serviceName === "RmaService") {
                name[0] = "api/v1/rma";
            }
            if (serviceName === "CategoryService") {
                name[0] = "api/v1/categories";
            }
            if (serviceName === "ProductService") {
                name[0] = "api/v1/products";
            }
            if (serviceName === "BudgetService") {
                name[0] = "api/v1/products";
            }
            if (serviceName === "DashboardService") {
                name[0] = "api/v1/dashboardpanels";
            }
            if (serviceName === "DealerService") {
                name[0] = "api/v1/dealers";
            }
            if (serviceName === "MessageService") {
                name[0] = "api/v1/dealers";
            }
            if (serviceName === "UserService") {
                name[0] = "api/v1/users";
            }
            if (serviceName === "RfqService") {
                name[0] = "api/v1/quotes";
            }
            return name;
        }

        syntaxHighlight(json: any) {
            if (typeof json != "string") {
                json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                    var cls = "number";
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = "key";
                        } else {
                            cls = "string";
                        }
                    } else if (/true|false/.test(match)) {
                        cls = "boolean";
                    } else if (/null/.test(match)) {
                        cls = "null";
                    }
                    return "<span class='" + cls + "'>" + match + "</span>";
                });
        }

    } angular
        .module("insite")
        .controller("WorkflowDetailController", WorkflowDetailController);
} 