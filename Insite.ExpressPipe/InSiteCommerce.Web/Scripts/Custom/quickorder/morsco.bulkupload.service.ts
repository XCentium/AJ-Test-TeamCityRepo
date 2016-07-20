/// <reference path="../../../Scripts/App/_typelite/insite.models.d.ts" />
/// <reference path="../../../Scripts/App/core/insite.core.service.ts"/>

module insite.quickorder {
    "use strict";

    export interface IBulkUploadRequest {
		bulkUpload : string;
    }

    export interface IBulkUploadService {
        getBulkUploadProduct(partnumber: string, description: string, quantity: string): ng.IHttpPromise<ProductCollectionModel>;
    }
    
    export class BulkUploadService implements IBulkUploadService {

        serviceUri = this.coreService.getApiUri("/api/morsco/bulkupload");
        constructor(protected $rootScope: ng.IRootScopeService,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {
        }

        getBulkUploadProduct(partnumber: string, description: string, quantity: string): ng.IHttpPromise<ProductCollectionModel> {
            var uri = this.serviceUri;
            var query = "?" + 'partnumber=' + partnumber + '&description=' + description;
            query += '&quantity=' + quantity;
            uri += "/GetBulkUploadProducts";
            uri += query;
            return this.$http.get(uri, { bypassErrorInterceptor: true });
        }

    }

    function factory($rootScope: ng.IRootScopeService, $http: ng.IHttpService, $q: ng.IQService, coreService: core.ICoreService): BulkUploadService {
        return new BulkUploadService($rootScope, $http, $q, coreService);
    }
    factory.$inject = ["$rootScope", "$http", "$q", "coreService"];

    angular
        .module("insite")
        .factory("bulkUploadService", factory);
}
 