module insite.layout {
    "use strict";

    export class TopNavController {
        languages: any[];
        currencies: any[];
        session: any;
        dashboardUrl: string;

        static $inject = [
            "$scope",
            "$window",
            "accountService",
            "sessionService",
            "websiteService"];

        constructor(
            protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: account.IAccountService,
            protected sessionService: account.ISessionService,
            protected websiteService: websites.IWebsiteService)
        {
            this.init();
        }

        init() {
            this.$scope.$on("sessionLoaded",(event: ng.IAngularEvent, session: SessionModel) => {
                this.session = session;

                // This is cached client side (5 minutes by default)
                this.websiteService.getWebsite("languages,currencies").success(website => {
                    this.languages = website.languages.languages.filter(l => l.isLive);
                    this.currencies = website.currencies.currencies;

                    this.checkCurrentPageForMessages();

                    angular.forEach(this.languages, (language: any) => {
                        if (language.id === this.session.language.id) {
                            this.session.language = language;
                        }
                    });
                    angular.forEach(this.currencies, (currency: any) => {
                        if (currency.id === this.session.currency.id) {
                            this.session.currency = currency;
                        }
                    });
                });
            });
        }

        setLanguage(languageId: string): void {
            languageId = languageId ? languageId : this.session.language.id;
            this.sessionService.setLanguage(languageId).then(() => { this.$window.location.reload(); });
        }

        setCurrency(currencyId: string): void {
            currencyId = currencyId ? currencyId : this.session.currency.id;
            this.sessionService.setCurrency(currencyId).then(() => { this.$window.location.reload(); });
        }

        signOut(returnUrl: string): void {
            this.sessionService.signOut().then(
                () => {
                    this.$window.location.href = returnUrl;
                });
        }

        checkCurrentPageForMessages(): void {
            var currentUrl = window.location.href.toLowerCase();
            var index: number = currentUrl.indexOf(this.dashboardUrl.toLowerCase());
            var show: boolean = index === -1 || (index + this.dashboardUrl.length !== currentUrl.length);
            if (!show && this.session.hasRfqUpdates)
            {
                this.closeQuoteInformation();
            }
        }

        closeQuoteInformation(): void {
            this.session.hasRfqUpdates = false;

            var session = <SessionModel>{};
            session.hasRfqUpdates = false;
            this.sessionService.updateSession(session);
        }

    }

    angular
        .module("insite")
        .controller("TopNavController", TopNavController);

}