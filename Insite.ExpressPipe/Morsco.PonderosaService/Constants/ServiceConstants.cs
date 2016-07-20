namespace Morsco.PonderosaService.Constants
{
    public static class ServiceConstants
    {
        public static readonly string SubmitOrder = "SUBMIT_ORDER";
        public static readonly string OrderHistory = "ORDER_HISTORY";
        public static readonly string UpdateOrder = "UPDATE_ORDER";
        public static readonly string CalculateTax = "CALC_TAX";
        public static readonly string TaxAmount = "Tax_Amount";
        public static readonly string UnlockOrder = "UNLOCK_ORDER";
        public static readonly string LockOrder = "LOCK_ORDER";
        public static readonly string OrderInquiry = "ORDER";
        public static readonly string OrderInvoice = "INVOICE";
        public static readonly string PriceAvailability = "PRODUCT_PRICE_AVAIL";
        public static readonly string OrderStream = "ORDER_STREAM";
        public static readonly string Warehouse = "Warehouse";

        public static readonly string CustomerId = "Customer_ID";
        public static readonly string StartDate = "Start_Date";

        public static readonly string GetCustomerStream = "CUSTOMER_STREAM";

		public const string ActivityName = "EclipseOrderLoad";
    }

    public static class ItemCode
    {
        //Guessing about the description of the first item
        public static readonly string Product = "P";
        public static readonly string StdLineItem = "L";
        public static readonly string Comment = "C";
        public static readonly string MiscCharge = "M";
    }

    public static class OrderUpdateConstants
    {
        public const string OrderHeaderFileName = "OrderHeaderFileName";
        public const string OrderDetailFileName = "OrderDetailFileName";
        public const string ChangedOrdersToGet = "ChangedOrdersToGet";
        public const string FlowCount = "FlowCount";

    }
}