using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Insite.ExpressPipe.PonderosaService.Entities;
using Insite.ExpressPipe.PonderosaService.Builders;
using Ponderosa.U2mv;

namespace Insite.ExpressPipe.PonderosaService
{
    public class OrderService : BaseService
    {
        public OrderService() : base()
        { }

        public OrderHeader SubmitOrder(OrderHeader order)
        {
            if (order == null)
            {
                throw new ArgumentException("Order is required");
            }

            var builder = new OrderBuilder();
            BuildOrderRequest request = builder.CreateOrderRequest(order);

            var connection = ConnectionPool.GetConnection();
            var submitResult = connection.SubmitHeaderDetail(Constants.ServiceConstants.SubmitOrder, request.OrderHeader, request.OrderDetail);
            var newOrder = builder.CreateOrderObj(submitResult);
            return newOrder;
        }

        private void SubmitOrder()
        {
        }

    }
}