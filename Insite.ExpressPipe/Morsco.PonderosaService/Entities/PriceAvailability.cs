using System.Collections.Generic;
using Morsco.PonderosaService.Common;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Entities
{
    public class PriceAvailability
    {
        private readonly RowResult _items;

        public PriceAvailability()
        {
        }

        public PriceAvailability(RowResult items)
        {
            _items = items;
        }

        public int CustomerId { get; set; }

        public string DefaultWarehouse { get; set; }
        
        //Required Fields
        private int? _productId;
        public int? ProductId 
        {
            get { return _productId ?? DataUtilities.GetValue<int?>(_items, Constants.OrderDetailConstants.Product_ID); }
            set { _productId = value; }
        }

        private decimal? _unitPrice;
        public decimal? UnitPrice
        {
            get { return _unitPrice ?? DataUtilities.GetValue<decimal?>(_items, Constants.PriceAvailabilityConstants.Unit_Price); }
            set { _unitPrice = value; }
        }

        private decimal? _listPrice;
        public decimal? ListPrice
        {
            get { return _listPrice ?? DataUtilities.GetValue<decimal?>(_items, Constants.PriceAvailabilityConstants.List_Price); }
            set { _listPrice = value; }
        }

        private int? _stockQty;
        public int? StockQty
        {
            get { return _stockQty ?? DataUtilities.GetValue<int?>(_items, Constants.PriceAvailabilityConstants.Stock_Qty); }
            set { _stockQty = value; }
        }

        private string _status;
        public string Status
        {
            get { return _status ?? DataUtilities.GetValue<string>(_items, Constants.PriceAvailabilityConstants.Status); }
            set { _status = value; }
        }

        private string _sellUnit;
        public string SellUnit
        {
            get { return _sellUnit ?? DataUtilities.GetValue<string>(_items, Constants.PriceAvailabilityConstants.Sell_Unit); }
            set { _sellUnit = value; }
        }

        private int _sellUnitQty;
        public int SellUnitQty
        {
            get { return _sellUnitQty > 0 ? _sellUnitQty : DataUtilities.GetValue<int>(_items, Constants.PriceAvailabilityConstants.Sell_Unit_Qty); }
            set { _sellUnitQty = value; }
        }

        private int? _pricePer;
        public int? PricePer
        {
            get { return _pricePer ?? DataUtilities.GetValue<int?>(_items, Constants.PriceAvailabilityConstants.Price_Per); }
            set { _pricePer = value; }
        }

        private IList<Dictionary<string, object>> _stockList;
        public IList<Dictionary<string, object>> StockList
        {
            get { return _stockList ?? DataUtilities.GetListOfObjects(_items, Constants.PriceAvailabilityConstants.Stock_List); }
            set { _stockList = value; }
        }
    }
}