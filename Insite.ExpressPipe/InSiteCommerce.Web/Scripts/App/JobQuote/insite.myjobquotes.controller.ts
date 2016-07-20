module insite.jobquote {
    "use strict";

    export class MyJobQuotesController {
        jobs: any;

        static $inject = ["$scope", "jobQuoteService"];
        constructor(
            protected $scope: ng.IScope,
            protected jobQuoteService: jobquote.IJobQuoteService) {

            this.init();
        }

        init() {
            this.getJobs();
        }


        getJobs(): any {
            this.jobQuoteService.getJobQuotes()
                .success((result) => {
                    this.jobs = result.jobQuotes;
                });
        }
    }


angular
    .module("insite")
    .controller("MyJobQuotesController", MyJobQuotesController);
}