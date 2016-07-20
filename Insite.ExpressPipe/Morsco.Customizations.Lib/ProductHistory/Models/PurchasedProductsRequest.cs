namespace Morsco.Customizations.Lib.ProductHistory.Models
{
    public class PurchasedProductsRequest
    {
        public PurchasedProductsRequest()
        {
            PerPage = 8;
            Page = 1;
            SearchTerm = string.Empty;
        }

        public int PerPage { get; set; }
        
        public string SearchTerm { get; set; }

        public int Page { get; set; }
    }
}
