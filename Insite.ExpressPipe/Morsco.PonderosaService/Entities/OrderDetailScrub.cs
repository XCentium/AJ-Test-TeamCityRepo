namespace Morsco.PonderosaService.Entities
{
    public class OrderDetailScrub
	{
		public string OrderNo { get; set; }
		public string Generation { get; set; }
		public string ItemCode {get; set;}
		public string Description {get; set;}
		public string LineItemId {get; set;}
		public string ProductId {get; set;}
		public string PdwId {get; set;}
		public string DescAsStored {get; set;}
		public string Upc {get; set;}
		public int OrderQty {get; set;}
		public decimal UnitPrice {get; set;}
		public string SellUnit {get; set;}
		public int SellUnitQty {get; set;}
		public string ItemReleaseNo {get; set;}
		public int ShipQty {get; set;}
		public string ShipQtyAlpha {get; set;}
		public string SerialNumbers {get; set;}
		public string AvailableDate {get; set;}
		public int AvailableQty {get; set;}
		public decimal SubtotalAmt {get; set;}
		public string SubtotalLineItemId {get; set;}

	}
}
