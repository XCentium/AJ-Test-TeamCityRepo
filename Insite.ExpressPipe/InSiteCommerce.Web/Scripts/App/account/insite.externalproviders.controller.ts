module insite.account {
    "use strict";

    export class ExternalProvidersController {

        externalProviders: ExternalProviderLinkModel[];

        static $inject = ["accountService"];

        constructor(protected accountService: IAccountService) {
            this.init();
        }

        init() {
            this.accountService.getExternalProviders().success((externalProviderCollection: ExternalProviderLinkCollectionModel) => {
                this.externalProviders = externalProviderCollection.externalProviders;
            });
        }
    }

    angular
        .module("insite")
        .controller("ExternalProvidersController", ExternalProvidersController);
}