using System;

namespace Morsco.Customizations.Lib.Ponderosa.Models
{
    public class UpdateQuoteRequest
    {
        public string EclipseOrderNumber { get; set; }
        public DateTime QuoteExpiresDate { get; set; }
        public string QuoteStatus { get; set; }
        public decimal Shipping { get; set; }
        public decimal Handling { get; set; }
        public int EclipseProductForSop { get; set; }
        public decimal QuotePriceForNonCatalogItems { get; set; }
    }
}
