/// <reference path="../_typelite/insite.models.d.ts" />
import RequisitionCollectionModel = Insite.Requisition.WebApi.V1.ApiModels.RequisitionCollectionModel;
import RequisitionModel = Insite.Requisition.WebApi.V1.ApiModels.RequisitionModel;
import RequisitionLineModel = Insite.Requisition.WebApi.V1.ApiModels.RequisitionLineModel;

module insite.requisitions {
    "use strict";

    export interface IRequisitionService {
        getRequisitionCollection(pagination: PaginationModel): ng.IHttpPromise<RequisitionCollectionModel>;
        getRequisition(requisitionId: System.Guid): ng.IHttpPromise<RequisitionModel>;
        getRequisitionCount(): ng.IHttpPromise<PaginationModel>;
        patchRequisition(requisition: RequisitionModel): ng.IHttpPromise<RequisitionModel>;
        patchRequisitionLine(requisitionLine: RequisitionLineModel): ng.IHttpPromise<RequisitionModel>;
        deleteRequisitionLine(requisitionLine: RequisitionLineModel): ng.IHttpPromise<RequisitionModel>;
    }

    export class RequisitionService implements IRequisitionService {
        serviceUri = this.coreService.getApiUri("/api/v1/requisitions");

        constructor(protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected coreService: core.ICoreService) {

        }

        getRequisitionCollection(pagination: PaginationModel): ng.IHttpPromise<RequisitionCollectionModel> {
            var uri = this.serviceUri;
            if (pagination) {
                uri += "?currentPage=" + pagination.currentPage + "&pageSize=" + pagination.pageSize;
            }
            uri = uri.replace(/&$/, "");
            return this.$http.get(uri);
        }

        getRequisition(requisitionId: System.Guid): ng.IHttpPromise<RequisitionModel> {
            return this.$http.get(this.serviceUri + "/" + requisitionId + "?expand=requisitionlines");
        }

        getRequisitionCount(): ng.IHttpPromise<PaginationModel> {
            var uri = this.serviceUri + "?pageSize=1";
            return this.$http.get(uri);
        }

        patchRequisition(requisition: RequisitionModel): ng.IHttpPromise<RequisitionModel> {
            return this.$http({ method: "PATCH", url: requisition.uri, data: requisition });
        }

        patchRequisitionLine(requisitionLine: RequisitionLineModel): ng.IHttpPromise<RequisitionModel> {
            return this.$http({ method: "PATCH", url: requisitionLine.uri, data: requisitionLine });
        }

        deleteRequisitionLine(requisitionLine: RequisitionLineModel): ng.IHttpPromise<RequisitionModel> {
            return this.$http.delete(requisitionLine.uri);
        }
    }

    function factory($http: ng.IHttpService, $q: ng.IQService, coreService: core.ICoreService): RequisitionService {
        return new RequisitionService($http, $q, coreService);
    }
    factory.$inject = ["$http", "$q", "coreService"];

    angular
        .module("insite")
        .factory("requisitionService", factory);
}
