///<reference path="../../typings/moment/moment.d.ts"/>

module insite_admin {
    "use strict";

    export interface SearchIndex {
        name: string;
        type: string;
        status: string;
        allowPartialRebuild: boolean;
        buttonsEnabled: boolean;
        currentRun?: SearchIndexRun;
        lastRun?: SearchIndexRun;
        lastSuccessfulRun?: SearchIndexRun;
    }

    export interface SearchIndexRun {
        completedAt: Date;
        integrationJobId: System.Guid;
        startedAt: Date;
        status: string;
        durationDisplay: string;
    }

    export class SearchIndexingController {
        displayIndexes: SearchIndex[];
        indexes: SearchIndex[];
        indexExists: boolean;
        error: string;
        rebuildAllEnabled = true;

        static $inject = ["$scope", "$http"];

        constructor(
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService
        ) {
            this.init();
        }

        init() {
            this.$http.get("/admin/search/indexstatus").success((data: any) => {
                this.indexExists = data.indexExists;
                this.error = data.error;
                this.indexes = data.indexes.map(i => <SearchIndex>{
                    name: i.displayName,
                    type: i.indexType,
                    status: i.currentRun ? i.currentRun.status : (i.lastRun ? i.lastRun.status : ""),
                    buttonsEnabled: !i.currentRun,
                    allowPartialRebuild: i.allowPartialRebuild,
                    currentRun: i.currentRun,
                    lastRun: i.lastRun,
                    lastSuccessfulRun: i.lastSuccessfulRun
                });

                this.indexes.forEach(i => this.setIndexDurations(i));
                this.rebuildAllEnabled = this.indexes.every(o => { return o.buttonsEnabled; });

                this.$scope.$on("search-index-finished", (event: ng.IAngularEvent, indexType: string, indexRun: any) =>
                    this.$scope.$apply(() => this.onIndexFinished(indexType, this.createIndexRun(indexRun))));

                this.$scope.$on("search-index-rebuilding", (event: ng.IAngularEvent, indexType: string, indexRun: any) =>
                    this.$scope.$apply(() => this.onIndexStarted(indexType, this.createIndexRun(indexRun))));
            });

            this.displayIndexes = (<any>[]).concat(this.indexes);
        }

        rebuild(indexType: string, isPartial?: boolean) {
            this.disableButtons(indexType);

            var url = "/admin/search/rebuildindex?";
            if (indexType) {
                url += `indexType=${indexType}&`;
            }
            if (isPartial) {
                url += `isPartial=${isPartial}`;
            }

            this.$http.post(url, null);
        }

        disableButtons(indexType: string) {
            var filteredIndexes = this.indexes.filter(i => i.type === indexType);

            switch (indexType)
            {
                case "product":
                case "content":
                case "category":
                    filteredIndexes.forEach(i => i.buttonsEnabled = false);
                    break;
                default:
                    this.indexes.forEach(i => i.buttonsEnabled = false);
                    break;
            }

            this.rebuildAllEnabled = false;
        }

        onIndexStarted(indexType: string, indexRun: SearchIndexRun) {
            this.disableButtons(indexType);
            
            var filteredIndexes = this.indexes;
            if (indexType) {
                filteredIndexes = filteredIndexes.filter(i => i.type === indexType);
            }
            
            filteredIndexes.forEach(i => {
                i.currentRun = indexRun;
                i.status = indexRun.status;
            });
        }

        onIndexFinished(indexType: string, indexRun: SearchIndexRun)
        {
            var filteredIndexes = this.indexes;
            if (indexType) {
                filteredIndexes = filteredIndexes.filter(i => i.type === indexType);
            }
            
            filteredIndexes.forEach(i => {
                i.currentRun = null;
                i.buttonsEnabled = true;
                
                if (indexRun.status !== "Success") {
                    i.lastSuccessfulRun = (i.lastRun && i.lastRun.status === "Success" ? i.lastRun : null) || i.lastSuccessfulRun;
                } else {
                    i.lastSuccessfulRun = null;
                }

                i.lastRun = indexRun;
                i.status = indexRun.status;
                this.setIndexDurations(i);
            });

            this.rebuildAllEnabled = !this.indexes.some(i => i.buttonsEnabled === false);
        }

        createIndexRun(object): SearchIndexRun {
            return <SearchIndexRun>{
                completedAt: object.CompletedAt,
                integrationJobId: object.IntegrationJobId,
                startedAt: object.StartedAt,
                status: object.Status
            };
        }

        getClass(status: string) {
            switch (status) {
                case "Success":
                    return "icon-done-all";
                case "InProgress":
                    return "icon-warning";
                case "Failure":
                    return "icon-error";
            }

            return "";
        }

        setIndexDurations(index: SearchIndex) {
            if (index.currentRun) {
                index.currentRun.durationDisplay = this.getIndexDuration(index.currentRun);
            }
            if (index.lastRun) {
                index.lastRun.durationDisplay = this.getIndexDuration(index.lastRun);
            }
            if (index.lastSuccessfulRun) {
                index.lastSuccessfulRun.durationDisplay = this.getIndexDuration(index.lastSuccessfulRun);
            }
        }

        getIndexDuration(indexRun: SearchIndexRun) {
            if (indexRun && indexRun.completedAt && indexRun.startedAt) {
                var startedAt = moment(indexRun.startedAt);
                var completedAt = moment(indexRun.completedAt);
                var duration = moment.duration(completedAt.diff(startedAt));

                var displayParts = [];
                var durationDisplay = "";

                if (duration.hours() > 0) {
                    displayParts.push(duration.hours() + "h");
                }
                if (duration.minutes() > 0) {
                    displayParts.push(duration.minutes() + "m");
                }
                if (duration.seconds() > 0) {
                    displayParts.push(duration.seconds() + "s");
                }

                if (displayParts.length === 0 && duration.milliseconds() > 0) {
                    displayParts.push("1s");
                }

                if (displayParts.length > 0) {

                    durationDisplay = `(${displayParts.join(" ")})`;
                }

                return durationDisplay;
            }

            return "";
        }
    }

    angular
        .module("insite-admin")
        .controller("SearchIndexingController", SearchIndexingController);
}