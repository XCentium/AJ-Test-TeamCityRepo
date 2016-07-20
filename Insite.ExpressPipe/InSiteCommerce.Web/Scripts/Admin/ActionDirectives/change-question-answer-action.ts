module insite_admin {
    "use strict";

    export class ChangeQuestionAnswerActionController extends ChangeUserCredentialsController {
        passwordResetDialog: any;

        username = "";
        currentPassword = "";
        isCurrentPasswordCorrect: boolean;
        newQuestion = "";
        newAnswer = "";

        static $inject = ["$rootScope", "$http", "spinnerService", "FoundationApi", "$scope"];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected $scope: ng.IScope
        ) {
            super($rootScope, $http, spinnerService, $foundationApi);

            this.$scope.$on("AdminAction-Detail:ChangeQuestionAnswer", (event, arg) => {
                this.$foundationApi.publish("changeQuestionAnswer", "open");
                this.resetForm();
                this.username = arg.model.userName;
            });
        }

        // TODO kill?
        init(): void {

        }

        validateForm(): boolean {
            return true;
        }

        getData(): any {
            var changeData = {
                username: this.username,
                currentPassword: this.currentPassword,
                newQuestion: this.newQuestion,
                newAnswer: this.newAnswer
            };
            return changeData;
        }

        successCallback() {
            this.$foundationApi.publish("changeQuestionAnswer", "close");
        }

        getUpdateUrl(): string {
            return "/admin/account/changequestionanswer";
        }

        resetForm() {
            super.resetForm();
            this.newQuestion = "";
            this.newAnswer = "";
        }
    }

    angular
        .module("insite-admin")
        .controller("ChangeQuestionAnswerActionController", ChangeQuestionAnswerActionController)
        .directive("isaChangeQuestionAnswerAction", <any>function () {
            return {
                restrict: "EAC",
                replace: false,
                controller: "ChangeQuestionAnswerActionController",
                templateUrl: "/admin/directives/ChangeQuestionAnswerAction",
                controllerAs: "vm",
                scope: { }
            }
        });
}