
module insite.customers {
    "use strict";

    export class MorscoCustomerService extends CustomerService {
		serviceUriMin = this.coreService.getApiUri("/api/morsco/billtomin");

        getBillTos(expand?: string, accessToken?: string): ng.IHttpPromise<BillToCollectionModel> {
            var uri = this.serviceUriMin;
            if (expand) {
                uri += '?' + expand;
            }

            if (accessToken) {
                return this.$http.get(uri, { headers: { "Authorization": "Bearer " + accessToken } });
            }
            return this.$http.get(uri);
        }

    }

    angular
        .module("insite")
        .service("customerService", MorscoCustomerService);
}
