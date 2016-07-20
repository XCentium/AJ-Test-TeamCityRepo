namespace Morsco.IntegrationProcessor.Helper
{
    public class ShipmentWhen
    {
        public const string ThisDate = "date";
        public const string ProductAvailable = "available";
        public const string OrderComplete = "complete";
    }

    public class EclipseOrderStatus
    {
        public const string Payment = "$";
        public const string ShipWhenAvailable = "A";
        public const string Bid = "B";
        public const string CallWhenComplete = "C";
        public const string Direct = "D";
        public const string ShipWhenComplete = "H";
        public const string Invoiced = "I";
        public const string CallWhenAvailable = "L";
        public const string ShipItemComplete = "M";
        public const string PickupNow = "P";
        public const string ShipWhenSpecified = "S";
        public const string ShipTicket = "T";
        public const string CallWhenSpecified = "W";
        public const string Cancelled = "X";
        public const string PoHalfOfDirect = "Y";
        public const string Received = "R";
    }

    public class EclipseQuoteStatus
    {
        public const string QuoteRequested = "WEB REQUEST";
        public const string QuoteProposedEditable = "WEB EDIT";
        public const string QuoteProposedNonEditable = "WEB VIEW";
        public const string QuoteProposedInvisible = "INTERNAL";
    }

    public class PaymentMethod
    {
        public const string BillToMyAccount = "Bill To My Account";
        public const string PayByCreditCard = "Pay By Credit Card";
        public const string PayWhenIPickUp = "Pay When I Pick Up";
    }

    public class EclipseTerms
    {
        public const string COD = "COD";
    }
}