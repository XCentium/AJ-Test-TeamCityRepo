///<reference path="../../typings/angularjs/angular-plus.d.ts"/>

import WishListCollectionModel = Insite.WishLists.WebApi.V1.ApiModels.WishListCollectionModel;
import WishListModel = Insite.WishLists.WebApi.V1.ApiModels.WishListModel;
import WishListLineModel = Insite.WishLists.WebApi.V1.ApiModels.WishListLineModel;
import WishListSettingsModel = Insite.WishLists.WebApi.V1.ApiModels.WishListSettingsModel;

module insite.wishlist {
    
    "use strict";

    export interface IWishListService {
        getWishListCollection(): ng.IPromise<WishListCollectionModel>;
        getWishListDetails(wishList: WishListModel): ng.IHttpPromise<WishListModel>;
        addWishList(wishListName: string): ng.IPromise<any>;
        deleteWishList(wishList: WishListModel): ng.IPromise<any>;
        addWishListLine(wishList: WishListModel, product: ProductDto): ng.IPromise<any>;
        deleteLine(line: WishListLineModel): ng.IPromise<WishListModel>;
        patchLine(line: WishListLineModel): ng.IPromise<any>;
        addWishListLineCollection(wishList: WishListModel, products: ProductDto[]): ng.IPromise<any>;
        getWishListSettings(): ng.IPromise<WishListSettingsModel>;
    }

    export class WishListService implements IWishListService {
        serviceUri = this.coreService.getApiUri("/api/v1/wishlists");
        wishListSettingsUri = this.coreService.getApiUri("/api/v1/settings/wishlist");
        cacheKey = "addWishListLineProducts";
        
        static $inject = ["$http", "$q", "coreService", "$localStorage"];

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {

        }

        getWishListCollection(): ng.IPromise<WishListCollectionModel> {
            var deferred = this.$q.defer();

            this.$http.get(this.serviceUri, { bypassErrorInterceptor: true })
                .success((result) => {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        getWishListDetails(wishList: WishListModel): ng.IHttpPromise<WishListModel> {
            var uri = wishList.uri;
            var query: string = uri + "?" + this.coreService.parseParameters(wishList.pagination);
            return this.$http.get(query);
        }

        addWishList(wishListName: string): ng.IPromise<WishListModel> {
            var deferred = this.$q.defer();
            var wishList: string = angular.toJson({ name: wishListName });

            this.$http.post(this.serviceUri, wishList, { bypassErrorInterceptor: true })
                .success((result) => {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        deleteWishList(wishList: WishListModel): ng.IPromise<any> {
            var deferred = this.$q.defer();

            this.$http.delete(wishList.uri)
                .success((result) => {
                    this.getWishListCollection();
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        addWishListLine(wishList: WishListModel, product: ProductDto): ng.IPromise<any> {
            var deferred = this.$q.defer();
            var wishlistLine: any = {};
            wishlistLine.productId = product.id;
            wishlistLine.qtyOrdered = product.qtyOrdered;
            wishlistLine.unitOfMeasure = product.selectedUnitOfMeasure;

            this.$http.post(wishList.wishListLinesUri, wishlistLine, { bypassErrorInterceptor: true })
                .success((result) => {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        deleteLine(line: WishListLineModel): ng.IPromise<WishListModel> {
            var deferred = this.$q.defer();

            this.$http.delete(line.uri)
                .success((result) => {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        patchLine(line: WishListLineModel): ng.IPromise<any> {
            var deferred = this.$q.defer();
            var jsLine: string = angular.toJson(line);

            this.$http({ method: "PATCH", url: line.uri, data: jsLine })
                .success((result) => {
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        addWishListLineCollection(wishList: WishListModel, products: ProductDto[]): ng.IPromise<any> {
            var wishListLineCollection = { wishListLines: this.getWishListLinesFromProducts(products) };
            var deferred = this.$q.defer();

            this.$http.post(wishList.wishListLinesUri + "/batch", wishListLineCollection).success((result: any) => {
                return deferred.resolve(result);

            }).error(deferred.reject);

            return deferred.promise;
        }

        getWishListSettings(): ng.IPromise<WishListSettingsModel> {
            var deferred = this.$q.defer();
            this.$http.get(this.wishListSettingsUri)
                .success((result: WishListSettingsModel) => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }

        protected getWishListLinesFromProducts(products: ProductDto[]): WishListLineModel[] {
            var wishListLineCollection: WishListLineModel[] = [];
            angular.forEach(products, product => {
                wishListLineCollection.push(<WishListLineModel>{
                    productId: product.id,
                    qtyOrdered: product.qtyOrdered,
                    unitOfMeasure: product.selectedUnitOfMeasure
                });
            });
            return wishListLineCollection;
        }
    }

    angular
        .module("insite")
        .service("WishListService", WishListService);
}