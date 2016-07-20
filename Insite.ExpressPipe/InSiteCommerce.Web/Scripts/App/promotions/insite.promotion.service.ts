import PromotionModel = Insite.Promotions.WebApi.V1.ApiModels.PromotionModel;
import PromotionCollectionModel = Insite.Promotions.WebApi.V1.ApiModels.PromotionCollectionModel;
module insite.promotions {
    "use strict";

    export interface IPromotionService {
        applyCartPromotion(cartId: string, promotion): ng.IHttpPromise<any>;
        getCartPromotions(cartId: string): ng.IHttpPromise<PromotionCollectionModel>;
    }

    export class PromotionService implements IPromotionService {

        static $inject = ["$http", "coreService"];

        constructor(
            protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {
        }

        getCartPromotions(cartId: string): ng.IHttpPromise<PromotionCollectionModel> {
            var promotionsUri = this.coreService.getApiUri("/api/v1/carts/" + cartId + "/promotions");
            return this.$http.get(promotionsUri);
        }

        applyCartPromotion(cartId: string, promotion): ng.IHttpPromise<any> {
            var promotionsUri = this.coreService.getApiUri("/api/v1/carts/" + cartId + "/promotions");
            return this.$http.post(promotionsUri, promotion);
        }
    }

    angular
        .module("insite")
        .service("promotionService", PromotionService);
}