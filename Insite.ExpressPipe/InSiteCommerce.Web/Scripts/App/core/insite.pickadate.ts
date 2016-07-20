/// <reference path="../../typings/angularjs/angular.d.ts" />
// A directive wrapper for pickadate.js 
// value gets set to a iso formatted non localized date or null, which webapi will derserialize correctly.
// usage:  <input type="text" value="" class="datepicker txt" pick-a-date="vm.fromDate" min-date="vm.mindate" update="vm.updateCallback()"  />

module insite.core {
    "use strict";

    export interface IPickADateScope extends ng.IScope {
        iscPickADate: string;
        minDate: Date;
        maxDate: Date;
        pickADateOptions: {};
        update: () => void;
    }

    export interface IPickADateElement extends ng.IAugmentedJQuery {
        pickadate: (name: string) => any;
    }

    angular.module('insite').directive('iscPickADate', [
        '$filter', function($filter: ng.IFilterService) {

            var directive : ng.IDirective = {
                restrict: "A",
                scope: {
                    iscPickADate: '=', // iso formatted date string returned to the parent scope
                    minDate: '=',
                    maxDate: '=',
                    pickADateOptions: '=', // options to pass through to the pick-a-date control
                    update: '&' // set this attribute to call a parent scope method when the date is updated
                },
                link: function(scope: IPickADateScope, element: IPickADateElement, attrs: ng.IAttributes) {
                    var options = $.extend(scope.pickADateOptions || {}, {
                        onSet: function(e) {
                            if (scope.$$phase || scope.$root.$$phase) // we are coming from $watch or link setup
                                return;
                            var select = element.pickadate('picker').get('select'); // selected date
                            scope.$apply(function() {
                                if (e.hasOwnProperty('clear')) {
                                    scope.iscPickADate = '';
                                    if (scope.update)
                                        scope.update();
                                    return;
                                }
                                if (select) {
                                    // pass the pick-a-date selection to the scope variable
                                    scope.iscPickADate = select.obj.toISOString();
                                }
                            });
                        },
                        onClose: function() {
                            element.blur();
                            if (scope.update)
                                scope.update();
                        },
                        selectYears: true
                    });

                    element.pickadate(options);
                    element.pickadate('picker').set('min', scope.minDate ? scope.minDate : false);
                    element.pickadate('picker').set('max', scope.maxDate ? scope.maxDate : false);

                    // this watch is needed to update the UI when the scope variable pickADate is updated external (initial values and clearing)
                    // override the default pickadate formatting with a regular angular filtered date            
                    scope.$watch('iscPickADate', function(newValue: string, oldValue: string) {
                        if (!newValue) {
                            element.prop("value", "");
                        } else {
                            var date = new Date(newValue);
                            element.pickadate('picker').set('select', date);
                            element.prop("value", $filter('date')(date, 'shortDate'));
                        }
                    }, true);

                    scope.$watch('minDate', function(newValue: string, oldValue: string) {
                        element.pickadate('picker').set('min', newValue ? newValue : false);
                    }, true);

                    scope.$watch('maxDate', function(newValue: string, oldValue: string) {
                        element.pickadate('picker').set('max', newValue ? newValue : false);
                    }, true);
                }
            };
            return directive;
        }
    ]);
}