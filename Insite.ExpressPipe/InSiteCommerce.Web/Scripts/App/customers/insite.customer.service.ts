import BillToCollectionModel = Insite.Customers.WebApi.V1.ApiModels.BillToCollectionModel;
import BillToModel = Insite.Customers.WebApi.V1.ApiModels.BillToModel;
import ShipToCollectionModel = Insite.Customers.WebApi.V1.ApiModels.ShipToCollectionModel;
import ShipToModel = Insite.Customers.WebApi.V1.ApiModels.ShipToModel;

module insite.customers {
    "use strict";

    export interface ICustomerService {
        addOrUpdateShipTo(shipTo: ShipToModel): ng.IHttpPromise<any>;
        getBillTo(expand: string): ng.IHttpPromise<BillToModel>;
        getBillTos(expand?: string, accessToken?: string): ng.IHttpPromise<BillToCollectionModel>;
        getShipTo(expand: string): ng.IHttpPromise<ShipToModel>;
        getShipTos(expand?: string): ng.IHttpPromise<ShipToCollectionModel>;
        updateBillTo(billTo: BillToModel): ng.IHttpPromise<BillToModel>;
        updateEnforcementLevel(billTo: BillToModel): ng.IHttpPromise<BillToModel>;
    }

    export class CustomerService implements ICustomerService {

        serviceUri = this.coreService.getApiUri("/api/v1/billtos");

        static $inject = ["$http", "coreService"];

        constructor(protected $http: ng.IHttpService,
            protected coreService: core.ICoreService) {

        }

        getBillTos(expand?: string, accessToken?: string): ng.IHttpPromise<BillToCollectionModel> {
            var uri = this.serviceUri;
            if (expand) {
                uri += "?expand=" + expand;
            }
            if (accessToken) {
                return this.$http.get(uri, { headers: { "Authorization": "Bearer " + accessToken } });
            }
            return this.$http.get(uri);
        }

        getBillTo(expand: string): ng.IHttpPromise<BillToModel> {
            var uri = this.serviceUri + "/current";
            if (expand) {
                uri += "?expand=" + expand;
            }
            return this.$http.get(uri);
        }

        updateBillTo(billTo: BillToModel): ng.IHttpPromise<BillToModel> {
            var patchBillTo = <BillToModel>{};
            angular.extend(patchBillTo, billTo);
            delete patchBillTo.shipTos;
            delete patchBillTo.budgetEnforcementLevel;
            return this.$http({ method: "PATCH", url: patchBillTo.uri, data: patchBillTo });
        }

        updateEnforcementLevel(billTo: BillToModel): ng.IHttpPromise<BillToModel> {
            return this.$http({ method: "PATCH", url: billTo.uri, data: billTo });
        }

        getShipTos(expand?: string): ng.IHttpPromise<ShipToCollectionModel> {
            var uri = this.serviceUri + "/current/shiptos";
            if (expand) {
                uri += "?expand=" + expand;
            }
            return this.$http.get(uri);
        }

        getShipTo(expand: string): ng.IHttpPromise<ShipToModel> {
            var uri = this.serviceUri + "/current/shiptos/current";
            if (expand) {
                uri += "?expand=" + expand;
            }
            return this.$http.get(uri);
        }

        // Could return string or ShipToModel depending if you are adding or updating
        addOrUpdateShipTo(shipTo: ShipToModel): ng.IHttpPromise<any> {
            var patchShipTo = <ShipToModel>{};
            angular.extend(patchShipTo, shipTo);
            var operation = "PATCH";
            if (patchShipTo.isNew) {
                operation = "POST";
                patchShipTo.uri = this.serviceUri + "/current/shiptos";
            }
            return this.$http({ method: operation, url: patchShipTo.uri, data: patchShipTo });
        }
    }

    angular
        .module("insite")
        .service("customerService", CustomerService);
}
