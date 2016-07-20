module insite_admin {
    "use strict";

    export class CustomerOrderDetailsController extends EntityDetailsController {
        discountsPromotions;
        orderGrandTotal;
        orderSubTotal;
        shippingAndHandling;
        totalTax;
        promotionOrderDiscountTotal;
        promotionProductDiscountTotal;
        promotionShippingDiscountTotal;
        products = {};

        init() {
            this.expandProperties = ["orderLines($expand=customProperties,orderLineConfigurationValues)", "customProperties"];
            super.init();
        }

        loadModel(): ng.IPromise<any> {
            return super.loadModel().then(() => {
                this.calculateOrderLinesTotals();
                this.loadProductImages();
            });
        }

        calculateOrderLinesTotals() {
            this.$http.get(`/api/v1/admin/customerOrders(${this.model.id})/totals`).then((model: any) => {
                this.orderGrandTotal = model.data.orderGrandTotal;
                this.orderSubTotal = model.data.orderSubTotal;
                this.shippingAndHandling = model.data.shippingAndHandling;
                this.totalTax = model.data.totalTax;
                this.promotionOrderDiscountTotal = model.data.promotionOrderDiscountTotal;
                this.promotionProductDiscountTotal = model.data.promotionProductDiscountTotal;
                this.promotionShippingDiscountTotal = model.data.promotionShippingDiscountTotal;
            });
        }

        loadProductImages() {
            if (!this.model.orderLines) {
                return;
            }

            var productIds = this.model.orderLines.map(ol => ol.productId).filter(pid => !!pid);
            if (productIds.length === 0) {
                return;
            }

            var filters = productIds.map(pid => `id eq ${pid}`);
            this.$http.get(`/api/v1/admin/products?$filter=${filters.join(" or ")}&$select=id,smallImagePath,erpNumber`).success((entities: any) => {
                if (entities.value.length === 0) {
                    return;
                }

                entities.value.forEach(pr => {
                    this.model.orderLines.forEach(ol => {
                        if (ol.productId === pr.id) {
                            this.products[ol.productId] = {
                                imagePath: pr.smallImagePath,
                                productNumber: pr.erpNumber
                            }
                        }
                    });
                });
            });
        }

        getCustomPropertyDisplay(customProperty: any): string {
            if (customProperty.value && customProperty.value.indexOf("<ConfigDataSet>") > -1) {
                var parsedConfigDocument = $.parseXML(customProperty.value);
                return `${$(parsedConfigDocument).find("SectionName").first().text()} - ${$(parsedConfigDocument).find("Description").first().text()}`;
            }

            return `${customProperty.name} - ${customProperty.value}`;
        }
    }

    angular
        .module("insite-admin")
        .controller("CustomerOrderDetailsController", CustomerOrderDetailsController);
}