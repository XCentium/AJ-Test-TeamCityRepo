module insite {
    "use strict";

    angular
        .module("insite", [
            "ngSanitize",
            "ipCookie",
            "angular.filter",
            "ngMap",
            "ab-base64",
            "kendo.directives"
        ])
        .run(["$appRunService", appRunFunction]);
    

    //
    //  The app.run function will execute .run on $appRunService.
    //  Replace the default $appRunService factory with your own to run your own startup code.
    //
    function appRunFunction($appRunService: IAppRunService) {
        $appRunService.run();
    }
    
    export interface IAppRunService {
        run: () => void;
    }

    function factory(coreService: core.ICoreService, $localStorage: core.IWindowStorage, $window: ng.IWindowService): AppRunService {
        return new AppRunService(coreService, $localStorage, $window);
    }
    factory.$inject = ["coreService", "$localStorage", "$window"];

    export class AppRunService implements IAppRunService {  
        constructor(
            protected coreService: core.ICoreService,
            protected $localStorage: core.IWindowStorage,
            protected $window: ng.IWindowService) {
        }
          
        run() {
            var hash = this.coreService.queryString(this.$window.location.hash.split("&"));
            var accessToken = hash["access_token"];
            if (accessToken) {
                this.$localStorage.set("accessToken", accessToken);
                this.$window.location.hash = this.$window.location.hash.split("&").filter(o => o.indexOf("access_token=") !== 0).join("&");
            }
        } 
    }

    angular
        .module("insite")
        .factory("$appRunService", factory);
}