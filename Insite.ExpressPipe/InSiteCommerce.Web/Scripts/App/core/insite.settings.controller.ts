module insite.core {
    "use strict";

    export class SettingsController {   
        productSettings: ProductSettingsModel;
        accoutSettings: AccountSettingsModel;
        wishListSettings: WishListSettingsModel;
        settings:any;

        public static $inject = ["coreService", "sessionService"];

        constructor(
            protected coreService: core.ICoreService,
            protected sessionService: ISessionService) {
            this.init();
        }

        init() {
            this.sessionService.getSession();

            this.coreService.getSettings(this.sessionService.isAuthenticated()).success(result => {
                this.settings = result.settingsCollection;
                this.productSettings = result.settingsCollection.productSettings;
                this.accoutSettings = result.settingsCollection.accountSettings;
                this.wishListSettings = result.settingsCollection.wishListSettings;

                this.coreService.broadcastSettings(this.settings);
            });
        }
    }

    angular
        .module("insite")
        .controller("SettingsController", SettingsController);
}