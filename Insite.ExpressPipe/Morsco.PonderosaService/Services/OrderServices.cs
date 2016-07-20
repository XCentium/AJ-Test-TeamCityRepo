using System;
using System.Collections.Generic;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Data.Entities;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Repositories;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Services
{

    public class OrderServices: IDisposable
    {
        private readonly OrderRepository _orderRepository = new OrderRepository();

        public OrderHeader SubmitOrder(OrderHeader order)
        {
            return _orderRepository.RunWithRetry<OrderHeader>("SubmitOrder", new object[] { order });
        }

        public OrderHeader UpdateOrder(OrderHeader order, string sessionId)
        {
            return _orderRepository.RunWithRetry<OrderHeader>("UpdateOrder", new object[] { order, sessionId });
        }

        public OrderHeader UpdateOrder(UpdateOrderDto order, List<UpdateOrderItemDto> items , string sessionId)
        {
            return _orderRepository.RunWithRetry<OrderHeader>("UpdateOrder2", new object[] { order, items, sessionId });
        }

        /// <summary>
        /// Call to Ponderosa Tax service to calculate the tax for the customer order
        /// Calculates tax for the customer web order
        /// </summary>
        /// <param name="customerOrder">Customer Order Details</param>
        /// <param name="alternateCustomerSequence">context's ship-to customer sequence.  Can use when we're doing orders with "new" addresses</param>
        /// <returns></returns>
        public decimal CalculateTax(CustomerOrder customerOrder, string alternateCustomerSequence)
        {
            return _orderRepository.RunWithRetry<decimal>("CalculateTax", new object[] { customerOrder, alternateCustomerSequence });
        }

        public OrderHeader LockOrder(string orderNo, string sessionId)
        {
            return _orderRepository.RunWithRetry<OrderHeader>("LockOrder", new object[] { orderNo, sessionId });
        }

        public bool UnlockOrder(string orderNo, string sessionId)
        {
            return _orderRepository.RunWithRetry<bool>("UnlockOrder", new object[] { orderNo, sessionId });
        }

        public HeaderDetailResult GetHeaderDetailResultByOrderNo(string orderNumber)
        {
            return _orderRepository.RunWithRetry<HeaderDetailResult>("GetHeaderDetailResultByOrderNo", new object[] { orderNumber });
        }
        public OrderHeader GetOrderByInvoice(string invoiceNo)
        {
            return _orderRepository.RunWithRetry<OrderHeader>("GetOrderByInvoice", new object[] { invoiceNo });
        }

        public List<OrderHeader> GetOrderHistory(int customerId, DateTime? startDate)
        {
            return _orderRepository.RunWithRetry<List<OrderHeader>>("GetOrderHistory", new object[] { customerId, startDate });
        }

        public List<PriceAvailability> GetPriceAvailability(List<int> productList, Customer billTo, Customer shipTo, IUnitOfWork unitOfWork)
        {
            return _orderRepository.RunWithRetry<List<PriceAvailability>>("GetPriceAvailability", new object[] { productList, billTo, shipTo, unitOfWork });
        }

        public List<PriceAvailability> GetPriceAvailability(List<int> productList, PricingServiceParameter context, IUnitOfWork unitOfWork)
        {
            return _orderRepository.RunWithRetry<List<PriceAvailability>>("GetPriceAvailability", new object[] { productList, context, unitOfWork });
        }

        public void GetChangedOrders(bool onlyChangedOrders, bool excludeBids, DateTime? startDate, DateTime? endDate, int maxIds,
            int flowCount, ResultHandler resultHandler)
        {
            //We originally didn't want to run with retry.  But given Ponderosa issues (should be fixed by mid-aug), Ponderosa suggested we do.

            var result = _orderRepository.RunWithRetry<bool>("GetChangedOrdersStreaming",
                new object[] {onlyChangedOrders, excludeBids, startDate, endDate, maxIds, flowCount, resultHandler});
        }

        /// <summary>
        /// In case we have to clean up any resources
        /// </summary>
        public void Dispose()
        {
            //Deliberately blank
        }
    }
}