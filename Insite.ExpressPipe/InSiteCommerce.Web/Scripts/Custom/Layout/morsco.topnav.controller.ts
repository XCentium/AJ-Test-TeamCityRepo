module insite.layout {
    "use strict";

    export class MorscoTopNavController extends TopNavController {
        languages: any[];
        currencies: any[];
        session: any;
        billTo: BillToModel;
        billTos: BillToModel[];
        shipTo: ShipToModel;
        errorMessage = "";
        returnUrl: string;
        checkoutAddressUrl: string;
        cart: CartModel;
        reviewAndPayUrl: string;
        homePageUrl: string;
        addressesUrl: string;

        static $inject = [
            "$scope",
            "$window",
            "accountService",
            "sessionService",
            "websiteService",
            "customerService",
            "coreService",
            "spinnerService"];

        constructor(
            protected $scope: ng.IScope,
            protected $window: ng.IWindowService,
            protected accountService: account.IAccountService,
            protected sessionService: account.ISessionService,
            protected websiteService: websites.IWebsiteService,
            protected customerService: customers.ICustomerService,
            protected coreService: core.ICoreService,
            protected spinnerService: core.ISpinnerService)
        {
            super($scope, $window, accountService, sessionService, websiteService);
        }

        init() {
            this.$scope.$on("cartLoaded",(event: ng.IAngularEvent, cart: CartModel) => {
                this.cart = cart;
            });

            this.$scope.$on("sessionLoaded",(event: ng.IAngularEvent, session: SessionModel) => {
                this.session = session;

                // This is cached client side (5 minutes by default)
                this.websiteService.getWebsite("languages,currencies").success(website => {
                    this.languages = website.languages.languages.filter(l => l.isLive);
                    this.currencies = website.currencies.currencies;

                    this.checkCurrentPageForMessages();

                    angular.forEach(this.languages,(language: any) => {
                        if (language.id === this.session.language.id) {
                            this.session.language = language;
                        }
                    });
                    angular.forEach(this.currencies,(currency: any) => {
                        if (currency.id === this.session.currency.id) {
                            this.session.currency = currency;
                        }
                    });
                });
                
                this.returnUrl = this.coreService.getQueryStringParameter("returnUrl", true);
                if (!this.returnUrl) {
                    this.returnUrl = this.homePageUrl;
                }

                if (this.session.isAuthenticated) {
                    this.customerService.getBillTos("IncludeExtraAddresses=False").success(billToResult => {
                        this.billTos = billToResult.billTos;
                        if (this.billTos && this.billTos.length === 1) {
                            this.billTo = this.billTos[0];
                            this.changeBillTo();
                        }
                    });
                }



                this.hideDefaultCategory();
                this.removeHeadings();
                this.setWidth();
                $(window).on('resize', setWidthOnResize => {
                    this.setWidth();
                });
            });
        }

        hideDefaultCategory() {
            // hide default category
            $('#sub-cat > li').each(function () {
                var cats = $(this);

                cats.each(function () {
                    var cat = $(this);

                    if (cat.find('> a').text() === 'Default') {
                        cats.attr("style", "display: none !important");
                    }
                });
            });
        }

        checkCurrentPageForMessages(): void {
            var currentUrl = window.location.href.toLowerCase();
            if (!this.dashboardUrl) {
                this.dashboardUrl = '';
            }
            var index: number = currentUrl.indexOf(this.dashboardUrl.toLowerCase());
            var show: boolean = index === -1 || (index + this.dashboardUrl.length !== currentUrl.length);
            if (!show && this.session.hasRfqUpdates) {
                this.closeQuoteInformation();
            }
        }

        removeHeadings() {
            $('#sub-cat .sub-heading').remove();
        }

        setWidth() {
            setTimeout(function () {
                var windowWidth = $(window).width(),
                    padding = 20;

                $('.inf-ship-select').width('');
                $('.inf-ship-select').css('right', '');

                if (windowWidth >= 640) {
                    $('.inf-ship-select').width(windowWidth - padding);
                }

                if (windowWidth >= 768) {
                    $('.inf-ship-select').width('');
                }

                if (windowWidth >= 1180) {
                    $('.inf-ship-select').css('right', $('.top-bar').offset().left + padding / 2);
                    var leftOffset = $('.inf-ship .inf-selector').offset() ? $('.inf-ship .inf-selector').offset().left : 0;
                    $('.inf-ship-select').width($('.top-bar').offset().left + $('.top-bar').width() - leftOffset + padding);
                }

                if ($(window).width() > $('.top-bar-section').width()) {
                    $('#sub-cat').width($('.top-bar-section').width());
                } else {
                    $('#sub-cat').width($(window).width());
                }
            }, 500);
        }

        setCustomer() {
            if (!this.billTo || !this.shipTo) {
                return;
            }
            this.sessionService.setCustomer(this.billTo.id, this.shipTo.id).then((result: SessionModel) => {
                this.sessionService.redirectAfterSelectCustomer(result, this.cart.canBypassCheckoutAddress, this.dashboardUrl, this.returnUrl, this.checkoutAddressUrl, this.reviewAndPayUrl, this.addressesUrl);
            }, error => {
                    this.errorMessage = error.message;
                });
        }

        changeBillTo(): void {
            if (this.billTo && this.billTo.shipTos && this.billTo.shipTos.length === 1) {
                this.shipTo = this.billTo.shipTos[0];
            }
        }

        showShipTo() {
            $('.inf-ship').toggleClass('expand')
        }

        selectShipTo(shipTo: ShipToModel) {
            this.spinnerService.show("mainLayout", false);
            this.session.shipTo = shipTo;
            var self = this;
            this.sessionService.updateSession(this.session).success(shipToResult => {
                window.location.reload();
            });
        }

        showBranches() {
            $('.inf-branch').toggleClass('expand')
        }

    }

    angular
        .module("insite")
        .controller("TopNavController", MorscoTopNavController);

}