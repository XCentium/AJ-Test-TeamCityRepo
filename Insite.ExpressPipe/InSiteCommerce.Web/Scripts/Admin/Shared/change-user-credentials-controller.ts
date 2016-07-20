module insite_admin {
    "use strict";

    export class ChangeUserCredentialsController {
        username = "";
        accessToken: string;
        currentPassword = "";
        isCurrentPasswordCorrect: boolean;
        changeUserCredentialsUrl: string;

        changeUserCredentialsForm: any;

        static $inject = ["$rootScope", "$http", "spinnerService", "FoundationApi"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any) {
            this.init();
        }

        init() {
            throw new Error("Not implemented");
        }

        changeCredentials() {
            if (!this.validateForm()) {
                return;
            }

            this.spinnerService.show();

            var changeUserCredentialsData = this.getData();
            var config = { bypassErrorInterceptor: true };
            if (this.accessToken) {
                config["headers"] = {};
                config["headers"].Authorization = `Bearer ${this.accessToken}`;
            }
            this.$http.post(this.getUpdateUrl(), changeUserCredentialsData, config)
                .success((result) => {
                    if (result.toString().toLowerCase().indexOf("error") > -1) {
                        this.isCurrentPasswordCorrect = false;
                    } else {
                        this.successCallback();
                    }
                    this.spinnerService.hide();
                })
                .error(() => {
                    this.isCurrentPasswordCorrect = false;
                    this.spinnerService.hide();
                });
        }

        resetForm() {
            this.username = "";
            this.currentPassword = "";
            this.isCurrentPasswordCorrect = null;

            if (this.changeUserCredentialsForm) {
                this.changeUserCredentialsForm.$setPristine();
                this.changeUserCredentialsForm.$setUntouched();
            }
        }

        validateForm(): boolean {
            throw new Error("Not implemented");
        }

        getData(): any {
            throw new Error("Not implemented");
        }

        successCallback() {
            throw new Error("Not implemented");
        }

        getUpdateUrl(): string {
            throw new Error("Not implemented");
        }
    }
    angular
        .module("insite-admin")
        .controller("ChangeUserCredentialsController", ChangeUserCredentialsController);
}