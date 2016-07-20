module insite.useradministration {
    "use strict";

    export class UserShipToController {

        pageNumber = 1;
        pageSize = null;
        sort = "ShipTo";
        userProfileId: System.Guid;
        costCodeCollection: Insite.Account.Services.Dtos.CustomerCostCodeDto[];
        userShipToCollection: AccountShipToModel[];
        pagination: PaginationModel;
        paginationStorageKey = "DefaultPagination-UserShipTo";
        errorMessage = "";
        saveSuccess = false;
        defaultShipTo = "";
        defaultShiptoNotAssigned = false;

        static $inject = [
            "userService",
            "paginationService",
            "coreService"
        ];

        constructor(
            protected userService: useradministration.IUserService,
            protected paginationService: core.IPaginationService,
            protected coreService: core.ICoreService)
        {
            this.init();
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey);

            this.userProfileId = this.coreService.getQueryStringParameter("userId", true);
            this.search();
        }

        search() {
            this.errorMessage = "";
            this.userService.getUserShipToCollection(this.userProfileId, this.pagination, this.sort).success((result: AccountShipToCollectionModel) => {
                this.pagination = result.pagination;
                this.costCodeCollection = result.costCodeCollection;
                this.userShipToCollection = result.userShipToCollection;

                var defaultShipTos = result.userShipToCollection.filter(u => u.isDefaultShipTo);
                if (defaultShipTos.length === 1) {
                    this.defaultShipTo = defaultShipTos[0].shipToNumber;
                } else {
                    this.defaultShipTo = null;
                }
            }).error(data => {
                if (data && data.message) {
                    this.errorMessage = data.message;
                }
            });
        }

        saveShipToCollection() {
            this.userShipToCollection.forEach(u => u.isDefaultShipTo = u.shipToNumber === this.defaultShipTo);

            this.errorMessage = "";
            this.saveSuccess = false;
            this.defaultShiptoNotAssigned = false;

            for (var i = 0; i < this.userShipToCollection.length; i++) {
                if (this.userShipToCollection[i].isDefaultShipTo && !this.userShipToCollection[i].assign) {
                    this.defaultShiptoNotAssigned = true;
                }
            }

            if (!this.defaultShiptoNotAssigned) {
                this.userService.applyUserShipToCollection(this.userProfileId, this.userShipToCollection).success(data => {
                    this.saveSuccess = true;
                }).error(data => {
                    this.saveSuccess = false;
                    this.errorMessage = "";
                    if (data && data.message) {
                        this.errorMessage = data.message;
                    }
                });
            }
        }

        sortBy(sortKey: string) {
            if (this.sort.indexOf(sortKey) >= 0)
            {
                this.sort = this.sort.indexOf("DESC") >= 0 ? sortKey : sortKey + " DESC";
            }
            else
            {
                this.sort = sortKey;
            }

            this.pagination.currentPage = 1;
            this.search();
        }

        getSortClass(key: string) {
            return this.sort.indexOf(key) >= 0 ?
                (this.sort.indexOf("DESC") >= 0 ? "sort-descending" : "sort-ascending") : "";
        }
    }

    angular
        .module("insite")
        .controller("UserShipToController", UserShipToController);
}
