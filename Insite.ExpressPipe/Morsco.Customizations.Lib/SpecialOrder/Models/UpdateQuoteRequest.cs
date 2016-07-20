namespace Morsco.Customizations.Lib.SpecialOrder.Models
{
    public class UpdateQuoteRequest
    {
        public string QuoteId { get; set; }

        public string Status { get; set; }
        public string PoNumber { get; set; }
        public string CarrierId { get; set; }
        public string ShipViaId { get; set; }
    }
}
