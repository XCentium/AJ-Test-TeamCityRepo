using System;
using Morsco.PonderosaService.Constants;

namespace Morsco.PonderosaService.Entities
{
    /// <summary>
    /// Turns out that Ponderosa updates orders and items with a dictionary containing just the changed values
    /// Wrap that dictionary in a more normal object.
    /// </summary>
    public class UpdateOrderItemDto : UpdateDtoBase
    {
        public UpdateOrderItemDto(int? lineItemId, string itemCode, int? productId) : base()
        {
            if (lineItemId.HasValue)
            {
                LineItemId = lineItemId;
            }
            if (!string.IsNullOrWhiteSpace(itemCode))
            {
                ItemCode = itemCode;
            }
            if (productId.HasValue)
            {
                ProductId = productId;
            }
        }

        public int? LineItemId
        {
            get { return GetDictionaryValue<int?>(OrderDetailConstants.Line_Item_ID);}
            set { SetDictionaryValue(value, OrderDetailConstants.Line_Item_ID); }
        }
  
        public string ItemCode
        {
            get { return GetDictionaryValue<String>(OrderDetailConstants.Item_Code, "P");}
            set { SetDictionaryValue(value, OrderDetailConstants.Item_Code); }
        }

        public int? ProductId
        {
            get { return GetDictionaryValue<int?>(OrderDetailConstants.Product_ID);}
            set { SetDictionaryValue(value, OrderDetailConstants.Product_ID); }
        }

        public Decimal? UnitPrice
        {
            get { return GetDictionaryValue<Decimal?>(OrderDetailConstants.Unit_Price); }
            set { SetDictionaryValue(value, OrderDetailConstants.Unit_Price); }
        }
        public int? OrderQty
        {
            get { return GetDictionaryValue<int?>(OrderDetailConstants.Order_Qty);}
            set { SetDictionaryValue(value, OrderDetailConstants.Order_Qty); }
        }

        public string SellUnit
        {
            get { return GetDictionaryValue<string>(OrderDetailConstants.Sell_Unit); }
            set { SetDictionaryValue(value, OrderDetailConstants.Sell_Unit); }
        }

        public bool Delete
        {
            get { return GetDictionaryValue<bool>(OrderDetailConstants.Delete); }
            set { SetDictionaryValue(value, OrderDetailConstants.Delete); }
        }
    }
}
