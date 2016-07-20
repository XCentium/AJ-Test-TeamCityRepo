module insite_admin {
    "use strict";
    
    export interface IPablishData {
        ids: string[];
    }

    export class PublishController {
        date: Date;
        displayDate: string;
        ids: string[];
        datePickerOptions: any;
        

        static $inject = ["$rootScope", "$scope", "$http", "FoundationApi"];
        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $foundationApi: any
        ) {
            this.init();
        }

        init() {
            this.datePickerOptions = {
                parseFormats: ["yyyy-MM-ddTHH:mm:ss"]
            };
            
            this.$scope.$on("showPublishDialog", (event: ng.IAngularEvent, data: IPablishData) => {
                this.date = new Date();
                this.ids = data.ids;
                this.$foundationApi.publish("approveAndPublish", "open");
            });

            this.ids = [];
        }

        validateDate():boolean {
            return this.displayDate && !this.date;
        }

        publish() {
            this.$rootScope.$broadcast("PublishClicked", { ids: this.ids, dateTime: this.date });
            this.$foundationApi.publish("approveAndPublish", "close");
        }
    }

    angular
        .module("insite-admin")
        .controller("PublishController", PublishController);
}