using System.Collections.Generic;
using Morsco.PonderosaService.Common;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Entities
{
    public class OrderDetailBase
    {
        protected RowResult _items;

        public int? LineItemId
        {
            get
            {
                return DataUtilities.GetValue<int?>(_items, "Line_Item_ID");
            }
        }

        public string ItemCode { get; set; }

        private IList<string> _description;
        public IList<string> Description
        {
            get
            {
                if (_description == null)
                {
                    _description = DataUtilities.GetListOfStrings(_items, "Description");
                }
                return _description;
            }
            set { _description = value; }
        }

        public OrderDetailBase(){}
        public OrderDetailBase(RowResult items, string itemCode)
        {
            ItemCode = itemCode;
            _items = items;
        }
    }
}