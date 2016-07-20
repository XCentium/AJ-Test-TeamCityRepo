
module insite_admin {
    "use strict";

    export class DateTimePickerController {
        model: any;
        element: any;
        controlMin: string;
        controlMax: string;
        minDate: Date = new Date(1970, 0, 1, 0, 0, 0);
        maxDate: Date = new Date(2099, 0, 1, 0, 0, 0);
        dateModel: Date;
        dateString: string;
        dateFormat: string;
        options: any = {};
        required: boolean;

        static $inject = ["$http", "$scope"];

        constructor(
            protected $http: ng.IHttpService,
            protected $scope: ng.IScope
        ) {
            this.init();
        }

        init() {
            if (this.controlMin) {
                this.minDate = new Date(this.controlMin);
            }

            if (this.controlMax) {
                this.maxDate = new Date(this.controlMax);
            }

            if (this.model) {
                this.dateString = this.model;
                this.dateModel = new Date(this.model);
            }
            
            this.$scope.$watch("dateTimePickerController.dateModel", (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }
                if (this.isDate(newValue)) {
                    this.element.$setValidity("pattern", !!this.dateModel || !this.dateString);
                    this.model = kendo.toString(newValue, this.dateFormat);
                    this.dateString = this.model;
                } else if (!newValue) {
                    this.model = null;
                }
            });

            this.$scope.$watch("dateTimePickerController.dateString", (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }

                var settingToNullAndNotRequired = (!this.required && !newValue);
                var settingToNullAndDateModelIsNull = (!this.dateModel && !newValue);
                var hasCurrentDateModel = !!this.dateModel;
                // dateString won't include seconds or milliseconds, so we need to remove it from dateModel to determine if dateModel is not the same as dateString
                var dateModelWithoutSecondsOrMilliseconds = this.dateModel.setSeconds(0, 0);
                var newValueTime = Date.parse(newValue);
                if (newValueTime > 0 && (!oldValue || oldValue.indexOf("T") === -1)) {
                    newValueTime += new Date(newValueTime).getTimezoneOffset() * 60000;
                }
                var newValueIsTheSameAsCurrentDateModel = hasCurrentDateModel && dateModelWithoutSecondsOrMilliseconds === newValueTime;
                var isValidValue = settingToNullAndNotRequired || settingToNullAndDateModelIsNull || newValueIsTheSameAsCurrentDateModel;

                this.element.$setValidity("pattern", isValidValue);
            });
        }

        private isDate (x) {
            return x instanceof Date;
        }
    }
    angular
        .module("insite-admin")
        .controller("DateTimePickerController", DateTimePickerController)
        .directive("isaDateTimePicker", <any>function() {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "DateTimePickerController",
                controllerAs: "dateTimePickerController",
                bindToController: true,
                require: "ngModel",
                link: (scope, element, attr, ngModel) => {
                    scope.dateTimePickerController.element = ngModel;
                },
                scope: {
                    controlMin: "@",
                    controlMax: "@",
                    model: "=",
                    required: "=",
                    dateFormat: "@"
                },
                template: `<input type=\"text\" kendo-date-time-picker
                                k-parse-formats=\"['{{dateTimePickerController.dateFormat}}', 'yyyy-MM-ddTHH:mm:ss.fffffffzzz', 'yyyy-MM-dd HH:mm:ss.fffffff zzz', 'yyyy-MM-dd HH:mm:ss zzz']\"
                                ng-model=\"dateTimePickerController.dateString\" k-ng-model=\"dateTimePickerController.dateModel\" k-options=\"dateTimePickerController.options\"" +
                        " k-min=\"{{'dateTimePickerController.minDate'}}\" k-max=\"{{'dateTimePickerController.maxDate'}}\" />`
            }
        })
        .directive("isaDatePicker", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "DateTimePickerController",
                controllerAs: "dateTimePickerController",
                bindToController: true,
                require: "ngModel",
                link: (scope, element, attr, ngModel) => {
                    scope.dateTimePickerController.element = ngModel;
                },
                scope: {
                    controlMin: "@",
                    controlMax: "@",
                    model: "=",
                    required: "=",
                    dateFormat: "@"
                },
                template: "<input type=\"text\" kendo-date-picker k-parse-formats=\"['{{dateTimePickerController.dateFormat}}', 'yyyy-MM-ddTHH:mm:ss.fffffffzzz', 'yyyy-MM-dd HH:mm:ss.fffffff zzz', 'yyyy-MM-dd HH:mm:ss zzz']\" k-ng-model=\"dateTimePickerController.dateModel\" ng-model=\"dateTimePickerController.model\" k-options=\"dateTimePickerController.options\"" +
                " k-min=\"{{'dateTimePickerController.minDate'}}\" k-max=\"{{'dateTimePickerController.maxDate'}}\" />"
            }
        })
        .directive("isaTimePicker", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                controller: "DateTimePickerController",
                controllerAs: "dateTimePickerController",
                bindToController: true,
                require: "ngModel",
                link: (scope, element, attr, ngModel) => {
                    scope.dateTimePickerController.element = ngModel;
                },
                scope: {
                    controlMin: "@",
                    controlMax: "@",
                    model: "=",
                    required: "=",
                    dateFormat: "@"
                },
                template: "<input type=\"text\" kendo-time-picker k-parse-formats=\"['{{dateTimePickerController.dateFormat}}', 'yyyy-MM-ddTHH:mm:ss.fffffffzzz', 'yyyy-MM-dd HH:mm:ss.fffffff zzz', 'yyyy-MM-dd HH:mm:ss zzz']\" k-options=\"dateTimePickerController.options\" k-ng-model=\"dateTimePickerController.dateModel\" ng-model=\"dateTimePickerController.model\"" +
                " k-min=\"{{'dateTimePickerController.minDate'}}\" k-max=\"{{'dateTimePickerController.maxDate'}}\" />"
            }
        });
}