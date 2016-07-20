module insite.layout {
    "use strict";

    export class MorscoHeaderController extends HeaderController {
        session: any;
        
        static $inject = ["$scope", "$timeout", "cartService", "sessionService"];

        constructor(
            protected $scope: ng.IScope,
            protected $timeout: ng.ITimeoutService,
            protected cartService: cart.ICartService,
            protected sessionService: account.ISessionService) {

            super($scope, $timeout, cartService);

            this.init();
        }

        init() {
            super.init();
            this.$scope.$on("sessionLoaded", (event: ng.IAngularEvent, session: SessionModel) => {
                this.session = session;
            });
        }
    }

    angular
        .module("insite")
        .controller("HeaderController", MorscoHeaderController);
} 