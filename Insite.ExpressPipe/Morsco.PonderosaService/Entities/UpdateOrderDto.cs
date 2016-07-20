using System;
using Morsco.PonderosaService.Constants;

namespace Morsco.PonderosaService.Entities
{
    /// <summary>
    /// Turns out that Ponderosa updates orders and items with a dictionary containing just the changed values
    /// Wrap that dictionary in a more normal object.
    /// </summary>
    public class UpdateOrderDto: UpdateDtoBase
    {
        public UpdateOrderDto(string orderNumber, string generation): base()
        {
            OrderNumber = orderNumber;
            Generation = generation;
        }

        public string OrderNumber
        {
            get { return GetDictionaryValue<string>(OrderHeaderConstants.Order_No);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Order_No); }
        }

        public string Generation
        {
            get { return GetDictionaryValue<string>(OrderHeaderConstants.Generation); }
            set { SetDictionaryValue(value, OrderHeaderConstants.Generation); }
        }

        public string SessionId
        {
            get { return GetDictionaryValue<string>(OrderHeaderConstants.Session_ID);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Session_ID); }
        }

        public string OrderStatus
        {
            get { return GetDictionaryValue<string>(OrderHeaderConstants.Order_Status);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Order_Status); }
        }

        public Boolean? RetainLock
        {
            get { return GetDictionaryValue<bool>(OrderHeaderConstants.Retain_Lock);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Retain_Lock); }
        }
 
        public DateTime? BidExpireDate
        {
            get { return GetDictionaryStringAsDate(OrderHeaderConstants.Bid_Expire_Date); }
            set { SetDictionaryValue(value.Value.ToShortDateString(), OrderHeaderConstants.Bid_Expire_Date); }
        }

        public string QuoteStatus
        {
            get { return GetDictionaryValue<string>(OrderHeaderConstants.Quote_Status);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Quote_Status); }
        }

        public Decimal? Freight
        {
            get { return GetDictionaryValue<Decimal?>(OrderHeaderConstants.Freight);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Freight); }
        }

        public Decimal? Handling
        {
            get { return GetDictionaryValue<Decimal?>(OrderHeaderConstants.Handling);}
            set { SetDictionaryValue(value, OrderHeaderConstants.Handling); }
        }
    }
}
