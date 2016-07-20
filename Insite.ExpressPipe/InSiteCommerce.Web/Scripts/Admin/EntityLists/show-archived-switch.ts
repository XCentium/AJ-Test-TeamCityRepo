module insite_admin {
    "use strict";

    export enum ArchiveFilter {
        Active,
        Archived,
        Both
    }

    export class ShowArchivedSwitchController {
        onChange: any;
        archiveFilter;
        showArchivedOnly: boolean = false;

        static $inject = ["$scope", "$timeout"];
        constructor(protected $scope: ng.IScope, protected $timeout: ng.ITimeoutService) {
            this.showArchivedOnly = this.archiveFilter === ArchiveFilter.Archived;
            this.watchShowArchivedOnly();
        }

        watchShowArchivedOnly() {
            this.$scope.$watch("vm.showArchivedOnly", (newVal, oldVal) => {
                if (newVal === oldVal) {
                    return;
                }

                this.archiveFilter = (<boolean>newVal) ? ArchiveFilter.Archived : ArchiveFilter.Active;

                this.$timeout(() => {
                    this.onChange();
                }, 0);
            });

            this.$scope.$watch("vm.archiveFilter", (newVal, oldVal) => {
                this.showArchivedOnly = (<ArchiveFilter>newVal) === ArchiveFilter.Archived;
            });
        }
    }

    var showArchivedSwitch: ng.IDirectiveFactory = () => {
        var directive: ng.IDirective = {
            restrict: "E",
            controller: "showArchivedSwitchController",
            controllerAs: "vm",
            scope: {
                onChange: "&",
                archiveFilter: "="
            },
            bindToController: true,
            template: `
                        <div class="selection-actions">
                            <span class="selection-actions__label flex-none">Show</span>
                            <select class="no-margin"
                                    ng-model="vm.showArchivedOnly"
                                    ng-options="(!item ? 'Active' : 'Archived') for item in [false, true]">
                            </select>
                        </div>
            `
        };
        return directive;
    }

    angular
        .module("insite-admin")
        .controller("showArchivedSwitchController", ShowArchivedSwitchController)
        .directive("isaShowArchivedSwitch", showArchivedSwitch);
}