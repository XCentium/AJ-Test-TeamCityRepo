module insite.useradministration {
    "use strict";

    export class UserListController {

        sort = "UserName";
        searchText = "";
        users: AccountModel[] = [];
        pagination: PaginationModel = null;
        paginationStorageKey = "DefaultPagination-UserList";

        static $inject = [
            "$scope",
            "accountService",
            "paginationService"
        ];

        constructor(
            protected $scope: ng.IScope,
            protected accountService: account.IAccountService,
            protected paginationService: core.IPaginationService) {

            this.init();
        }

        init() {
            this.pagination = this.paginationService.getDefaultPagination(this.paginationStorageKey, this.pagination);
            this.search();
        }

        search(sort: string = "UserName", newSearch: boolean = false) {
            this.sort = sort;
            if (newSearch) {
                this.pagination.currentPage = 1;
            }

            this.accountService.expand = "administration";
            this.accountService.getAccounts(this.searchText, this.pagination, this.sort)
                .success((result: AccountCollectionModel) => {
                    this.users = result.accounts;
                    this.pagination = result.pagination;
                })
                .error(data => {
                    this.users = [];
                    this.pagination = null;
                });
        }

        clearSearch() {
            if (this.searchText) {
                this.searchText = "";

                if (this.pagination) {
                    this.pagination.currentPage = 1;
                }

                this.search(this.sort);
            }
        }

        sortBy(sortKey: string) {
            if (this.sort.indexOf(sortKey) >= 0) {
                sortKey = this.sort.indexOf("DESC") >= 0 ? sortKey : sortKey + " DESC";
            }

            if (this.pagination) {
                this.pagination.currentPage = 1;
            }

            this.search(sortKey);
        }

        getSortClass(key: string) {
            return this.sort.indexOf(key) >= 0 ?
                (this.sort.indexOf("DESC") >= 0 ? "sort-descending" : "sort-ascending") : "";
        }
    }

    angular
        .module("insite")
        .controller("UserListController", UserListController);
}
