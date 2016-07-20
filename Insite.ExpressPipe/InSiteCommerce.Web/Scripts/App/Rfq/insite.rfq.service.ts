/// <reference path="../_typelite/insite.models.d.ts" />
/// <reference path="../core/insite.core.service.ts"/>

import IRfqService = insite.rfq.IRfqService;
import QuoteModel = Insite.Rfq.WebApi.V1.ApiModels.QuoteModel;
import QuoteLineModel = Insite.Rfq.WebApi.V1.ApiModels.QuoteLineModel;
import PricingRfqModel = Insite.Rfq.WebApi.V1.ApiModels.PricingRfqModel;
import BreakPriceRfqModel = Insite.Rfq.WebApi.V1.ApiModels.BreakPriceRfqModel;
import QuoteSettingsModel = Insite.Rfq.WebApi.V1.ApiModels.QuoteSettingsModel;

module insite.rfq {

     "use strict";

     export interface IRfqService {
         expand: string;
         getQuotes(parameters, pagination: PaginationModel): any;
         getQuote(quoteId): any;
         submitQuote(quoteInfo): any;
         patchQuote(quoteId, quoteInfo): any;
         patchLine(quoteId, quoteLine): any;
         submitRfqMessage(messageInfo): any;
     }

     export class RfqService implements IRfqService {
         expand: string;
         rfqServiceUri = this.coreService.getApiUri("/api/v1/quotes/");
         rfqMessageUri = this.coreService.getApiUri("/api/v1/quotes/{quoteId}/messages/");
         rfqLineServiceUri = this.coreService.getApiUri("/api/v1/quotes/{quoteid}/quotelines/{quotelineid}/");

         static $inject = ["$http", "$q", "coreService"];
         constructor(
             protected $http: ng.IHttpService,
             protected $q: ng.IQService,
             protected coreService: core.ICoreService) {
         }

        getQuotes(parameters, pagination: PaginationModel): any {
             var query = "";
             if (this.expand) {
                 query += "?expand=" + this.expand + "&";
             } else {
                 query = "?";
             }
             if (pagination) {
                 query += "startpage=" + pagination.currentPage + "&pageSize=" + pagination.pageSize + "&";
             }

             query = query + this.coreService.parseParameters(parameters);
             var uri = this.rfqServiceUri + (query !== "?" ? query : "");
             return this.$http.get(uri);
         }

        getQuote(quoteId): any {
            var uri = this.rfqServiceUri + quoteId;
            var deferred = this.$q.defer();
            this.$http.get(uri)
                .success((result : any) => {
                    //this.rfqLineServiceUri = result.quoteLinesUri;
                    return deferred.resolve(result);
                })
                .error(deferred.reject);
            return deferred.promise;
        }

        submitQuote(quoteInfo):any {
            var jsQuoteInfo = angular.toJson(quoteInfo);
            var deferred = this.$q.defer();
            this.$http.post(this.rfqServiceUri, jsQuoteInfo)
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }

        patchQuote(quoteId, quoteInfo): any {
            var uri = this.rfqServiceUri + quoteId;
            var jsQuoteInfo = angular.toJson(quoteInfo);
            var deferred = this.$q.defer();
            this.$http({ method: "PATCH", url: uri, data: jsQuoteInfo })
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }

        patchLine(quoteId, quoteLine): any {
            var jsQuoteLine = angular.toJson(quoteLine);
            var requestUrl = this.rfqLineServiceUri.replace("{quoteid}", quoteId).replace("{quotelineid}", quoteLine.id);

            var deferred = this.$q.defer();
            this.$http({ method: "PATCH", url: requestUrl, data: jsQuoteLine })
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }

        submitRfqMessage(messageInfo): any {
            var deferred = this.$q.defer();
            var url = this.rfqMessageUri.replace("{quoteId}", messageInfo.quoteId);
            this.$http.post(url, messageInfo)
                .success(result => deferred.resolve(result))
                .error(deferred.reject);
            return deferred.promise;
        }
     }

     angular
         .module("insite")
         .service("rfqService", RfqService);
 }