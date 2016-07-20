module insite_admin.formElements {
    "use strict";

    export class ContentInfoController {
        model: any;
        uri: string;

        nameLabel: string = "";
        nameValue: string = "";
        additionalInfo: string = "";
        siteUrl: string = "";

        static $inject = ["$http"];

        constructor(protected $http: ng.IHttpService) {
            this.init();
        }

        init() {
            if (this.model.name !== "") {
                var pluralizedName = this.model.name + "s";
                if (this.model.name === "Category") {
                    pluralizedName = "Categories";
                }

                this.uri = `/api/v1/admin/${pluralizedName}?$filter=(ContentManagerId eq ${this.model.id})`;
                this.$http.get(this.uri).then((result: any) => {
                    if (result.data.value.length > 0) {
                        this.setupInfo(result.data.value[0]);
                    }
                });
            }
        }

        setupInfo(entity: any) {
            this.nameLabel = this.model.name + " Name";
            this.nameValue = entity.name;

            if (this.model.name === "Category") {
                this.setupCategory(entity);
            } else if (this.model.name === "Product") {
                this.setupProduct(entity);
            } else if (this.model.name === "Specification") {
                this.setupSpecification(entity);
            } else if (this.model.name === "EmailTemplate") {
                this.setupEmailTemplate(entity);
            }
        }

        setupCategory(entity: any) {
            this.$http.get(`/admin/ContentManagerInfo/Category?id=${entity.id}`).success((result: any) => {
                this.siteUrl = `/Catalog/${result.categoryUrl}`;
                this.additionalInfo = result.categoryString;
            });
        }

        setupProduct(entity: any) {
            this.nameValue = entity.erpNumber;
            this.additionalInfo = entity.shortDescription;

            this.$http.get(`/admin/ContentManagerInfo/Product?id=${entity.id}`).success((result: any) => {
                this.siteUrl = `/Catalog/${result.productUrl}`;
            });
        }

        setupSpecification(entity: any) {
            if (typeof entity.productId !== "undefined" && entity.productId !== null) {
                this.$http.get(`/api/v1/admin/products(${entity.productId})`).success((result: any) => {
                    this.additionalInfo = `Product: ${result.name}`;
                });
            } else if(typeof entity.categoryId !== "undefined" && entity.categoryId !== null) {
                this.$http.get(`/api/v1/admin/categories(${entity.categoryId})`).success((result: any) => {
                    this.additionalInfo = `Category: ${result.name}`;
                });
            } else {
                this.additionalInfo = entity.description;
            }
        }

        setupEmailTemplate(entity: any) {
            this.nameLabel = "Email Template Name";
        }
    }

    angular
        .module("insite-admin")
        .controller("ContentInfoController", ContentInfoController)
        .directive("isaContentInfo", <any>function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "ContentInfoFormElement",
                controller: "ContentInfoController",
                controllerAs: "vm",
                bindToController: {
                    model: "="
                },
                scope: {}
            }
        });
}