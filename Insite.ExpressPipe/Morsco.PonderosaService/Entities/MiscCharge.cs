using Morsco.PonderosaService.Common;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Entities
{
    public class MiscCharge: OrderDetailBase
	{
        public MiscCharge(RowResult items)
            :base(items, Constants.ItemCode.MiscCharge)
        {
            
		}

		public int? OrderQty {
            get { return DataUtilities.GetValue<int?>(_items, "Order_Qty"); }
        }
		public decimal? UnitPrice { get; set; }
	}
}
