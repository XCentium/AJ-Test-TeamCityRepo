using System;
using System.Collections.Generic;
using Morsco.PonderosaService.Common;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Entities
{
    public class OrderItem : OrderDetailBase
    {
        public OrderItem()
        {
            ItemCode = Constants.ItemCode.Product;
        }

        public OrderItem(RowResult items)
            :base(items, Constants.ItemCode.Product)
        { }

        //Required Fields
        private int? _productId = null;
        public int? ProductId
        {
            get { return _productId != null ? _productId : DataUtilities.GetValue<int?>(_items, Constants.OrderDetailConstants.Product_ID); }
            set { _productId = value; }
        }

        private int? _orderQty = null;
        public int? OrderQty
        {
            get { return _orderQty != null ? _orderQty : DataUtilities.GetValue<int?>(_items, Constants.OrderDetailConstants.Order_Qty); }
            set { _orderQty = value; }
        }

        private int? _shipQty = null;
        public int? ShipQty
        {
            get { return _shipQty != null ? _shipQty : DataUtilities.GetValue<int?>(_items, Constants.OrderDetailConstants.Ship_Qty); }
            set { _shipQty = value; }
        }

        private decimal? _unitPrice = null;
        public decimal? UnitPrice
        {
            get { return _unitPrice != null ? _unitPrice : DataUtilities.GetValue<decimal?>(_items, Constants.OrderDetailConstants.Unit_Price); }
            set { _unitPrice = value; }
        }

        //Typically set
        private string _sellUnit = null;
        public string SellUnit
        {
            get { return _sellUnit != null ? _sellUnit : DataUtilities.GetValue<string>(_items, Constants.OrderDetailConstants.Sell_Unit); }
            set { _sellUnit = value; }
        }

        private int _sellUnitQty = 0;
        public int SellUnitQty
        {
            get { return _sellUnitQty > 0 ? _sellUnitQty : DataUtilities.GetValue<int>(_items, Constants.OrderDetailConstants.Sell_Unit_Qty); }
            set { _sellUnitQty = value; }
        }

        public string ShipQtyAlpha
        {
            get { return DataUtilities.GetValue<string>(_items, Constants.OrderDetailConstants.Ship_Qty_Alpha); }
        }

        //Optional
        private bool _descOverride = false;
        public bool DescOverride
        {
            get { return _descOverride ? _descOverride : string.IsNullOrEmpty(DataUtilities.GetValue<string>(_items, Constants.OrderDetailConstants.Description)) ? false : true; }
            set { _descOverride = value; }
        }

        public string Upc
        {
            get { return DataUtilities.GetValue<string>(_items, Constants.OrderDetailConstants.UPC); }
        }

        private string _itemReleaseNo = null;
        public string ItemReleaseNo
        {
            get { return _itemReleaseNo != null ? _itemReleaseNo : DataUtilities.GetValue<string>(_items, Constants.OrderDetailConstants.Item_Release_No); }
            set { _itemReleaseNo = value; }
        }

        //Only usable if PDW support is provided
        public int? PdwId
        {
            get { return DataUtilities.GetValue<int?>(_items, Constants.OrderDetailConstants.PDW_ID); }
        }

        public DateTime? AvailableDate
        {
            get { return DataUtilities.GetValue<DateTime>(_items, Constants.OrderDetailConstants.Available_Date); }
        }
        public int? AvailableQty
        {
            get { return DataUtilities.GetValue<int>(_items, Constants.OrderDetailConstants.Available_Qty); }
        }

        public IList<string> SerialNumbers
        {
            get { return DataUtilities.GetListOfStrings(_items, Constants.OrderDetailConstants.Serial_Numbers); }
        }
    }
}