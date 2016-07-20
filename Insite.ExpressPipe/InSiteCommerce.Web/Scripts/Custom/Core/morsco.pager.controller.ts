module insite.core {
    "use strict";

    export class morscoPagerController extends PagerController {

        static $inject = [
            "paginationService",
			"$window",
            "spinnerService"
        ];

        constructor(
            protected paginationService: core.IPaginationService,
			protected $window: ng.IWindowService,
            protected spinnerService: core.ISpinnerService) {
            super(paginationService, $window);
        }

        nextPage() {
            this.spinnerService.show("mainLayout", true);
            super.nextPage();
            this.spinnerService.show("mainLayout", false);
        }

        prevPage() {
            this.spinnerService.show("mainLayout", true);
			super.prevPage();
            this.spinnerService.show("mainLayout", false);
        }

        pageInput() {
            this.spinnerService.show("mainLayout", true);
			super.pageInput();
            this.spinnerService.show("mainLayout", false);
        }

        updatePageSize() {
            this.spinnerService.show("mainLayout", true);
            super.updatePageSize();
            this.spinnerService.show("mainLayout", false);
        }

        updateSortOrder() {
            this.spinnerService.show("mainLayout", true);
			super.updateSortOrder();
            this.spinnerService.show("mainLayout", false);
        }
    }

    angular
        .module("insite")
        .controller("PagerController", morscoPagerController);
}
